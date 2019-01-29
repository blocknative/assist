import '@babel/polyfill'
import { promisify } from 'bluebird'
import { state, updateState } from './helpers/state'
import { handleEvent } from './helpers/events'
import { legacyMethod, modernMethod } from './logic/contract-methods'
import { openWebsocketConnection } from './helpers/websockets'
import { getUserAgent } from './helpers/browser'
import { checkUserEnvironment, prepareForTransaction } from './logic/user'
import sendTransaction from './logic/send-transaction'
import { configureWeb3 } from './helpers/web3'
import { separateArgs } from './helpers/utilities'
import { createIframe } from './helpers/iframe'
import {
  getTransactionQueueFromStorage,
  storeTransactionQueue
} from './helpers/storage'
import styles from '../css/styles.css'

// Library Version - if changing, also need to change in package.json
const version = '0.2.0'

function init(config) {
  updateState({ version })

  openWebsocketConnection()

  // Make sure we have a config object
  if (!config || typeof config !== 'object') {
    const reason = 'A config object is needed to initialize assist'

    handleEvent({
      eventCode: 'initFail',
      categoryCode: 'initialize',
      reason
    })

    const errorObj = new Error(reason)
    errorObj.eventCode = 'initFail'
    throw errorObj
  } else {
    updateState({ config })
  }

  const { web3, dappId, mobileBlocked } = config

  // Check that an api key has been provided to the config object
  if (!dappId) {
    handleEvent({
      eventCode: 'initFail',
      categoryCode: 'initialize',
      reason: 'No API key provided to init function'
    })

    updateState({
      validApiKey: false
    })

    const errorObj = new Error('API key is required')
    errorObj.eventCode = 'initFail'
    throw errorObj
  }

  if (web3) {
    configureWeb3(web3)
  }

  // Get browser info
  getUserAgent()

  // Commit a cardinal sin and create an iframe (to isolate the CSS)
  if (!state.iframe) {
    createIframe(document, styles)
  }

  // Check if on mobile and mobile is blocked
  if (state.mobileDevice && mobileBlocked) {
    handleEvent({ eventCode: 'mobileBlocked', categoryCode: 'initialize' })
    updateState({ validBrowser: false })
  }

  // Get transactionQueue from storage if it exists
  getTransactionQueueFromStorage()

  // Add unload event listener
  window.addEventListener('unload', storeTransactionQueue)

  // Public API to expose
  const intializedAssist = {
    onboard,
    Contract,
    Transaction,
    getState
  }

  // return the API
  return intializedAssist

  // ========== API FUNCTIONS ========== //

  // ONBOARD FUNCTION //

  function onboard() {
    if (!state.validApiKey) {
      const errorObj = new Error('Your api key is not valid')
      errorObj.eventCode = 'initFail'
      return Promise.reject(errorObj)
    }

    if (!state.supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'
      return Promise.reject(errorObj)
    }

    // If user is on mobile, warn that it isn't supported
    if (state.mobileDevice) {
      return new Promise((resolve, reject) => {
        handleEvent(
          { eventCode: 'mobileBlocked', categoryCode: 'onboard' },
          {
            onClose: () => {
              const errorObj = new Error('User is on a mobile device')
              errorObj.eventCode = 'mobileBlocked'
              reject(errorObj)
            }
          }
        )

        updateState({ validBrowser: false })
      })
    }

    return new Promise(async (resolve, reject) => {
      const ready = await prepareForTransaction('onboard').catch(reject)
      resolve(ready)
    })
  }

  // CONTRACT FUNCTION //

  function Contract(contractObj) {
    if (!state.validApiKey) {
      const errorObj = new Error('Your API key is not valid')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    if (!state.supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    // if user is on mobile, and mobile is allowed by Dapp then just pass the contract back
    if (state.mobileDevice && !config.mobileBlocked) {
      return contractObj
    }

    // Check if we have an instance of web3
    if (!state.web3Instance) {
      if (window.web3) {
        configureWeb3()
      } else {
        const errorObj = new Error(
          'A web3 instance is needed to decorate contract'
        )
        errorObj.eventCode = 'initFail'
        throw errorObj
      }
    }

    const { legacyWeb3 } = state
    const abi = contractObj.abi || contractObj._jsonInterface

    const modifiedContractObject = abi.reduce((originalContract, methodABI) => {
      const { name, type } = methodABI

      // If the method is not a function then do nothing to it
      if (type !== 'function') {
        return originalContract
      }

      // Save the original method to a variable
      const method = legacyWeb3
        ? originalContract[name]
        : originalContract.methods[name]

      // Replace the methods with our decorated ones
      if (legacyWeb3) {
        originalContract[name] = (...args) =>
          legacyMethod(method, methodABI, args)

        originalContract[name].call = async (...allArgs) => {
          const { callback, args } = separateArgs(allArgs)

          const result = await promisify(method.call)(...args).catch(
            errorObj => callback && callback(errorObj)
          )
          if (result) {
            callback && callback(null, result)
          }

          handleEvent({
            eventCode: 'contractQuery',
            categoryCode: 'activeContract',
            contract: {
              methodName: name,
              parameters: args,
              result: JSON.stringify(result)
            }
          })
        }

        originalContract[name].sendTransaction = async (...allArgs) => {
          const { callback, txObject, args } = separateArgs(allArgs)

          await sendTransaction(
            'activeContract',
            txObject,
            promisify(method.sendTransaction),
            callback,
            method,
            {
              methodName: name,
              parameters: args
            }
          ).catch(errorObj => callback && callback(errorObj))
        }

        originalContract[name].getData = method.getData
      } else {
        originalContract.methods[name] = (...args) =>
          modernMethod(method, methodABI, args)
      }

      return originalContract
    }, contractObj)

    return modifiedContractObject
  }

  // TRANSACTION FUNCTION //

  function Transaction(txObject, callback) {
    if (!state.validApiKey) {
      const errorObj = new Error('Your api key is not valid')
      errorObj.eventCode = 'initFail'
      return Promise.reject(errorObj)
    }

    if (!state.supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'
      return Promise.reject(errorObj)
    }

    // Check if we have an instance of web3
    if (!state.web3Instance) {
      configureWeb3()
    }

    // if user is on mobile, and mobile is allowed by Dapp just put the transaction through
    if (state.mobileDevice && !state.config.mobileBlocked) {
      return state.web3Instance.eth.sendTransaction(txObject)
    }

    const sendMethod = state.legacyWeb3
      ? promisify(state.web3Instance.eth.sendTransaction)
      : state.web3Instance.eth.sendTransaction

    return new Promise(async (resolve, reject) => {
      const txPromiseObj = await sendTransaction(
        'activeTransaction',
        txObject,
        sendMethod,
        callback
      ).catch(errorObj => {
        reject(errorObj)
        callback && callback(errorObj)
      })
      resolve(txPromiseObj)
    })
  }
}

// GETSTATE FUNCTION //

function getState() {
  return new Promise(async (resolve, reject) => {
    await checkUserEnvironment().catch(reject)
    resolve(state)
  })
}

export default { init }
