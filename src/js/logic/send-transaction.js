import { state } from '~/js/helpers/state'
import { handleEvent } from '~/js/helpers/events'
import {
  hasSufficientBalance,
  waitForTransactionReceipt,
  getTransactionParams
} from '~/js/helpers/web3'
import {
  timeouts,
  extractMessageFromError,
  createTransactionId,
  handleError
} from '~/js/helpers/utilities'
import {
  addTransactionToQueue,
  removeTransactionFromQueue,
  updateTransactionInQueue,
  getTxObjFromQueue,
  isDuplicateTransaction,
  getTransactionsAwaitingApproval,
  isTransactionAwaitingApproval
} from '~/js/helpers/transaction-queue'

import { prepareForTransaction } from './user'

function sendTransaction(
  categoryCode,
  txOptions = {},
  sendTransactionMethod,
  callback,
  inlineCustomMsgs,
  contractMethod,
  contractEventObj,
  promiEvent
) {
  return new Promise(async (resolve, reject) => {
    // Get information like gasPrice and gas
    const transactionParams = await getTransactionParams(
      txOptions,
      contractMethod,
      contractEventObj
    )

    // Check user is ready to make the transaction
    const [sufficientBalance, ready] = await Promise.all([
      hasSufficientBalance(transactionParams),
      prepareForTransaction('activePreflight').catch(
        handleError({ resolve, reject, callback, promiEvent })
      )
    ])

    if (!ready) {
      return
    }

    // Make sure that we have from address in txOptions
    if (!txOptions.from) {
      txOptions.from = state.accountAddress
    }

    const transactionId = createTransactionId()
    const transactionEventObj = {
      id: transactionId,
      gas: transactionParams.gas.toString(),
      gasPrice: transactionParams.gasPrice.toString(),
      value: transactionParams.value.toString(),
      to: txOptions.to,
      from: txOptions.from
    }

    if (sufficientBalance === false) {
      handleEvent({
        eventCode: 'nsfFail',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
        contract: contractEventObj,
        inlineCustomMsgs,
        wallet: {
          provider: state.currentProvider,
          address: state.accountAddress,
          balance: state.accountBalance,
          minimum: state.config.minimumBalance
        }
      })

      const errorObj = new Error(
        'User has insufficient funds to complete transaction'
      )
      errorObj.eventCode = 'nsfFail'

      handleError({ resolve, reject, callback, promiEvent })(errorObj)
      return
    }

    const duplicateTransaction = isDuplicateTransaction(
      transactionEventObj,
      contractEventObj
    )

    if (duplicateTransaction) {
      handleEvent({
        eventCode: 'txRepeat',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
        contract: contractEventObj,
        inlineCustomMsgs,
        wallet: {
          provider: state.currentProvider,
          address: state.accountAddress,
          balance: state.accountBalance,
          minimum: state.config.minimumBalance
        }
      })
    }

    if (getTransactionsAwaitingApproval().length > 0) {
      handleEvent({
        eventCode: 'txAwaitingApproval',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
        contract: contractEventObj,
        inlineCustomMsgs,
        wallet: {
          provider: state.currentProvider,
          address: state.accountAddress,
          balance: state.accountBalance,
          minimum: state.config.minimumBalance
        }
      })
    }

    let txPromise

    if (state.legacyWeb3 || state.config.truffleContract) {
      if (contractEventObj) {
        txPromise = sendTransactionMethod(
          ...contractEventObj.parameters,
          txOptions
        )
      } else {
        txPromise = sendTransactionMethod(txOptions)
      }
    } else {
      txPromise = sendTransactionMethod(txOptions)
    }

    handleEvent({
      eventCode: 'txRequest',
      categoryCode,
      transaction: transactionEventObj,
      contract: contractEventObj,
      inlineCustomMsgs,
      wallet: {
        provider: state.currentProvider,
        address: state.accountAddress,
        balance: state.accountBalance,
        minimum: state.config.minimumBalance
      }
    })

    addTransactionToQueue({
      transaction: Object.assign({}, transactionEventObj, {
        status: 'awaitingApproval'
      }),
      contract: contractEventObj,
      inlineCustomMsgs
    })

    // Check if user has confirmed transaction after 20 seconds
    setTimeout(async () => {
      if (isTransactionAwaitingApproval(transactionId)) {
        handleEvent({
          eventCode: 'txConfirmReminder',
          categoryCode,
          transaction: transactionEventObj,
          contract: contractEventObj,
          inlineCustomMsgs,
          wallet: {
            provider: state.currentProvider,
            address: state.accountAddress,
            balance: state.accountBalance,
            minimum: state.config.minimumBalance
          }
        })
      }
    }, timeouts.txConfirmReminder)

    if (state.legacyWeb3) {
      txPromise
        .then(hash => {
          onTxHash(transactionId, hash, categoryCode)

          resolve(hash)
          callback && callback(null, hash)

          return waitForTransactionReceipt(hash).then(() => {
            onTxReceipt(transactionId, categoryCode)
          })
        })
        .catch(async errorObj => {
          onTxError(transactionId, errorObj, categoryCode)
          handleError({ resolve, reject, callback })(errorObj)
        })
    } else if (state.config.truffleContract) {
      txPromise
        .then(async txObj => {
          const hash = txObj.tx
          onTxHash(transactionId, hash, categoryCode)

          const receipt = await waitForTransactionReceipt(hash)
          onTxReceipt(transactionId, categoryCode)
          resolve({ receipt })
          callback && callback(null, receipt)
        })
        .catch(async errorObj => {
          onTxError(transactionId, errorObj, categoryCode)
          handleError({ resolve, reject, callback })(errorObj)
        })
    } else {
      new Promise(confirmed => {
        /* In web3 v1 instead of resolving the promise returned by sendTransaction
         * we need to setup the promiEvent argument to mirror the behavior of the
         * promiEvent returned by web3 when we call .send on the contract method.
         */

        txPromise
          .on('transactionHash', hash => {
            promiEvent.emit('transactionHash', hash)
            onTxHash(transactionId, hash, categoryCode)
            callback && callback(null, hash)
          })
          .on('receipt', receipt => {
            promiEvent.emit('receipt', receipt)
            confirmed(receipt)
          })
          .once('confirmation', confirmed)
          .on('confirmation', (confirmation, receipt) => {
            promiEvent.emit('confirmation', confirmation, receipt)
          })
          .on('error', errorObj => {
            promiEvent.emit('error', errorObj)
            onTxError(transactionId, errorObj, categoryCode)
            handleError({ resolve, reject, callback })(errorObj)
          })
          .then(promiEvent.resolve)
          .catch(promiEvent.reject)
      }).then(() => onTxReceipt(transactionId, categoryCode))
    }
  })
}

