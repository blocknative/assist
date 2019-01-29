import { state, updateState } from './state'
import { handleEvent } from './events'
import { storeItem, getItem } from './storage'
import {
  getTransactionObj,
  removeTransactionFromQueue,
  nowInTxPool,
  assistLog
} from './utilities'

// Create websocket connection
export function openWebsocketConnection() {
  updateState({ pendingSocketConnection: true })

  let socket
  try {
    socket = new WebSocket('wss://api.blocknative.com/v0')
  } catch (errorObj) {
    assistLog(errorObj)
  }

  socket.addEventListener('message', handleSocketMessage)
  socket.addEventListener('close', () =>
    updateState({ socketConnection: false })
  )
  socket.addEventListener('error', () => {
    updateState({ pendingSocketConnection: false })
  })
  socket.addEventListener('open', () => {
    updateState({
      socket,
      socketConnection: true,
      pendingSocketConnection: false
    })

    handleEvent({
      categoryCode: 'initialize',
      eventCode: 'checkDappId',
      connectionId: getItem('connectionId')
    })
  })
}

// Handle in coming socket messages
export function handleSocketMessage(msg) {
  const { status, reason, event, connectionId } = JSON.parse(msg.data)
  const { validApiKey, supportedNetwork } = state
  if (!validApiKey || !supportedNetwork) {
    return
  }

  // handle any errors from the server
  if (status === 'error') {
    if (
      reason.includes('not a valid API key') &&
      event.eventCode !== 'initFail'
    ) {
      updateState({ validApiKey: false })

      handleEvent({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason
      })

      const errorObj = new Error(reason)
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    if (
      reason.includes('network not supported') &&
      event.eventCode !== 'initFail'
    ) {
      updateState({ supportedNetwork: false })

      handleEvent({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason
      })

      const errorObj = new Error(reason)
      errorObj.eventCode = 'initFail'
      throw errorObj
    }
  }

  if (status === 'ok' && event && event.eventCode === 'checkDappId') {
    handleEvent({ eventCode: 'initSuccess', categoryCode: 'initialize' })
    updateState({ validApiKey: true, supportedNetwork: true })
  }

  if (
    connectionId &&
    (!state.connectionId || connectionId !== state.connectionId)
  ) {
    storeItem('connectionId', connectionId)
    updateState({ connectionId })
  }

  if (event && event.transaction) {
    const { transaction } = event
    if (transaction.status) {
      const txObj = getTransactionObj(transaction.hash)
      switch (transaction.status) {
        case 'pending':
          nowInTxPool(transaction.hash)
          handleEvent({
            eventCode: 'txPending',
            categoryCode: 'activeTransaction',
            transaction: txObj.transaction,
            contract: txObj.contract
          })
          break
        case 'confirmed':
          handleEvent({
            eventCode: 'txConfirmed',
            categoryCode: 'activeTransaction',
            transaction: txObj.transaction,
            contract: txObj.contract
          })
          updateState({
            transactionQueue: removeTransactionFromQueue(
              txObj.transaction.nonce
            )
          })
          break
        case 'failed':
          handleEvent({
            eventCode: 'txFailed',
            categoryCode: 'activeTransaction',
            transaction: txObj.transaction,
            contract: txObj.contract
          })
          break
        default:
      }
    }
  }
}
