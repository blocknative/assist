import '@babel/polyfill'
import PromiEventLib from 'web3-core-promievent'
import { promisify } from 'bluebird'

import {
  state,
  updateState,
  filteredState,
  initializeConfig
} from './helpers/state'
import { handleEvent } from './helpers/events'
import notify from './logic/user-initiated-notify'
import {
  legacyCall,
  legacySend,
  modernSend,
  modernCall,
  truffleSend
} from './logic/contract-methods'
import { addTransactionToQueue } from './helpers/transaction-queue'
import { openWebsocketConnection } from './helpers/websockets'
import { getUserAgent } from './helpers/browser'
import { getUncheckedSigner } from './helpers/ethers-provider'
import { checkUserEnvironment, prepareForTransaction } from './logic/user'
import { sendTransaction, onTxHash } from './logic/send-transaction'
import { configureWeb3 } from './helpers/web3'
import {
  getOverloadedMethodKeys,
  truffleContractUsesWeb3v1,
  createTransactionId
} from './helpers/utilities'
import { createIframe, updateStyle } from './helpers/iframe'
import { validateConfig } from './helpers/validation'
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

  // Validate the config and initialize our state with it
  try {
    validateConfig(config)
  } catch (error) {
    handleEvent({
      eventCode: 'initFail',
      categoryCode: 'initialize',
      reason: error.message
    })
    throw error
  }

  openWebsocketConnection()

  initializeConfig(config)

  const { web3, mobileBlocked, headlessMode, style } = config

  if (web3) {
    configureWeb3(web3)
  }

  // This is needed to ensure MetaMask will reload on every network change
  window.web3 && window.web3.eth

  // Get browser info
  getUserAgent()

  // Commit a cardinal sin and create an iframe (to isolate the CSS)
  if (!state.iframe && !headlessMode) {
    createIframe(document, style)
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
    const onboardPromise = onboard()
    updateState({ onboardPromise })

    // once the promise resolves, clear it from state
    onboardPromise
      .catch(() => {})
      .finally(() => updateState({ onboardPromise: null }))
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
      config: { headlessMode, mobileBlocked },
      onboardPromise
    } = state

    if (onboardPromise) {
      return onboardPromise
    }

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

    // If user is on mobile and it is blocked, warn that it isn't supported
    if (mobileDevice && mobileBlocked) {
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

    if (headlessMode) {
      return new Promise(async (resolve, reject) => {
        if (mobileDevice && window.ethereum) {
          await window.ethereum.enable().catch()
        }

        await checkUserEnvironment().catch()

        const {
          validBrowser,
          web3Wallet,
          accessToAccounts,
          correctNetwork,
          minimumBalance
        } = state

        if (
          (!validBrowser && !mobileDevice) ||
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

  function Contract(contractObjOrAddress, ethersAbi) {
    const {
      validApiKey,
      supportedNetwork,
      web3Instance,
      modernWeb3,
      config: { ethers }
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

    const contractObj = ethers
      ? new ethers.Contract(
          contractObjOrAddress,
          ethersAbi,
          getUncheckedSigner()
        )
      : contractObjOrAddress

    const truffleContract = contractObj.constructor.name === 'TruffleContract'

    // Check using a version of truffle that uses web3 v1.x.x
    if (truffleContract && !truffleContractUsesWeb3v1(contractObj)) {
      throw new Error(
        'Assist only supports truffle contracts using web3 v1.x.x. Please upgrade your truffle-contract dependency to >= verson 4.x.x.\nSee https://www.npmjs.com/package/truffle-contract?activeTab=versions for more information.'
      )
    }

    // Set which types of send/call methods to use for this contract
    let send
    let call
    if (truffleContract) {
      send = truffleSend
      call = legacyCall
    } else if (modernWeb3) {
      send = modernSend
      call = modernCall
    } else {
      send = legacySend
      call = legacyCall
    }

    const abi =
      contractObj.abi ||
      contractObj._jsonInterface ||
      (ethers && ethersAbi) ||
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
            ? call({
                contractObj,
                methodName: name,
                args,
                argsLength,
                truffleContract
              })
            : send({
                contractObj,
                methodName: name,
                args,
                argsLength,
                truffleContract
              })

        newContractObj[name].call = (...args) =>
          call({
            contractObj,
            methodName: name,
            args,
            argsLength,
            truffleContract
          })

        newContractObj[name].sendTransaction = (...args) =>
          send({
            contractObj,
            methodName: name,
            args,
            argsLength,
            truffleContract
          })

        // Add any additional properties onto the method function
        Object.entries(contractObj[name]).forEach(([k, v]) => {
          if (!Object.keys(newContractObj[name]).includes(k)) {
            newContractObj[name][k] = v
          }
        })

        if (overloadedMethodKeys) {
          overloadedMethodKeys.forEach(overloadKey => {
            const method = contractObj[name][overloadKey]

            if (!method) {
              // no method, then overloaded methods not supported on this object
              return
            }

            newContractObj[name][overloadKey] = (...args) =>
              constant
                ? call({
                    contractObj,
                    methodName: name,
                    args,
                    argsLength,
                    truffleContract
                  })
                : send({
                    contractObj,
                    methodName: name,
                    args,
                    argsLength,
                    truffleContract
                  })

            newContractObj[name][overloadKey].call = (...args) =>
              call({
                contractObj,
                methodName: name,
                args,
                argsLength,
                truffleContract
              })

            newContractObj[name][overloadKey].sendTransaction = (...args) =>
              send({
                contractObj,
                methodName: name,
                args,
                argsLength,
                truffleContract
              })

            // Add any additional properties onto the method function
            Object.entries(method).forEach(([k, v]) => {
              if (!Object.keys(newContractObj[name][overloadKey]).includes(k)) {
                newContractObj[name][overloadKey][k] = v
              }
            })
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
                ? call({ contractObj, methodName: name, args, truffleContract })
                : send({ contractObj, methodName: name, args, truffleContract })

            // Add any additional properties onto the method function
            Object.entries(method).forEach(([k, v]) => {
              if (!Object.keys(methodsObj[name]).includes(k)) {
                methodsObj[name][k] = v
              }
            })

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

          const overloadedMethod = contractObj.methods[overloadedMethodKey]

          methodsObj[overloadedMethodKey] = (...args) =>
            constant
              ? call({
                  contractObj,
                  methodName: overloadedMethodKey,
                  args,
                  truffleContract
                })
              : send({
                  contractObj,
                  methodName: overloadedMethodKey,
                  args,
                  truffleContract
                })

          // Add any additional properties onto the method function
          Object.entries(overloadedMethod).forEach(([k, v]) => {
            if (!Object.keys(methodsObj[overloadedMethodKey]).includes(k)) {
              methodsObj[overloadedMethodKey][k] = v
            }
          })

          return methodsObj
        }, {})
      }

      return newContractObj
    }, contractClone)

    return delegatedContractObj
  }

  // TRANSACTION FUNCTION //

  function Transaction(txOptionsOrHash, callback, inlineCustomMsgs = {}) {
    const {
      validApiKey,
      supportedNetwork,
      web3Instance,
      config: { ethers },
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

    // if we are passed a transaction hash instead of an options object
    // then we just track the already sent transaction
    if (typeof txOptionsOrHash === 'string') {
      if (!/^0x([A-Fa-f0-9]{64})$/.test(txOptionsOrHash)) {
        return false
      }

      // create id for transaction
      const id = createTransactionId()

      // add transaction to queue
      addTransactionToQueue({
        transaction: {
          id,
          status: 'signedTransaction'
        },
        inlineCustomMsgs
      })

      // handle txhash
      onTxHash(id, txOptionsOrHash, 'activeTransaction')

      return true
    }

    // Check if we have an instance of web3
    if (!web3Instance && !ethers) {
      configureWeb3()
    }

    const sendMethod = ethers
      ? txOptions => getUncheckedSigner().sendTransaction(txOptions)
      : legacyWeb3
      ? promisify(state.web3Instance.eth.sendTransaction)
      : state.web3Instance.eth.sendTransaction

    if (state.modernWeb3) {
      const promiEvent = new PromiEventLib.PromiEvent()
      sendTransaction({
        categoryCode: 'activeTransaction',
        txOptionsOrHash,
        sendMethod,
        callback,
        inlineCustomMsgs: inlineCustomMsgs.messages,
        promiEvent
      })

      return promiEvent
    }

    return sendTransaction({
      categoryCode: 'activeTransaction',
      txOptionsOrHash,
      sendMethod,
      callback,
      inlineCustomMsgs: inlineCustomMsgs.messages
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