function onTxHash(id, hash, categoryCode) {
  const txObj = updateTransactionInQueue(id, {
    status: 'approved',
    hash,
    startTime: Date.now()
  })

  handleEvent({
    eventCode: 'txSent',
    categoryCode,
    transaction: txObj.transaction,
    contract: txObj.contract,
    inlineCustomMsgs: txObj.inlineCustomMsgs,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  // Check if transaction is in txPool after timeout
  setTimeout(() => {
    const txObj = getTxObjFromQueue(id)
    if (!txObj) return

    const {
      transaction: { status }
    } = txObj

    if (
      state.socketConnection &&
      (status === 'approved' || status === 'pending')
    ) {
      updateTransactionInQueue(id, { status: 'stalled' })

      handleEvent({
        eventCode: 'txStall',
        categoryCode,
        transaction: txObj.transaction,
        contract: txObj.contract,
        inlineCustomMsgs: txObj.inlineCustomMsgs,
        wallet: {
          provider: state.currentProvider,
          address: state.accountAddress,
          balance: state.accountBalance,
          minimum: state.config.minimumBalance
        }
      })
    }
  }, timeouts.txStall)
}

async function onTxReceipt(id, categoryCode) {
  let txObj = getTxObjFromQueue(id)

  if (txObj.transaction.status === 'confirmed') {
    txObj = updateTransactionInQueue(id, { status: 'completed' })
  } else {
    txObj = updateTransactionInQueue(id, { status: 'confirmed' })
  }

  handleEvent({
    eventCode: 'txConfirmedClient',
    categoryCode,
    transaction: txObj.transaction,
    contract: txObj.contract,
    inlineCustomMsgs: txObj.inlineCustomMsgs,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  if (txObj.transaction.status === 'completed') {
    removeTransactionFromQueue(id)
  }
}

function onTxError(id, error, categoryCode) {
  const { message } = error
  let errorMsg
  try {
    errorMsg = extractMessageFromError(message)
  } catch (error) {
    errorMsg = 'User denied transaction signature'
  }

  const txObj = updateTransactionInQueue(id, { status: 'rejected' })

  handleEvent({
    eventCode:
      errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail',
    categoryCode,
    transaction: txObj.transaction,
    contract: txObj.contract,
    inlineCustomMsgs: txObj.inlineCustomMsgs,
    reason: errorMsg,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  removeTransactionFromQueue(id)
}

export default sendTransaction
