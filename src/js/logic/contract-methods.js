import { promisify } from 'bluebird'
import { state } from 'js/helpers/state'
import { handleEvent } from 'js/helpers/events'
import { separateArgs, handleError } from 'js/helpers/utilities'

import sendTransaction from './send-transaction'

export function modernCall(method, name, args) {
  const innerMethod = method(...args).call
  const returnObject = {}

  returnObject.call = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txObject } = separateArgs(innerArgs, 0)

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

      const result = await innerMethod(txObject).catch(errorObj => {
        handleEvent({
          eventCode: 'contractQueryFail',
          categoryCode: 'activeContract',
          contract: {
            methodName: name,
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
            methodName: name,
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

export function modernSend(method, name, args) {
  const innerMethod = method(...args).send
  const returnObject = {}

  returnObject.send = (...innerArgs) => {
    const { callback, txObject, inlineCustomMsgs } = separateArgs(innerArgs, 0)

    return sendTransaction(
      'activeContract',
      txObject,
      innerMethod,
      callback,
      inlineCustomMsgs,
      method,
      { methodName: name, parameters: args }
    )
  }

  return returnObject
}

export function legacyCall(method, name, allArgs, argsLength) {
  return new Promise(async (resolve, reject) => {
    const { callback, args, txObject, defaultBlock } = separateArgs(
      allArgs,
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

    // Only promisify method if it isn't a truffle contract
    method = state.config.truffleContract ? method : promisify(method)

    const result = await method(...args, txObject, defaultBlock).catch(
      errorObj => {
        handleEvent({
          eventCode: 'contractQueryFail',
          categoryCode: 'activeContract',
          contract: {
            methodName: name,
            parameters: args
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
        methodName: name,
        parameters: args,
        result: JSON.stringify(result)
      }
    })

    callback && callback(null, result)
    return resolve(result)
  })
}

export async function legacySend(method, name, allArgs, argsLength) {
  const { callback, txObject, args, inlineCustomMsgs } = separateArgs(
    allArgs,
    argsLength
  )

  const sendMethod = state.config.truffleContract
    ? method.sendTransaction
    : promisify(method)

  return sendTransaction(
    'activeContract',
    txObject,
    sendMethod,
    callback,
    inlineCustomMsgs,
    method,
    {
      methodName: name,
      parameters: args
    }
  )
}
