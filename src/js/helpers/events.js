import { state } from './state'
import eventToUI from '../views/event-to-ui'
import { networkName, timeouts } from './utilities'
import { getTxObjFromQueue } from './transaction-queue'
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

  // If tx status is 'completed', UI has been already handled
  if (eventCode === 'txConfirmed' || eventCode === 'txConfirmedClient') {
    const txObj = getTxObjFromQueue(eventObj.transaction.id)

    if (txObj.transaction.status === 'completed') {
      return
    }
  }

  // Show UI
  if (state.config && !state.config.headlessMode) {
    eventToUI[categoryCode] &&
      eventToUI[categoryCode][eventCode] &&
      eventToUI[categoryCode][eventCode](eventObj, clickHandlers)
  }
}

// Create event log to be sent to server
export function createEventLog(eventObj) {
  const { dappId, networkId, headlessMode } = state.config
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
        headlessMode,
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
