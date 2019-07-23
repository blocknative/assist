import uuid from 'uuid/v4'
import { handleEvent } from './events'
import { state } from './state'

// Nice time format
export function formatTime(number) {
  const time = new Date(number)
  return time.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

// notificationPosition can be a string, or an object containing
// 'mobile' and 'desktop' keys. Return the correct notificationPosition
// based on the current config and user environment
export function getNotificationsPosition() {
  const defaults = {
    mobile: 'top',
    desktop: 'bottomRight'
  }
  const { mobileDevice } = state
  const { notificationsPosition } = state.config.style

  // Default on desktop is bottom right, mobile top
  if (!notificationsPosition)
    return mobileDevice ? defaults.mobile : defaults.desktop

  // If notificationsPosition is a string (old API), use the value only on desktop
  if (typeof notificationsPosition === 'string') {
    return mobileDevice ? defaults.mobile : notificationsPosition
  }

  // If notificationsPosition is an object, set the val based on the user environment
  return mobileDevice
    ? notificationsPosition.mobile || defaults.mobile
    : notificationsPosition.desktop || defaults.desktop
}

export function timeString(time) {
  const seconds = Math.floor(time / 1000)
  return seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds} sec`
}

export function capitalize(str) {
  const first = str.slice(0, 1)
  const rest = str.slice(1)
  return `${first.toUpperCase()}${rest}`
}

export function formatNumber(num) {
  // if already bignumber instance return it
  if (typeof num === 'object') return num
  const numString = String(num)
  if (numString.includes('+')) {
    let exponent = Number(numString.split('+')[1])
    // non firefox limits precision to 21
    if (exponent >= 21) {
      exponent = 20
      num = 1e20
    }
    const precision = exponent + 1

    return num.toPrecision(precision)
  }

  return num
}

function last(arr) {
  return [...arr].reverse()[0]
}

function takeLast(arr) {
  // mutates original array
  return arr.splice(arr.length - 1, 1)[0]
}

export function first(arr) {
  return arr[0]
}

function takeFirst(arr) {
  // mutates original arr
  return arr.splice(0, 1)[0]
}

export function createTransactionId() {
  return uuid()
}

export function separateArgs(allArgs, argsLength) {
  const allArgsCopy = [...allArgs]
  const methodArgs = argsLength ? allArgsCopy.splice(0, argsLength) : []

  const notificationOptions =
    typeof last(allArgsCopy) === 'object' &&
    (last(allArgsCopy).messages || last(allArgsCopy).clickHandlers) &&
    takeLast(allArgsCopy)

  const callback =
    typeof last(allArgsCopy) === 'function' && takeLast(allArgsCopy)

  const txOptions =
    typeof first(allArgsCopy) === 'object' && first(allArgsCopy) !== null
      ? takeFirst(allArgsCopy)
      : {}

  const defaultBlock = first(allArgsCopy)

  return {
    callback,
    methodArgs,
    txOptions,
    defaultBlock,
    notificationOptions
  }
}

export function argsEqual(args1, args2) {
  return JSON.stringify(args1) === JSON.stringify(args2)
}

export function getOverloadedMethodKeys(inputs) {
  return inputs.map(input => input.type).join(',')
}

export function assistLog(log) {
  console.log('Assist:', log) // eslint-disable-line no-console
}

export function extractMessageFromError(message) {
  const str = message.split('"message":')[1]
  return str.split('"')[1]
}

export function eventCodeToType(eventCode) {
  switch (eventCode) {
    case 'txRequest':
    case 'txPending':
    case 'txSent':
    case 'txStall':
    case 'txSpeedUp':
    case 'txCancel':
    case 'pending':
      return 'progress'
    case 'txSendFail':
    case 'txFailed':
    case 'nsfFail':
    case 'txRepeat':
    case 'txAwaitingApproval':
    case 'txConfirmReminder':
    case 'error':
      return 'failed'
    case 'txConfirmed':
    case 'txConfirmedClient':
    case 'success':
      return 'complete'
    default:
      return undefined
  }
}

export function eventCodeToStep(eventCode) {
  switch (eventCode) {
    case 'mobileBlocked':
      return 'mobile'
    case 'browserFail':
      return 'browser'
    case 'mobileWalletFail':
      return 'mobileWallet'
    case 'mobileNetworkFail':
      return 'mobileNetwork'
    case 'mobileWalletEnable':
      return 'mobileWalletEnable'
    case 'welcomeUser':
      return 0
    case 'walletFail':
      return 1
    case 'walletLogin':
    case 'walletLoginEnable':
      return 2
    case 'walletEnable':
      return 3
    case 'networkFail':
    case 'contractQueryFail':
      return 4
    case 'nsfFail':
      return 5
    case 'newOnboardComplete':
      return 6
    default:
      return undefined
  }
}

export function networkName(id) {
  switch (id) {
    case 1:
      return 'main'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    case 'localhost':
      return 'localhost'
    default:
      return 'local'
  }
}

export const timeouts = {
  checkSocketConnection: 250,
  waitForResponse: 100,
  txConfirmReminder: 20000,
  txStall: 30000,
  changeUI: 305,
  localhostNetworkCheck: 300,
  removeElement: 300,
  endOfEventQueue: 0,
  hideElement: 200,
  showElement: 120,
  autoRemoveNotification: 4000,
  pollForReceipt: 1000,
  swipeTime: 250,
  lockScreen: 500
}

export function stepToImageKey(step) {
  switch (step) {
    case 0:
      return 'welcome'
    case 6:
      return 'complete'
    default:
      return null
  }
}

export function handleError(handlers = {}) {
  return (errorObj, receipt) => {
    const { callback, reject, resolve, promiEvent } = handlers

    if (promiEvent) {
      promiEvent.emit('error', errorObj, receipt)
      promiEvent.reject(errorObj)
      resolve()

      return
    }

    if (callback) {
      callback(errorObj)
      resolve()

      return
    }

    reject(errorObj)
  }
}

export function handleWeb3Error(errorObj) {
  const { message } = errorObj
  handleEvent({
    eventCode: 'errorLog',
    categoryCode: 'web3',
    reason: message || errorObj
  })
}

export function truffleContractUsesWeb3v1(contractObj) {
  return (
    contractObj.constructor &&
    contractObj.constructor.web3 &&
    contractObj.constructor.web3.version &&
    contractObj.constructor.web3.version.substring(0, 1) === '1'
  )
}
