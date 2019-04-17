import { state, updateState } from './state'

export function getItem(item) {
  let storageItem
  try {
    storageItem = window.localStorage && window.localStorage.getItem(item)
  } catch (errorObj) {
    return 'null'
  }
  return storageItem
}

export function storeItem(item, value) {
  try {
    window.localStorage && window.localStorage.setItem(item, value)
  } catch (errorObj) {
    return 'null'
  }
  return 'success'
}

export function removeItem(item) {
  try {
    window.localStorage && window.localStorage.removeItem(item)
  } catch (errorObj) {
    return 'null'
  }
  return 'success'
}

export function storeTransactionQueue() {
  const { transactionQueue } = state
  if (transactionQueue.length > 0) {
    const pendingTransactions = transactionQueue.filter(
      txObj =>
        txObj.transaction.status === 'approved' ||
        txObj.transaction.status === 'pending'
    )
    storeItem('transactionQueue', JSON.stringify(pendingTransactions))
  }
}

export function getTransactionQueueFromStorage() {
  const transactionQueue = getItem('transactionQueue')
  if (transactionQueue) {
    const parsedQueue = JSON.parse(transactionQueue)
    const filteredQueue = parsedQueue.filter(
      txObj => Date.now() - txObj.transaction.startTime < 150000
    )
    updateState({
      transactionQueue: [...filteredQueue, ...state.transactionQueue]
    })
    removeItem('transactionQueue')
  }
}
