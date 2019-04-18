import { state } from 'js/helpers/state'
import { handleEvent } from 'js/helpers/events'
import {
  hasSufficientBalance,
  waitForTransactionReceipt,
  getTransactionParams
} from 'js/helpers/web3'
import {
  timeouts,
  extractMessageFromError,
  createTransactionId,
  handleError
} from 'js/helpers/utilities'
import {
  addTransactionToQueue,
  removeTransactionFromQueue,
  updateTransactionInQueue,
  getTxObjFromQueue,
  isDuplicateTransaction,
  getTransactionsAwaitingApproval,
  isTransactionAwaitingApproval
} from 'js/helpers/transaction-queue'

import { prepareForTransaction } from './user'

function sendTransaction(
  categoryCode,
  txOptions = {},
  sendTransactionMethod,
  callback,
  inlineCustomMsgs,
  contractMethod,
  contractEventObj
) {
  return new Promise(async (resolve, reject) => {
    // Make sure user is onboarded and ready to transact
    await prepareForTransaction('activePreflight').catch(
      handleError({ resolve, reject, callback })
    )

    // make sure that we have from address in txOptions
    if (!txOptions.from) {
      txOptions.from = state.accountAddress
    }

    const transactionId = createTransactionId()

    const transactionParams = await getTransactionParams(
      txOptions,
      contractMethod,
      contractEventObj
    )

    const transactionEventObj = {
      id: transactionId,
      gas: transactionParams.gas.toString(),
      gasPrice: transactionParams.gasPrice.toString(),
      value: transactionParams.value.toString(),
      to: txOptions.to,
      from: txOptions.from
    }

    const sufficientBalance = await hasSufficientBalance(transactionParams)

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

    if (state.legacyWeb3) {
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
    } else {
      txPromise
        .on('transactionHash', async hash => {
          onTxHash(transactionId, hash, categoryCode)

          resolve(hash)
          callback && callback(null, hash)
        })
        .on('receipt', async () => {
          onTxReceipt(transactionId, categoryCode)
        })
        .on('error', async errorObj => {
          onTxError(transactionId, errorObj, categoryCode)
          handleError({ resolve, reject, callback })(errorObj)
        })
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

    if (
      txObj &&
      txObj.transaction.status !== 'pending' &&
      state.socketConnection
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
