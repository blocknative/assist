import '@babel/polyfill'
import { promisify } from 'bluebird'
import { state, updateState } from './helpers/state'
import { handleEvent } from './helpers/events'
import {
  legacyCall,
  legacySend,
  modernSend,
  modernCall
} from './logic/contract-methods'
import { openWebsocketConnection } from './helpers/websockets'
import { getUserAgent } from './helpers/browser'
import { checkUserEnvironment, prepareForTransaction } from './logic/user'
import sendTransaction from './logic/send-transaction'
import { configureWeb3 } from './helpers/web3'
import { getOverloadedMethodKeys } from './helpers/utilities'
import { createIframe } from './helpers/iframe'
import {
  getTransactionQueueFromStorage,
  storeTransactionQueue,
  storeItem,
  removeItem,
  getItem
} from './helpers/storage'
import assistStyles from '../css/styles.css'

// Library Version - if changing, also need to change in package.json
const version = '0.5.3'

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

  const { web3, dappId, mobileBlocked, headlessMode, style } = config

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
  if (!state.iframe && !headlessMode) {
    createIframe(document, assistStyles, style)
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

  getState().then(state => {
    handleEvent({
      eventCode: 'initState',
      categoryCode: 'initialize',
      state: {
        accessToAccounts: state.accessToAccounts,
        correctNetwork: state.correctNetwork,
        legacyWallet: state.legacyWallet,
        legacyWeb3: state.legacyWeb3,
        minimumBalance: state.minimumBalance,
        mobileDevice: state.mobileDevice,
        modernWallet: state.modernWallet,
        modernWeb3: state.modernWeb3,
        walletEnabled: state.walletEnabled,
        walletLoggedIn: state.walletLoggedIn,
        web3Wallet: state.web3Wallet,
        validBrowser: state.validBrowser
      }
    })
  })

  const onboardingInProgress = getItem('onboarding') === 'true'

  if (onboardingInProgress) {
    onboard().catch(() => {})
  }

  // return the API
  return intializedAssist

  // ========== API FUNCTIONS ========== //

  // ONBOARD FUNCTION //

  function onboard() {
    if (state.config.headlessMode) {
      return new Promise(async (resolve, reject) => {
        await checkUserEnvironment().catch(reject)

        if (state.mobileDevice) {
          const error = new Error('User is on a mobile device')
          error.eventCode = 'mobileBlocked'
          reject(error)
        }

        if (!state.validBrowser) {
          const error = new Error('User has an invalid browser')
          error.eventCode = 'browserFail'
          reject(error)
        }

        if (!state.web3Wallet) {
          const error = new Error('User does not have a web3 wallet installed')
          error.eventCode = 'walletFail'
          reject(error)
        }

        if (!state.accessToAccounts) {
          if (state.legacyWallet) {
            const error = new Error('User needs to login to their account')
            error.eventCode = 'walletLogin'
            reject(error)
          }

          if (state.modernWallet) {
            if (!state.walletLoggedIn) {
              const error = new Error('User needs to login to wallet')
              error.eventCode = 'walletLoginEnable'
              reject(error)
            }

            if (!state.walletEnabled) {
              const error = new Error('User needs to enable wallet')
              error.eventCode = 'walletEnable'
              reject(error)
            }
          }
        }

        if (!state.correctNetwork) {
          const error = new Error('User is on the wrong network')
          error.eventCode = 'networkFail'
          reject(error)
        }

        if (!state.minimumBalance) {
          const error = new Error(
            'User does not have the minimum balance specified in the config'
          )
          error.eventCode = 'nsfFail'
          reject(error)
        }

        resolve('User is ready to transact')
      })
    }

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
      storeItem('onboarding', 'true')

      const ready = await prepareForTransaction('onboard').catch(error => {
        removeItem('onboarding')
        reject(error)
      })

      removeItem('onboarding')
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

    const abi =
      contractObj.abi ||
      contractObj._jsonInterface ||
      Object.keys(contractObj.abiModel.abi.methods).map(
        key => contractObj.abiModel.abi.methods[key].abiItem
      )

    const contractClone = Object.create(Object.getPrototypeOf(contractObj))
    const contractKeys = Object.keys(contractObj)

    const seenMethods = []

    const delegatedContractObj = contractKeys.reduce((newContractObj, key) => {
      if (legacyWeb3) {
        // if we have seen this key, then we have already dealt with it
        if (seenMethods.includes(key)) {
          return newContractObj
        }

        seenMethods.push(key)

        const methodAbiArray = abi.filter(method => method.name === key)

        // if the key doesn't point to a method or is an event, just copy it over
        if (!methodAbiArray[0] || methodAbiArray[0].type === 'event') {
          newContractObj[key] = contractObj[key]

          return newContractObj
        }

        const overloadedMethodKeys =
          methodAbiArray.length > 1 &&
          methodAbiArray.map(abi => getOverloadedMethodKeys(abi.inputs))

        const { name, inputs, constant } = methodAbiArray[0]
        const method = contractObj[name]
        const argsLength = inputs.length

        newContractObj[name] = (...args) =>
          constant
            ? legacyCall(method, name, args, argsLength)
            : legacySend(method, name, args, argsLength)

        newContractObj[name].call = (...args) =>
          legacyCall(method, name, args, argsLength)

        newContractObj[name].sendTransaction = (...args) =>
          legacySend(method, name, args, argsLength)

        newContractObj[name].getData = contractObj[name].getData

        if (overloadedMethodKeys) {
          overloadedMethodKeys.forEach(key => {
            const method = contractObj[name][key]

            newContractObj[name][key] = (...args) =>
              constant
                ? legacyCall(method, name, args, argsLength)
                : legacySend(method, name, args, argsLength)

            newContractObj[name][key].call = (...args) =>
              legacyCall(method, name, args, argsLength)

            newContractObj[name][key].sendTransaction = (...args) =>
              legacySend(method, name, args, argsLength)

            newContractObj[name][key].getData = contractObj[name][key].getData
          })
        }
      } else {
        if (key !== 'methods') {
          newContractObj[key] = contractObj[key]

          return newContractObj
        }

        const methodsKeys = Object.keys(contractObj[key])
        const overloadedRegex = /[A-z]+\([a-z*A-Z*0-9*,*]+\)/g

        newContractObj.methods = abi.reduce((obj, methodAbi) => {
          const { name, type, constant } = methodAbi

          // if not function, do nothing with it
          if (type !== 'function') {
            return obj
          }

          // if we have seen this key, then we have already dealt with it
          if (seenMethods.includes(name)) {
            return obj
          }

          seenMethods.push(name)

          const method = contractObj.methods[name]

          const overloadedMethodKeys = methodsKeys.filter(
            methodKey =>
              methodKey.split('(')[0] === name &&
              overloadedRegex.test(methodKey)
          )

          obj[name] = (...args) =>
            constant
              ? modernCall(method, name, args)
              : modernSend(method, name, args)

          if (overloadedMethodKeys.length > 0) {
            overloadedMethodKeys.forEach(key => {
              const method = contractObj.methods[key]

              obj[key] = (...args) =>
                constant
                  ? modernCall(method, name, args)
                  : modernSend(method, name, args)
            })
          }

          return obj
        }, {})
      }

      return newContractObj
    }, contractClone)

    return delegatedContractObj
  }

  // TRANSACTION FUNCTION //

  function Transaction(txObject, callback, inlineCustomMsgs) {
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
        callback,
        inlineCustomMsgs
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
    const {
      mobileDevice,
      validBrowser,
      currentProvider,
      web3Wallet,
      accessToAccounts,
      walletLoggedIn,
      walletEnabled,
      accountAddress,
      accountBalance,
      minimumBalance,
      userCurrentNetworkId,
      correctNetwork
    } = state

    resolve({
      mobileDevice,
      validBrowser,
      currentProvider,
      web3Wallet,
      accessToAccounts,
      walletLoggedIn,
      walletEnabled,
      accountAddress,
      accountBalance,
      minimumBalance,
      userCurrentNetworkId,
      correctNetwork
    })
  })
}

export default { init }
