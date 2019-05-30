import '@babel/polyfill'
import { promisify } from 'bluebird'
import assistStyles from '~/css/styles.css'

import { state, updateState, filteredState } from './helpers/state'
import { handleEvent } from './helpers/events'
import notify from './logic/user-initiated-notify'
import {
  legacyCall,
  legacySend,
  modernSend,
  modernCall
} from './logic/contract-methods'
import { openWebsocketConnection } from './helpers/websockets'
import { getUserAgent } from './helpers/browser'
import getEthersProvider from './helpers/ethers-provider'
import { checkUserEnvironment, prepareForTransaction } from './logic/user'
import sendTransaction from './logic/send-transaction'
import { configureWeb3 } from './helpers/web3'
import { getOverloadedMethodKeys } from './helpers/utilities'
import { createIframe, updateStyle } from './helpers/iframe'
import {
  getTransactionQueueFromStorage,
  storeTransactionQueue,
  storeItem,
  removeItem,
  getItem
} from './helpers/storage'
import { version } from '../../package.json'

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
    getState,
    updateStyle,
    notify
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
    const {
      mobileDevice,
      validApiKey,
      supportedNetwork,
      config: { headlessMode }
    } = state

    if (!validApiKey) {
      const errorObj = new Error('Your api key is not valid')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    if (!supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    if (headlessMode) {
      return new Promise(async (resolve, reject) => {
        await checkUserEnvironment().catch(reject)

        const {
          mobileDevice,
          validBrowser,
          web3Wallet,
          accessToAccounts,
          correctNetwork,
          minimumBalance
        } = state

        if (
          mobileDevice ||
          !validBrowser ||
          !web3Wallet ||
          !accessToAccounts ||
          !correctNetwork ||
          !minimumBalance
        ) {
          reject(filteredState())
        }

        resolve(filteredState())
      })
    }

    // If user is on mobile, warn that it isn't supported
    if (mobileDevice) {
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

      await prepareForTransaction('onboard').catch(() => {
        removeItem('onboarding')
        reject(filteredState())
      })

      removeItem('onboarding')
      resolve(filteredState())
    })
  }

  // CONTRACT FUNCTION //

  function Contract(contractObj) {
    const {
      validApiKey,
      supportedNetwork,
      mobileDevice,
      web3Instance,
      config: { mobileBlocked, truffleContract, ethers }
    } = state

    if (!validApiKey) {
      const errorObj = new Error('Your API key is not valid')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    if (!supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'
      throw errorObj
    }

    // if user is on mobile, and mobile is allowed by Dapp then just pass the contract back
    if (mobileDevice && !mobileBlocked) {
      return contractObj
    }

    // Check if we have an instance of web3
    if (!web3Instance && !ethers) {
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

    const abi =
      contractObj.abi ||
      contractObj._jsonInterface ||
      (contractObj.interface &&
        Object.values(contractObj.interface.functions)) ||
      Object.keys(contractObj.abiModel.abi.methods)
        // remove any arrays from the ABI, they contain redundant information
        .filter(key => !Array.isArray(contractObj.abiModel.abi.methods[key]))
        .map(key => contractObj.abiModel.abi.methods[key].abiItem)

    const contractClone = Object.create(Object.getPrototypeOf(contractObj))
    const contractKeys = Object.keys(contractObj)

    const seenMethods = []

    const delegatedContractObj = contractKeys.reduce((newContractObj, key) => {
      if (state.legacyWeb3 || truffleContract || ethers) {
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
        const argsLength = inputs.length

        newContractObj[name] = (...args) =>
          constant
            ? legacyCall({ contractObj, methodName: name, args, argsLength })
            : legacySend({ contractObj, methodName: name, args, argsLength })

        newContractObj[name].call = (...args) =>
          legacyCall({ contractObj, methodName: name, args, argsLength })

        newContractObj[name].sendTransaction = (...args) =>
          legacySend({ contractObj, methodName: name, args, argsLength })

        newContractObj[name].getData = contractObj[name].getData

        if (overloadedMethodKeys) {
          overloadedMethodKeys.forEach(overloadKey => {
            const method = contractObj[name][overloadKey]

            if (!method) {
              // no method, then overloaded methods not supported on this object
              return
            }

            newContractObj[name][overloadKey] = (...args) =>
              constant
                ? legacyCall({
                    contractObj,
                    methodName: name,
                    overloadKey,
                    args,
                    argsLength
                  })
                : legacySend({
                    contractObj,
                    methodName: name,
                    overloadKey,
                    args,
                    argsLength
                  })

            newContractObj[name][overloadKey].call = (...args) =>
              legacyCall({
                contractObj,
                methodName: name,
                overloadKey,
                args,
                argsLength
              })

            newContractObj[name][overloadKey].sendTransaction = (...args) =>
              legacySend({
                contractObj,
                methodName: name,
                overloadKey,
                args,
                argsLength
              })

            newContractObj[name][overloadKey].getData =
              contractObj[name][overloadKey].getData
          })
        }
      } else {
        if (key !== 'methods') {
          const methodAbiArray = abi.filter(method => method.name === key)

          // if the key doesn't point to a method or is an event, just copy it over
          // this check is now needed to allow for truffle contract 1.0
          if (!methodAbiArray[0] || methodAbiArray[0].type === 'event') {
            newContractObj[key] = contractObj[key]

            return newContractObj
          }
        }

        // go through all the methods in the contract ABI and derive
        // the 'methods' key of the delegated contract from them
        newContractObj.methods = abi.reduce((methodsObj, methodAbi) => {
          const { name, type, constant, inputs } = methodAbi

          // if not function, do nothing with it
          if (type !== 'function') {
            return methodsObj
          }

          // every method can called like contract.methods[methodName](...args).
          // add a methodName key to methodsObj allowing it to be called that way.
          // it only needs to be assigned once
          if (!seenMethods.includes(name)) {
            const method = contractObj.methods[name]
            methodsObj[name] = (...args) =>
              constant
                ? modernCall(method, name, args)
                : modernSend(method, name, args)
            seenMethods.push(name)
          }

          // add a key to methods allowing the current method to be called
          // like contract.methods[`${methodName}(${...args})`](...args)
          let overloadedMethodKey
          if (inputs.length > 0) {
            overloadedMethodKey = `${name}(${getOverloadedMethodKeys(inputs)})`
          } else {
            overloadedMethodKey = `${name}()`
          }

          methodsObj[overloadedMethodKey] = (...args) =>
            constant
              ? modernCall({ contractObj, methodName: name, args })
              : modernSend({ contractObj, methodName: name, args })

          return methodsObj
        }, {})
      }

      return newContractObj
    }, contractClone)

    return delegatedContractObj
  }

  // TRANSACTION FUNCTION //

  function Transaction(txOptions, callback, inlineCustomMsgs) {
    const {
      validApiKey,
      supportedNetwork,
      web3Instance,
      config: { ethers, mobileBlocked },
      mobileDevice,
      legacyWeb3
    } = state

    if (!validApiKey) {
      const errorObj = new Error('Your api key is not valid')
      errorObj.eventCode = 'initFail'

      throw errorObj
    }

    if (!supportedNetwork) {
      const errorObj = new Error('This network is not supported')
      errorObj.eventCode = 'initFail'

      throw errorObj
    }

    // Check if we have an instance of web3
    if (!web3Instance && !ethers) {
      configureWeb3()
    }

    // if user is on mobile, and mobile is allowed by Dapp just put the transaction through
    if (mobileDevice && !mobileBlocked) {
      return ethers
        ? getEthersProvider().sendTransaction(txOptions, callback)
        : web3Instance.eth.sendTransaction(txOptions, callback)
    }

    const sendMethod = ethers
      ? txOptions =>
          getEthersProvider()
            .getUncheckedSigner()
            .sendTransaction(txOptions)
      : legacyWeb3
      ? promisify(state.web3Instance.eth.sendTransaction)
      : state.web3Instance.eth.sendTransaction

    return sendTransaction({
      categoryCode: 'activeTransaction',
      txOptions,
      sendMethod,
      callback,
      inlineCustomMsgs
    })
  }
}

// GETSTATE FUNCTION //

function getState() {
  return new Promise(async resolve => {
    await checkUserEnvironment()
    resolve(filteredState())
  })
}

export default { init }
