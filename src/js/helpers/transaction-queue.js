import { state, updateState } from './state'
import { argsEqual } from './utilities'

export function addTransactionToQueue(txObject) {
  const { transactionQueue } = state
  const newQueueState = [...transactionQueue, txObject]
  updateState({ transactionQueue: newQueueState })

  return newQueueState
}

export function removeTransactionFromQueue(id) {
  const { transactionQueue } = state
  const newQueueState = transactionQueue.filter(
    txObj => txObj.transaction.id !== id
  )
  updateState({ transactionQueue: newQueueState })

  return newQueueState
}

export function updateTransactionInQueue(id, update) {
  const txObj = getTxObjFromQueue(id)
  txObj.transaction = Object.assign(txObj.transaction, update)

  return txObj
}

export function getTxObjFromQueue(id) {
  const { transactionQueue } = state
  return transactionQueue.find(txObj => txObj.transaction.id === id)
}

export function isDuplicateTransaction({ value, to }, contract = {}) {
  const { transactionQueue } = state

  return Boolean(
    transactionQueue.find(txObj => {
      const { methodName, parameters } = contract

      if (
        methodName === (txObj.contract && txObj.contract.methodName) &&
        argsEqual(parameters, txObj.contract && txObj.contract.parameters)
      ) {
        return txObj.transaction.value === value && txObj.transaction.to === to
      }

      return false
    })
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
