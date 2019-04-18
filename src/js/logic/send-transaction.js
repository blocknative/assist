import { state, updateState } from 'js/helpers/state'
import { handleEvent } from 'js/helpers/events'
import {
  hasSufficientBalance,
  getNonce,
  waitForTransactionReceipt,
  getTransactionParams
} from 'js/helpers/web3'
import {
  isDuplicateTransaction,
  checkTransactionQueue,
  removeTransactionFromQueue,
  getTransactionObj,
  addTransactionToQueue,
  timeouts,
  extractMessageFromError,
  handleWeb3Error,
  createTransactionId,
  handleError
} from 'js/helpers/utilities'

import { prepareForTransaction } from './user'

function inferNonce() {
  return new Promise(async resolve => {
    const currentNonce = await getNonce(state.accountAddress).catch(
      handleWeb3Error
    )

    const pendingTransactions =
      (state.transactionQueue && state.transactionQueue.length) || 0

    resolve(pendingTransactions + currentNonce)
  })
}

function sendTransaction(
  categoryCode,
  txObject = {},
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

    // make sure that we have from address in txObject
    if (!txObject.from) {
      txObject.from = state.accountAddress
    }

    const transactionId = createTransactionId()

    const transactionParams = await getTransactionParams(
      txObject,
      contractMethod,
      contractEventObj
    )

    const transactionEventObj = {
      id: transactionId,
      gas: transactionParams.gas.toString(),
      gasPrice: transactionParams.gasPrice.toString(),
      value: transactionParams.value.toString(),
      to: txObject.to,
      from: txObject.from
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

    const duplicateTransaction = isDuplicateTransaction(transactionEventObj)

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

    if (state.transactionAwaitingApproval) {
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
          txObject
        )
      } else {
        txPromise = sendTransactionMethod(txObject)
      }
    } else {
      txPromise = sendTransactionMethod(txObject)
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

    updateState({ transactionAwaitingApproval: true })

    let rejected
    let confirmed

    // Check if user has confirmed transaction after 20 seconds
    setTimeout(async () => {
      const nonce = await inferNonce()

      if (!checkTransactionQueue(nonce) && !rejected && !confirmed) {
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
        .then(txHash => {
          confirmed = true

          handleTxHash(txHash, {
            transactionEventObj,
            categoryCode,
            contractEventObj,
            inlineCustomMsgs
          })

          callback && callback(null, txHash)

          return waitForTransactionReceipt(txHash).then(receipt => {
            handleTxReceipt(receipt, {
              transactionEventObj,
              categoryCode,
              contractEventObj,
              inlineCustomMsgs
            })
          })
        })
        .catch(errorObj => {
          rejected = true

          handleTxError(errorObj, {
            transactionEventObj,
            categoryCode,
            contractEventObj,
            inlineCustomMsgs
          })

          handleError({ resolve, reject, callback })(errorObj)
        })
    } else {
      txPromise
        .on('transactionHash', txHash => {
          confirmed = true
          resolve(txHash)

          handleTxHash(txHash, {
            transactionEventObj,
            categoryCode,
            contractEventObj,
            inlineCustomMsgs
          })

          callback && callback(null, txHash)
        })
        .on('receipt', receipt => {
          handleTxReceipt(receipt, {
            transactionEventObj,
            categoryCode,
            contractEventObj,
            inlineCustomMsgs
          })
        })
        .on('error', errorObj => {
          rejected = true

          handleTxError(errorObj, {
            transactionEventObj,
            categoryCode,
            contractEventObj,
            inlineCustomMsgs
          })

          handleError({ resolve, reject, callback })(errorObj)
        })
    }
  })
}

async function handleTxHash(txHash, meta) {
  const nonce = await inferNonce()
  const {
    transactionEventObj,
    categoryCode,
    contractEventObj,
    inlineCustomMsgs
  } = meta

  onResult(
    transactionEventObj,
    nonce,
    categoryCode,
    contractEventObj,
    txHash,
    inlineCustomMsgs
  )
}

async function handleTxReceipt(receipt, meta) {
  const { transactionHash } = receipt
  const nonce = await inferNonce()
  const txObj = getTransactionObj(transactionHash)

  const {
    transactionEventObj,
    categoryCode,
    contractEventObj,
    inlineCustomMsgs
  } = meta

  handleEvent({
    eventCode: 'txConfirmedClient',
    categoryCode,
    transaction:
      (txObj && txObj.transaction) ||
      Object.assign({}, transactionEventObj, {
        hash: transactionHash,
        nonce
      }),
    contract: contractEventObj,
    inlineCustomMsgs,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  updateState({
    transactionQueue: removeTransactionFromQueue(
      (txObj && txObj.transaction.nonce) || nonce
    )
  })
}

async function handleTxError(error, meta) {
  const { message } = error

  let errorMsg
  try {
    errorMsg = extractMessageFromError(message)
  } catch (error) {
    errorMsg = 'User denied transaction signature'
  }

  const eventCode =
    errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail'

  const nonce = await inferNonce()

  const {
    transactionEventObj,
    categoryCode,
    contractEventObj,
    inlineCustomMsgs
  } = meta

  handleEvent({
    eventCode,
    categoryCode,
    transaction: Object.assign({}, transactionEventObj, {
      nonce
    }),
    inlineCustomMsgs,
    contract: contractEventObj,
    reason: errorMsg,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  updateState({ transactionAwaitingApproval: false })
}

// On result handler
function onResult(
  transactionEventObj,
  nonce,
  categoryCode,
  contractEventObj,
  hash,
  inlineCustomMsgs
) {
  const transaction = Object.assign({}, transactionEventObj, {
    hash,
    nonce,
    startTime: Date.now(),
    txSent: true,
    inTxPool: false
  })

  handleEvent({
    eventCode: 'txSent',
    categoryCode,
    transaction,
    contract: contractEventObj,
    inlineCustomMsgs,
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  updateState({
    transactionQueue: addTransactionToQueue({
      contract: contractEventObj,
      transaction
    }),
    transactionAwaitingApproval: false
  })

  // Check if transaction is in txPool
  setTimeout(() => {
    const transactionObj = getTransactionObj(transaction.hash)
    if (
      transactionObj &&
      !transactionObj.transaction.inTxPool &&
      state.socketConnection
    ) {
      handleEvent({
        eventCode: 'txStall',
        categoryCode,
        transaction,
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
  }, timeouts.txStall)
}

export default sendTransaction
