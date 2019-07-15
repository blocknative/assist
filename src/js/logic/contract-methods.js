import { promisify } from 'bluebird'
import PromiEventLib from 'web3-core-promievent'
import { state } from '~/js/helpers/state'
import { handleEvent } from '~/js/helpers/events'
import { separateArgs, handleError } from '~/js/helpers/utilities'
import { getContractMethod } from '~/js/helpers/web3'
import { checkNetwork, getCorrectNetwork } from '~/js/logic/user'

import sendTransaction from './send-transaction'

export function modernCall({ contractObj, methodName, args, truffleContract }) {
  const originalReturnObject = getContractMethod({
    contractObj,
    methodName,
    truffleContract
  })(...args)

  const innerMethod = originalReturnObject.call

  const returnObject = Object.keys(originalReturnObject).reduce((obj, key) => {
    obj[key] = originalReturnObject[key]
    return obj
  }, {})

  returnObject.call = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txOptions } = separateArgs(innerArgs, 0)
      const {
        mobileDevice,
        config: { mobileBlocked, headlessMode }
      } = state

      if (mobileDevice && mobileBlocked) {
        handleEvent(
          {
            eventCode: 'mobileBlocked',
            categoryCode: 'activePreflight'
          },
          {
            onClose: () => {
              const errorObj = new Error('User is on a mobile device')
              errorObj.eventCode = 'mobileBlocked'

              handleError({ resolve, reject, callback })(errorObj)
            }
          }
        )

        return
      }

      const correctNetwork = await checkNetwork()

      if (!correctNetwork) {
        if (!headlessMode) {
          const result = await getCorrectNetwork('onboard').catch(
            handleError({ resolve, reject, callback })
          )
          if (!result) return
        } else {
          const errorObj = new Error('User is on the wrong network')
          errorObj.eventCode = 'networkFail'
          return handleError({ resolve, reject, callback })(errorObj)
        }
      }

      const result = await innerMethod(txOptions).catch(errorObj => {
        handleEvent({
          eventCode: 'contractQueryFail',
          categoryCode: 'activeContract',
          contract: {
            methodName,
            parameters: args
          },
          reason: errorObj.message || errorObj
        })

        handleError({ resolve, reject, callback })(errorObj)
      })

      if (result != null) {
        handleEvent({
          eventCode: 'contractQuery',
          categoryCode: 'activeContract',
          contract: {
            methodName,
            parameters: args,
            result: JSON.stringify(result)
          }
        })

        callback && callback(null, result)

        resolve(result)
      }
    })

  return returnObject
}

export function modernSend({ contractObj, methodName, args, truffleContract }) {
  const originalReturnObject = getContractMethod({
    contractObj,
    methodName,
    truffleContract
  })(...args)

  const innerMethod = originalReturnObject.send

  const returnObject = Object.keys(originalReturnObject).reduce((obj, key) => {
    obj[key] = originalReturnObject[key]
    return obj
  }, {})

  returnObject.send = (...innerArgs) => {
    const promiEvent = new PromiEventLib.PromiEvent()
    const { callback, txOptions, notificationOptions } = separateArgs(
      innerArgs,
      0
    )

    sendTransaction({
      categoryCode: 'activeContract',
      txOptions,
      sendMethod: innerMethod,
      callback,
      inlineCustomMsgs: notificationOptions.messages,
      clickHandlers: notificationOptions.clickHandlers,
      contractObj,
      methodName,
      methodArgs: args,
      promiEvent
    })

    return promiEvent
  }

  return returnObject
}

export function legacyCall({
  contractObj,
  methodName,
  overloadKey,
  args,
  argsLength,
  truffleContract
}) {
  return new Promise(async (resolve, reject) => {
    const {
      mobileDevice,
      config: { mobileBlocked, headlessMode, ethers }
    } = state

    const { callback, methodArgs, txOptions, defaultBlock } = separateArgs(
      args,
      argsLength
    )

    if (mobileDevice && mobileBlocked) {
      handleEvent(
        {
          eventCode: 'mobileBlocked',
          categoryCode: 'activePreflight'
        },
        {
          onClose: () => {
            const errorObj = new Error('User is on a mobile device')
            errorObj.eventCode = 'mobileBlocked'
            handleError({ resolve, reject, callback })(errorObj)
          }
        }
      )

      return
    }

    const correctNetwork = await checkNetwork()

    if (!correctNetwork) {
      if (!headlessMode) {
        const onCorrectNetwork = await getCorrectNetwork('onboard').catch(
          handleError({ resolve, reject, callback })
        )
        if (!onCorrectNetwork) return
      } else {
        const errorObj = new Error('User is on the wrong network')
        errorObj.eventCode = 'networkFail'
        handleError({ resolve, reject, callback })(errorObj)

        return
      }
    }

    const contractMethod = getContractMethod({
      contractObj,
      methodName,
      overloadKey,
      truffleContract
    })

    // Only promisify method if it isn't a truffle or ethers contract
    const method =
      truffleContract || ethers ? contractMethod : promisify(contractMethod)

    // Truffle contracts don't support passing txObj or defaultBlock
    // in the method call
    const argsToPass = truffleContract
      ? methodArgs
      : [...methodArgs, txOptions, defaultBlock]

    const result = await method(...argsToPass).catch(errorObj => {
      handleEvent({
        eventCode: 'contractQueryFail',
        categoryCode: 'activeContract',
        contract: {
          methodName: overloadKey || methodName,
          parameters: methodArgs
        },
        reason: errorObj.message || errorObj
      })

      handleError({ resolve, reject, callback })(errorObj)
    })

    if (result != null) {
      handleEvent({
        eventCode: 'contractQuery',
        categoryCode: 'activeContract',
        contract: {
          methodName,
          parameters: args,
          result: JSON.stringify(result)
        }
      })

      callback && callback(null, result)
      resolve(result)
    }
  })
}

export async function legacySend({
  contractObj,
  methodName,
  overloadKey,
  args,
  argsLength,
  truffleContract
}) {
  const { callback, txOptions, methodArgs, notificationOptions } = separateArgs(
    args,
    argsLength
  )

  const { ethers } = state.config

  const contractMethod = getContractMethod({
    contractObj,
    methodName,
    overloadKey,
    truffleContract
  })

  const sendMethod = ethers ? contractMethod : promisify(contractMethod)

  return sendTransaction({
    categoryCode: 'activeContract',
    txOptions,
    sendMethod,
    callback,
    inlineCustomMsgs: notificationOptions.messages,
    clickHandlers: notificationOptions.clickHandlers,
    contractObj,
    methodName,
    overloadKey,
    methodArgs
  })
}

export function truffleSend({
  contractObj,
  methodName,
  overloadKey,
  args,
  argsLength
}) {
  const { callback, txOptions, methodArgs, notificationOptions } = separateArgs(
    args,
    argsLength
  )

  const sendMethod = getContractMethod({
    contractObj,
    methodName,
    overloadKey,
    truffleContract: true
  })

  const promiEvent = new PromiEventLib.PromiEvent()
  sendTransaction({
    categoryCode: 'activeContract',
    txOptions,
    sendMethod,
    callback,
    inlineCustomMsgs: notificationOptions.messages,
    clickHandlers: notificationOptions.clickHandlers,
    contractObj,
    methodName,
    overloadKey,
    methodArgs,
    truffleContract: true,
    promiEvent
  })

  return promiEvent
}
