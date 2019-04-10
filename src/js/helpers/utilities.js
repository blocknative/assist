import uuid from 'uuid/v4'
import { state } from './state'
import { handleEvent } from './events'

export function addTransactionToQueue(txObject) {
  const { transactionQueue } = state
  return [...transactionQueue, txObject]
}

export function removeTransactionFromQueue(txNonce) {
  const { transactionQueue } = state
  return transactionQueue.filter(txObj => txObj.transaction.nonce !== txNonce)
}

export function checkTransactionQueue(txNonce) {
  const { transactionQueue } = state
  return transactionQueue.find(txObj => txObj.transaction.nonce === txNonce)
}

export function getTransactionObj(txHash) {
  const { transactionQueue } = state
  return transactionQueue.find(txObj => txObj.transaction.hash === txHash)
}

export function nowInTxPool(txHash) {
  const { transactionQueue } = state
  const txObj = transactionQueue.find(
    txObj => txObj.transaction.hash === txHash
  )
  txObj.transaction.inTxPool = true
}

export function isDuplicateTransaction({ value, to }) {
  const { transactionQueue } = state

  return transactionQueue.find(
    txObj => txObj.transaction.value === value && txObj.transaction.to === to
  )
}

// Nice time format
export function formatTime(number) {
  const time = new Date(number)
  return time.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

export function timeString(time) {
  const seconds = Math.floor(time / 1000)
  return seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds} sec`
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

export function separateArgs(allArgs, argsLength) {
  const allArgsCopy = [...allArgs]
  const args = argsLength ? allArgsCopy.splice(0, argsLength) : []

  const inlineCustomMsgs =
    typeof last(allArgsCopy) === 'object' &&
    last(allArgsCopy).messages &&
    takeLast(allArgsCopy).messages

  const callback =
    typeof last(allArgsCopy) === 'function' && takeLast(allArgsCopy)

  const txObject =
    typeof first(allArgsCopy) === 'object' && first(allArgsCopy) !== null
      ? takeFirst(allArgsCopy)
      : {}

  const defaultBlock = first(allArgsCopy)

  return {
    callback,
    args,
    txObject,
    defaultBlock,
    inlineCustomMsgs
  }
}

export function getOverloadedMethodKeys(inputs) {
  return inputs.map(input => input.type).join(',')
}

export function assistLog(log) {
  console.log('Assist:', log) // eslint-disable-line no-console
}

export function handleError(categoryCode, propagateError) {
  return errorObj => {
    const { message } = errorObj
    handleEvent({
      eventCode: 'errorLog',
      categoryCode,
      reason: message || errorObj
    })

    propagateError && propagateError(errorObj)
  }
}

export function createTransactionId() {
  return uuid()
}

export function capitalize(str) {
  const first = str.slice(0, 1)
  const rest = str.slice(1)
  return `${first.toUpperCase()}${rest}`
}

export function formatNumber(num) {
  const numString = String(num)
  if (numString.includes('+')) {
    const exponent = numString.split('+')[1]
    const precision = Number(exponent) + 1
    return num.toPrecision(precision)
  }
  return num
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
      return 'progress'
    case 'txSendFail':
    case 'txStall':
    case 'txFailed':
    case 'nsfFail':
    case 'txRepeat':
    case 'txAwaitingApproval':
    case 'txConfirmReminder':
      return 'failed'
    case 'txConfirmed':
    case 'txConfirmedClient':
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
  switch (Number(id)) {
    case 1:
      return 'main'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
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
  pollForReceipt: 1000
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
