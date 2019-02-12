import { promisify } from 'bluebird'
import { state } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import sendTransaction from './send-transaction'
import { separateArgs, timeouts } from '../helpers/utilities'
import { checkNetwork } from './user'
import { addOnboardWarning } from '../views/dom'

export function modernMethod(method, methodABI, allArgs) {
  const { name, constant } = methodABI

  // Get callback from args if there is one present
  const { callback, args } = separateArgs(allArgs)

  const returnObject = method(...args)
  const key = constant ? 'call' : 'send'
  const returnObjectMethod = returnObject[key]

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
                reject(errorObj)
              }
            }
          )

          return
        }

        const txPromise = returnObjectMethod(...innerArgs)

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
          .catch(() => {
            handleEvent(
              {
                eventCode: 'contractQueryFail',
                categoryCode: 'activeContract',
                contract: {
                  methodName: name,
                  parameters: args
                },
                reason: 'User is on the incorrect network'
              },
              {
                onClose: () =>
                  setTimeout(() => {
                    const errorObj = new Error('User is on the wrong network')
                    errorObj.eventCode = 'networkFail'
                    reject(errorObj)
                  }, timeouts.changeUI),
                onClick: async () => {
                  await checkNetwork()
                  if (!state.correctNetwork) {
                    addOnboardWarning('network')
                  }
                }
              }
            )
          })
      }

      if (key === 'send') {
        const txPromiseObj = await sendTransaction(
          'activeContract',
          innerArgs[0],
          returnObjectMethod,
          callback,
          method,
          { methodName: name, parameters: args }
        ).catch(reject)

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
