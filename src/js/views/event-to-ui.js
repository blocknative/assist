import { state } from '../helpers/state'
import { getItem } from '../helpers/storage'
import {
  openModal,
  createElement,
  notSupportedModal,
  onboardModal,
  getById,
  getByQuery,
  getAllByQuery,
  removeNotification,
  createTransactionBranding,
  notificationContent,
  showElement,
  setContainerHeight,
  startTimerInterval,
  removeAllNotifications
} from './dom'

import { setupIframe } from '../helpers/iframe'

import { transactionMsgs } from './content'
import {
  formatTime,
  eventCodeToStep,
  eventCodeToType,
  timeouts,
  assistLog
} from '../helpers/utilities'

const eventToUI = {
  initialize: {
    mobileBlocked: notSupportedUI
  },
  onboard: {
    browserFail: notSupportedUI,
    mobileBlocked: notSupportedUI,
    welcomeUser: onboardingUI,
    walletFail: onboardingUI,
    walletLogin: onboardingUI,
    walletLoginEnable: onboardingUI,
    walletEnable: onboardingUI,
    networkFail: onboardingUI,
    nsfFail: onboardingUI,
    newOnboardComplete: onboardingUI
  },
  activePreflight: {
    mobileBlocked: notSupportedUI,
    welcomeUser: onboardingUI,
    walletFail: onboardingUI,
    walletLogin: onboardingUI,
    walletLoginEnable: onboardingUI,
    walletEnable: onboardingUI,
    networkFail: onboardingUI,
    nsfFail: notificationsUI,
    newOnboardComplete: onboardingUI,
    txRepeat: notificationsUI
  },
  activeTransaction: {
    txAwaitingApproval: notificationsUI,
    txRequest: notificationsUI,
    txSent: notificationsUI,
    txPending: notificationsUI,
    txSendFail: notificationsUI,
    txConfirmReminder: notificationsUI,
    txConfirmed: notificationsUI,
    txConfirmedClient: notificationsUI,
    txStall: notificationsUI,
    txFailed: notificationsUI
  },
  activeContract: {
    txAwaitingApproval: notificationsUI,
    txRequest: notificationsUI,
    txSent: notificationsUI,
    txPending: notificationsUI,
    txSendFail: notificationsUI,
    txConfirmReminder: notificationsUI,
    txConfirmed: notificationsUI,
    txConfirmedClient: notificationsUI,
    txStall: notificationsUI,
    txFailed: notificationsUI
  }
}

function notSupportedUI(eventObj, handlers) {
  const existingModal = state.iframeDocument.querySelector(
    '.bn-onboard-modal-shade'
  )

  if (existingModal) {
    return
  }

  const { eventCode } = eventObj
  const modal = createElement(
    'div',
    'bn-onboard-modal-shade',
    notSupportedModal(eventCodeToStep(eventCode))
  )
  openModal(modal, handlers)
}

function onboardingUI(eventObj, handlers) {
  const existingModal = state.iframeDocument.querySelector(
    '.bn-onboard-modal-shade'
  )

  if (existingModal) {
    return
  }

  const { eventCode } = eventObj
  const newUser = getItem('_assist_newUser') === 'true'
  const type = newUser ? 'basic' : 'advanced'

  const modal = createElement(
    'div',
    'bn-onboard-modal-shade',
    onboardModal(type, eventCodeToStep(eventCode))
  )
  openModal(modal, handlers)
}

function getCustomTxMsg(eventCode, data) {
  const msgFunc =
    state.config.messages &&
    typeof state.config.messages[eventCode] === 'function' &&
    state.config.messages[eventCode]

  if (!msgFunc) return undefined

  try {
    const customMsg = msgFunc(data)
    if (typeof customMsg === 'string') {
      return customMsg
    }
    assistLog('Custom transaction message callback must return a string')

    return undefined
  } catch (error) {
    assistLog(
      `An error was thrown from custom transaction callback message for the ${eventCode} event: `
    )
    assistLog(error)

    return undefined
  }
}

const eventCodesNoRepeat = ['nsfFail', 'txSendFail', 'txUnderPriced']

function notificationsUI(eventObj) {
  const { transaction = {}, contract = {}, eventCode } = eventObj
  const { id, startTime } = transaction
  const type = eventCodeToType(eventCode)
  const timeStamp = formatTime(Date.now())
  const message =
    getCustomTxMsg(eventCode, { transaction, contract }) ||
    transactionMsgs[eventCode]({ transaction, contract })

  const hasTimer =
    eventCode === 'txPending' ||
    eventCode === 'txSent' ||
    eventCode === 'txStall'
  const showTime =
    hasTimer || eventCode === 'txConfirmed' || eventCode === 'txFailed'

  let blockNativeBrand
  let existingNotifications
  let notificationsList
  let notificationsScroll
  let notificationsContainer = getById('blocknative-notifications')

  if (notificationsContainer) {
    existingNotifications = true
    notificationsList = getByQuery('.bn-notifications')

    // remove all notifications we don't want to repeat
    removeAllNotifications(
      eventCodesNoRepeat.reduce(
        (acc, eventCode) => [
          ...acc,
          ...Array.from(getAllByQuery(`.bn-${eventCode}`))
        ],
        []
      )
    )

    // We want to keep the txRepeat notification if the new notification is a txRequest or txConfirmReminder
    const keepTxRepeatNotification =
      eventCode === 'txRequest' || eventCode === 'txConfirmReminder'

    const notificationsWithSameId = keepTxRepeatNotification
      ? Array.from(getAllByQuery(`.bn-${id}`)).filter(
          n => !n.classList.contains('bn-txRepeat')
        )
      : Array.from(getAllByQuery(`.bn-${id}`))

    // if notification with the same id we can remove it to be replaced with new status
    removeAllNotifications(notificationsWithSameId)
  } else {
    existingNotifications = false
    notificationsContainer = createElement(
      'div',
      null,
      null,
      'blocknative-notifications'
    )
    blockNativeBrand = createTransactionBranding()
    notificationsList = createElement('ul', 'bn-notifications')
    notificationsScroll = createElement('div', 'bn-notifications-scroll')
  }

  const notification = createElement(
    'li',
    `bn-notification bn-${type} bn-${eventCode} bn-${id}`,
    notificationContent(type, message, { startTime, showTime, timeStamp })
  )

  notificationsList.appendChild(notification)

  if (!existingNotifications) {
    notificationsScroll.appendChild(notificationsList)
    notificationsContainer.appendChild(notificationsScroll)
    notificationsContainer.appendChild(blockNativeBrand)
    state.iframeDocument.body.appendChild(notificationsContainer)
    showElement(notificationsContainer, timeouts.showElement)
  }

  setupIframe(notificationsList)
  setContainerHeight()
  showElement(notification, timeouts.showElement)

  let intervalId
  if (hasTimer) {
    setTimeout(() => {
      intervalId = startTimerInterval(id, startTime)
    }, timeouts.changeUI)
  }

  const dismissButton = notification.querySelector('.bn-status-icon')
  dismissButton.onclick = () => {
    intervalId && clearInterval(intervalId)
    removeNotification(notification)
  }

  if (type === 'complete') {
    setTimeout(
      () => removeNotification(notification),
      timeouts.autoRemoveNotification
    )
  }
}

export default eventToUI
