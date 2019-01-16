import { state } from './state'
import eventToUI from '../views/event-to-ui'
import { networkName, timeouts, getTransactionObj } from './utilities'
import { openWebsocketConnection } from './websockets'
import { getItem } from './storage'

export function handleEvent(eventObj, clickHandlers) {
  const { eventCode, categoryCode } = eventObj
  const serverEvent =
    eventCode === 'txPending' ||
    eventCode === 'txConfirmed' ||
    eventCode === 'txFailed'

  // If not a server event then log it
  !serverEvent && lib.logEvent(eventObj)

  // if the tx is not in the queue then it has been previously confirmed
  // so just return and don't show UI
  if (eventCode === 'txConfirmed' || eventCode === 'txConfirmedClient') {
    const inTxQueue = getTransactionObj(eventObj.transaction.hash)
    if (!inTxQueue) {
      return
    }
  }

  // Show UI
  eventToUI[categoryCode] &&
    eventToUI[categoryCode][eventCode] &&
    eventToUI[categoryCode][eventCode](eventObj, clickHandlers)
}

// Create event log to be sent to server
export function createEventLog(eventObj) {
  const { dappId, networkId } = state.config
  const { userAgent, version } = state
  const newUser = getItem('_assist_newUser') === 'true'
  return JSON.stringify(
    Object.assign(
      {},
      {
        timeStamp: new Date(),
        dappId,
        version,
        userAgent,
        newUser,
        blockchain: {
          system: 'ethereum',
          network: networkName(networkId)
        }
      },
      eventObj
    )
  )
}

// Log events to server
export function logEvent(eventObj) {
  const eventLog = createEventLog(eventObj)
  const { socket, socketConnection } = state

  socketConnection && socket.send(eventLog)

  // Need to check if connection dropped
  // as we don't know until after we try to send a message
  setTimeout(() => {
    if (!state.socketConnection) {
      if (!state.pendingSocketConnection) {
        openWebsocketConnection()
      }

      setTimeout(() => {
        logEvent(eventObj)
      }, timeouts.checkSocketConnection)
    }
  }, timeouts.checkSocketConnection)
}

export const lib = {
  handleEvent,
  createEventLog,
  logEvent
}
