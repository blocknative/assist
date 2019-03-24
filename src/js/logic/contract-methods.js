import { promisify } from 'bluebird'
import { state } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import sendTransaction from './send-transaction'
import { separateArgs } from '../helpers/utilities'

export function modernMethod(method, methodABI, args) {
  const { name, constant } = methodABI
  const key = constant ? 'call' : 'send'
  const innerMethod = method(...args)[key]
  const returnObject = {}

  returnObject[key] = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txObject } = separateArgs(innerArgs, 0)

      if (key === 'call') {
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

          return
        }

        const txPromise = innerMethod(txObject)

        txPromise
          .then(result => {
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
          .catch(error => {
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
      }

      if (key === 'send') {
        const txPromiseObj = await sendTransaction(
          'activeContract',
          txObject,
          innerMethod,
          callback,
          method,
          { methodName: name, parameters: args }
        ).catch(error => {
          callback && callback(error)
          reject(error)
        })

        resolve(txPromiseObj)
      }
    })

  return returnObject
}

export async function legacyMethod(method, methodABI, allArgs) {
  const { name, constant, inputs } = methodABI
  const argsLength = inputs.length
  const { callback, txObject, args, defaultBlock } = separateArgs(
    allArgs,
    argsLength
  )

  if (constant) {
    const result = await promisify(method.call)(
      ...args,
      txObject,
      defaultBlock
    ).catch(errorObj => {
      callback && callback(errorObj)
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
  } else {
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
}
