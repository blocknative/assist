import { promisify } from 'bluebird'
import { state } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import sendTransaction from './send-transaction'
import { separateArgs } from '../helpers/utilities'

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
              callback && callback(errorObj)
              reject(errorObj)
            }
          }
        )
      }

      const result = await innerMethod(txObject).catch(error => {
        handleEvent({
          eventCode: 'contractQueryFail',
          categoryCode: 'activeContract',
          contract: {
            methodName: name,
            parameters: args
          },
          reason: error.msg
        })

        callback && callback(error)

        reject(error)
      })

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
    })

  return returnObject
}

export function modernSend(method, name, args) {
  const innerMethod = method(...args).send
  const returnObject = {}

  returnObject.send = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txObject, inlineCustomMsgs } = separateArgs(
        innerArgs,
        0
      )

      const txPromiseObj = sendTransaction(
        'activeContract',
        txObject,
        innerMethod,
        callback,
        inlineCustomMsgs,
        method,
        { methodName: name, parameters: args }
      ).catch(error => {
        callback && callback(error)
        reject(error)
      })

      resolve(txPromiseObj)
    })

  return returnObject
}

export async function legacyCall(method, name, allArgs, argsLength) {
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
          callback && callback(errorObj)
        }
      }
    )

    return
  }

  const result = await promisify(method.call)(
    ...args,
    txObject,
    defaultBlock
  ).catch(errorObj => callback && callback(errorObj))

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

export async function legacySend(method, name, allArgs, argsLength) {
  const { callback, txObject, args, inlineCustomMsgs } = separateArgs(
    allArgs,
    argsLength
  )

  await sendTransaction(
    'activeContract',
    txObject,
    promisify(method.sendTransaction),
    callback,
    inlineCustomMsgs,
    method,
    {
      methodName: name,
      parameters: args
    }
  ).catch(errorObj => callback && callback(errorObj))
}
