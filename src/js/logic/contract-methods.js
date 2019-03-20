import { promisify } from 'bluebird'
import { state } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import sendTransaction from './send-transaction'
import { separateArgs } from '../helpers/utilities'

export function modernMethod(method, methodABI, allArgs) {
  const { name, constant } = methodABI
  const { callback, args } = separateArgs(allArgs)
  const key = constant ? 'call' : 'send'
  const innerMethod = method(...args)[key]
  const returnObject = {}

  returnObject[key] = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
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

        const txPromise = innerMethod(...innerArgs)

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
          innerArgs[0],
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
  const { callback, txObject, args } = separateArgs(allArgs)
  const { name, constant } = methodABI

  if (constant) {
    const result = await promisify(method.call)(...args).catch(
      errorObj => callback && callback(errorObj)
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
