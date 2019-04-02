import { state, updateState } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import { prepareForTransaction } from './user'
import {
  hasSufficientBalance,
  getNonce,
  waitForTransactionReceipt,
  getTransactionParams
} from '../helpers/web3'
import {
  isDuplicateTransaction,
  checkTransactionQueue,
  removeTransactionFromQueue,
  getTransactionObj,
  addTransactionToQueue,
  timeouts,
  extractMessageFromError,
  handleError,
  createTransactionId
} from '../helpers/utilities'

function inferNonce() {
  return new Promise(async (resolve, reject) => {
    const currentNonce = await getNonce(state.accountAddress).catch(
      handleError('web3', reject)
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
  contractMethod,
  contractEventObj
) {
  return new Promise(async (resolve, reject) => {
    // Make sure user is onboarded and ready to transact
    await prepareForTransaction('activePreflight').catch(reject)

    // make sure that we have from address in txObject
    if (!txObject.from) {
      txObject.from = state.accountAddress
    }

    const transactionId = createTransactionId()

    const transactionParams = await getTransactionParams(
      txObject,
      contractMethod,
      contractEventObj
    ).catch(reject)

    const transactionEventObj = {
      id: transactionId,
      gas: transactionParams.gas.toString(),
      gasPrice: transactionParams.gasPrice.toString(),
      value: transactionParams.value.toString(),
      to: txObject.to,
      from: txObject.from
    }

    const sufficientBalance = await hasSufficientBalance(
      transactionParams
    ).catch(reject)

    if (!sufficientBalance) {
      handleEvent({
        eventCode: 'nsfFail',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
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
      reject(errorObj)
      return
    }

    const duplicateTransaction = isDuplicateTransaction(transactionEventObj)

    if (duplicateTransaction) {
      handleEvent({
        eventCode: 'txRepeat',
        categoryCode: 'activePreflight',
        transaction: transactionEventObj,
        contract: contractEventObj,
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

    resolve(txPromise)

    handleEvent({
      eventCode: 'txRequest',
      categoryCode,
      transaction: transactionEventObj,
      contract: contractEventObj,
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
      const nonce = await inferNonce().catch(reject)

      if (!checkTransactionQueue(nonce) && !rejected && !confirmed) {
        handleEvent({
          eventCode: 'txConfirmReminder',
          categoryCode,
          transaction: transactionEventObj,
          contract: contractEventObj,
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

          handleTxHash(
            txHash,
            { transactionEventObj, categoryCode, contractEventObj },
            reject
          )

          callback && callback(null, txHash)

          return waitForTransactionReceipt(txHash).then(receipt => {
            handleTxReceipt(
              receipt,
              { transactionEventObj, categoryCode, contractEventObj },
              reject
            )
          })
        })
        .catch(async errorObj => {
          rejected = handleTxError(
            errorObj,
            { transactionEventObj, categoryCode, contractEventObj },
            reject
          )
          callback && callback(errorObj)
        })
    } else {
      txPromise
        .on('transactionHash', async txHash => {
          confirmed = true

          handleTxHash(
            txHash,
            { transactionEventObj, categoryCode, contractEventObj },
            reject
          )
          callback && callback(null, txHash)
        })
        .on('receipt', async receipt => {
          handleTxReceipt(
            receipt,
            { transactionEventObj, categoryCode, contractEventObj },
            reject
          )
        })
        .on('error', async errorObj => {
          rejected = true

          handleTxError(
            errorObj,
            { transactionEventObj, categoryCode, contractEventObj },
            reject
          )
          callback && callback(errorObj)
        })
    }
  })
}

async function handleTxHash(txHash, meta, reject) {
  const nonce = await inferNonce().catch(reject)
  const { transactionEventObj, categoryCode, contractEventObj } = meta

  onResult(transactionEventObj, nonce, categoryCode, contractEventObj, txHash)
}

async function handleTxReceipt(receipt, meta, reject) {
  const { transactionHash } = receipt
  const txObj = getTransactionObj(transactionHash)
  const nonce = await inferNonce().catch(reject)
  const { transactionEventObj, categoryCode, contractEventObj } = meta

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

async function handleTxError(error, meta, reject) {
  const { message } = error
  let errorMsg
  try {
    errorMsg = extractMessageFromError(message)
  } catch (error) {
    errorMsg = 'User denied transaction signature'
  }

  const nonce = await inferNonce().catch(reject)
  const { transactionEventObj, categoryCode, contractEventObj } = meta

  handleEvent({
    eventCode:
      errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail',
    categoryCode,
    transaction: Object.assign({}, transactionEventObj, {
      nonce
    }),
    contract: contractEventObj,
    reason: 'User denied transaction signature',
    wallet: {
      provider: state.currentProvider,
      address: state.accountAddress,
      balance: state.accountBalance,
      minimum: state.config.minimumBalance
    }
  })

  updateState({ transactionAwaitingApproval: false })

  const errorObj = new Error(
    errorMsg === 'transaction underpriced'
      ? 'Transaction is underpriced'
      : 'User denied transaction signature'
  )
  errorObj.eventCode =
    errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail'

  reject(errorObj)

  return true // rejected
}

// On result handler
function onResult(
  transactionEventObj,
  nonce,
  categoryCode,
  contractEventObj,
  hash
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
