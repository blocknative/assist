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

function sendTransaction({
  categoryCode,
  txOptions = {},
  sendMethod,
  callback,
  inlineCustomMsgs,
  contractObj,
  methodName,
  overloadKey,
  methodArgs,
  promiEvent
}) {
  return new Promise(async (resolve, reject) => {
    const {
      legacyWeb3,
      currentProvider,
      accountAddress,
      accountBalance,
      config: { truffleContract, ethers, minimumBalance }
    } = state

    // Get information like gasPrice and gas
    const transactionParams = await getTransactionParams({
      txOptions,
      contractObj,
      methodName,
      overloadKey,
      args: methodArgs
    })

    const contractEventObj = {
      methodName,
      parameters: methodArgs
    }

    // Check user is ready to make the transaction
    const [sufficientBalance, ready] = await Promise.all([
      hasSufficientBalance(transactionParams),
      prepareForTransaction('activePreflight').catch(
        handleError({ resolve, reject, callback })
      )
    ])

    if (!ready) {
      return
    }

    // Make sure that we have from address in txOptions
    // @NOTE - ethers.js errors if you add a from address, but web3.js errors if you don't
    if (!ethers && !txOptions.from) {
      txOptions.from = state.accountAddress
    }

    const transactionId = createTransactionId()
    const transactionEventObj = {
      id: transactionId,
      gas: transactionParams.gas.toString(),
      gasPrice: transactionParams.gasPrice.toString(),
      value: transactionParams.value.toString(),
      to: txOptions.to,
      from: state.accountAddress
    }

    if (sufficientBalance === false) {
      handleEvent({
        eventCode: 'nsfFail',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
        contract: contractEventObj,
        inlineCustomMsgs,
        wallet: {
          provider: currentProvider,
          address: accountAddress,
          balance: accountBalance,
          minimum: minimumBalance
        }
      })

      const errorObj = new Error(
        'User has insufficient funds to complete transaction'
      )
      errorObj.eventCode = 'nsfFail'

      handleError({ resolve, reject, callback })(errorObj)
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
          provider: currentProvider,
          address: accountAddress,
          balance: accountBalance,
          minimum: minimumBalance
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
          provider: currentProvider,
          address: accountAddress,
          balance: accountBalance,
          minimum: minimumBalance
        }
      })
    }

    let txPromise

    if (legacyWeb3 || truffleContract || ethers) {
      if (contractObj) {
        txPromise = sendMethod(...methodArgs, txOptions)
      } else {
        txPromise = sendMethod(txOptions)
      }
    } else {
      txPromise = sendMethod(txOptions)
    }

    handleEvent({
      eventCode: 'txRequest',
      categoryCode,
      transaction: transactionEventObj,
      contract: contractEventObj,
      inlineCustomMsgs,
      wallet: {
        provider: currentProvider,
        address: accountAddress,
        balance: accountBalance,
        minimum: minimumBalance
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
            provider: currentProvider,
            address: accountAddress,
            balance: accountBalance,
            minimum: minimumBalance
          }
        })
      }
    }, timeouts.txConfirmReminder)

    if (legacyWeb3) {
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
    } else if (truffleContract) {
      txPromise
        .then(async txObj => {
          const hash = txObj.tx
          onTxHash(transactionId, hash, categoryCode)

          const receipt = await waitForTransactionReceipt(hash)
          onTxReceipt(transactionId, categoryCode)
          resolve({ receipt })
          callback && callback(null, receipt)
        })
        .catch(errorObj => {
          onTxError(transactionId, errorObj, categoryCode)
          handleError({ resolve, reject, callback })(errorObj)
        })
    } else if (ethers) {
      txPromise
        .then(async tx => {
          onTxHash(transactionId, tx.hash, categoryCode)
          resolve(tx)
          callback && callback(null, tx)

          await tx.wait()
          onTxReceipt(transactionId, categoryCode)
        })
        .catch(errorObj => {
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
