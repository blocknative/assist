import { promisify } from 'bluebird'
import PromiEventLib from 'web3-core-promievent'
import { state } from '~/js/helpers/state'
import { handleEvent } from '~/js/helpers/events'
import { separateArgs, handleError } from '~/js/helpers/utilities'
import { checkNetwork, getCorrectNetwork } from '~/js/logic/user'

import sendTransaction from './send-transaction'

export function modernCall(method, name, args) {
  const originalReturnObject = method(...args)
  const innerMethod = method(...args).call

  const returnObject = Object.keys(originalReturnObject).reduce((obj, key) => {
    obj[key] = originalReturnObject[key]
    return obj
  }, {})

  returnObject.call = (...innerArgs) =>
    new Promise(async (resolve, reject) => {
      const { callback, txObject } = separateArgs(innerArgs, 0)
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

      if (result != null) {
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
  const originalReturnObject = method(...args)
  const innerMethod = originalReturnObject.send

  const returnObject = Object.keys(originalReturnObject).reduce((obj, key) => {
    obj[key] = originalReturnObject[key]
    return obj
  }, {})

  returnObject.send = (...innerArgs) => {
    const promiEvent = new PromiEventLib.PromiEvent()
    const { callback, txObject, inlineCustomMsgs } = separateArgs(innerArgs, 0)

    sendTransaction(
      'activeContract',
      txObject,
      innerMethod,
      callback,
      inlineCustomMsgs,
      method,
      { methodName: name, parameters: args },
      promiEvent
    )

    return promiEvent
  }

  return returnObject
}

export function legacyCall(method, name, allArgs, argsLength) {
  return new Promise(async (resolve, reject) => {
    const {
      mobileDevice,
      config: { mobileBlocked, headlessMode, truffleContract }
    } = state
    const { callback, args, txObject, defaultBlock } = separateArgs(
      allArgs,
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

    // Only promisify method if it isn't a truffle contract
    method = truffleContract ? method : promisify(method)

    // Truffle contracts don't support passing txObj or defaultBlock
    // in the method call
    const argsToPass = truffleContract
      ? args
      : [...args, txObject, defaultBlock]

    const result = await method(...argsToPass).catch(errorObj => {
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

    if (result != null) {
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
