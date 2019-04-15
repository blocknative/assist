import { state, updateState } from './state'

export function addTransactionToQueue(txObject) {
  const { transactionQueue } = state
  return [...transactionQueue, txObject]
}

export function removeTransactionFromQueue(id) {
  const { transactionQueue } = state
  const newQueueState = transactionQueue.filter(
    txObj => txObj.transaction.id !== id
  )

  updateState({ transactionQueue: newQueueState })
}

export function updateTransactionInQueue(id, update) {
  const txObject = getTxObjFromQueue(id)
  txObject.transaction = Object.assign(txObject.transaction, update)

  return txObject
}

export function getTxObjFromQueue(id) {
  const { transactionQueue } = state
  return transactionQueue.find(txObj => txObj.transaction.id === id)
}

export function isDuplicateTransaction({ value, to }) {
  const { transactionQueue } = state

  return Boolean(
    transactionQueue.find(
      txObj => txObj.transaction.value === value && txObj.transaction.to === to
    )
  )
}

export function getTransactionsAwaitingApproval() {
  const { transactionQueue } = state
  return transactionQueue.filter(
    txObj => txObj.transaction.status === 'awaitingApproval'
  )
}

export function isTransactionAwaitingApproval(id) {
  const txObj = getTxObjFromQueue(id)
  return txObj && txObj.transaction.status === 'awaitingApproval'
}
