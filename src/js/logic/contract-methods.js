import { promisify } from 'bluebird'
import { state } from '~/js/helpers/state'
import { handleEvent } from '~/js/helpers/events'
import { separateArgs, handleError } from '~/js/helpers/utilities'

import sendTransaction from './send-transaction'

export function modernCall({ contractObj, methodName, overloadKey, args }) {
  const innerMethod = contractObj[overloadKey || methodName](...args).call
  const returnObject = {}

  returnObject.call = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txOptions } = separateArgs(innerArgs, 0)

      if (state.mobileDevice && state.config.mobileBlocked) {
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

      if (result) {
        handleEvent({
          eventCode: 'contractQuery',
          categoryCode: 'activeContract',
          contract: {
            methodName: overloadKey || methodName,
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

export function modernSend({ contractObj, methodName, overloadKey, args }) {
  const innerMethod = contractObj[overloadKey || methodName](...args).send
  const returnObject = {}

  returnObject.send = (...innerArgs) => {
    const { callback, txOptions, inlineCustomMsgs } = separateArgs(innerArgs, 0)

    return sendTransaction({
      categoryCode: 'activeContract',
      txOptions,
      sendMethod: innerMethod,
      callback,
      inlineCustomMsgs,
      contractObj,
      methodName,
      overloadKey,
      methodArgs: args
    })
  }

  return returnObject
}

export function legacyCall({
  contractObj,
  methodName,
  overloadKey,
  args,
  argsLength
}) {
  return new Promise(async (resolve, reject) => {
    const { callback, methodArgs, txOptions, defaultBlock } = separateArgs(
      args,
      argsLength
    )

    if (state.mobileDevice && state.config.mobileBlocked) {
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

      return resolve()
    }

    const { truffleContract, ethers } = state.config

    const contractMethod = overloadKey
      ? contractObj[methodName][overloadKey]
      : contractObj[methodName]

    // Only promisify method if it isn't a truffle or ethers contract
    const method =
      truffleContract || ethers ? contractMethod : promisify(contractMethod)

    const result = await method(...methodArgs, txOptions, defaultBlock).catch(
      errorObj => {
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
      }
    )

    handleEvent({
      eventCode: 'contractQuery',
      categoryCode: 'activeContract',
      contract: {
        methodName: overloadKey || methodName,
        parameters: methodArgs,
        result: JSON.stringify(result)
      }
    })

    callback && callback(null, result)
    return resolve(result)
  })
}

export async function legacySend({
  contractObj,
  methodName,
  overloadKey,
  args,
  argsLength
}) {
  const { callback, txOptions, methodArgs, inlineCustomMsgs } = separateArgs(
    args,
    argsLength
  )

  const { truffleContract, ethers } = state.config

  const contractMethod = overloadKey
    ? contractObj[methodName][overloadKey]
    : contractObj[methodName]

  const sendMethod =
    truffleContract || ethers ? contractMethod : promisify(contractMethod)

  return sendTransaction({
    categoryCode: 'activeContract',
    txOptions,
    sendMethod,
    callback,
    inlineCustomMsgs,
    contractObj,
    methodName,
    methodArgs
  })
}
