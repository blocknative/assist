import eventToUI from '~/js/views/event-to-ui'

import { state } from './state'
import { networkName } from './utilities'
import { getTxObjFromQueue } from './transaction-queue'
import { checkForSocketConnection, retryLogEvent } from './websockets'
import { getItem } from './storage'
import { removeUnwantedNotifications } from '../views/dom'

export function handleEvent(eventObj, modalClickHandlers) {
  const { eventCode, categoryCode, transaction } = eventObj
  const { handleNotificationEvent, headlessMode } = state.config || {}
  const serverEvent =
    eventCode === 'txPending' ||
    eventCode === 'txConfirmed' ||
    eventCode === 'txFailed' ||
    eventCode === 'txSpeedUp' ||
    eventCode === 'txCancel'

  const notificationEvent = eventCode.includes('tx') || eventCode === 'nsfFail'

  let eventToLog = { ...eventObj }

  // If dealing with a custom notification the logged event
  // should have it's event and category code changed
  if (categoryCode === 'userInitiatedNotify') {
    eventToLog = {
      ...eventToLog,
      categoryCode: 'custom',
      eventCode: 'notification'
    }
  }

  // Log everything that isn't a server event
  !serverEvent && lib.logEvent(eventToLog)

  let showNotification = true

  if (notificationEvent) {
    showNotification =
      handleNotificationEvent &&
      typeof handleNotificationEvent === 'function' &&
      categoryCode !== 'userInitiatedNotify'
        ? handleNotificationEvent(eventObj)
        : true

    if (!showNotification && !headlessMode) {
      removeUnwantedNotifications(eventCode, transaction.id)
    }
  }

  // If tx status is 'completed', UI has been already handled
  if (eventCode === 'txConfirmed' || eventCode === 'txConfirmedClient') {
    const txObj = getTxObjFromQueue(eventObj.transaction.id)

    if (txObj.transaction.status === 'completed') {
      return
    }
  }

  // Show UI
  if (!headlessMode && showNotification) {
    eventToUI[categoryCode] &&
      eventToUI[categoryCode][eventCode] &&
      eventToUI[categoryCode][eventCode](eventObj, modalClickHandlers)
  }
}

// Create event log to be sent to server
export function createEventLog(eventObj) {
  const { dappId, networkId, headlessMode } = state.config || {}
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
  checkForSocketConnection().then(
    connected => !connected && retryLogEvent(() => logEvent(eventObj))
  )
}

export const lib = {
  handleEvent,
  createEventLog,
  logEvent
}
