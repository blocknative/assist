import { state, updateState } from '../helpers/state'
import { handleEvent } from '../helpers/events'
import { checkValidBrowser } from '../helpers/browser'
import { closeModal, addOnboardWarning } from '../views/dom'
import {
  getAccountBalance,
  getAccounts,
  checkUnlocked,
  getNetworkId,
  web3Functions,
  requestLoginEnable,
  checkForWallet,
  configureWeb3
} from '../helpers/web3'
import { getItem, storeItem } from '../helpers/storage'
import { timeouts, handleWeb3Error } from '../helpers/utilities'

export function checkUserEnvironment() {
  return new Promise(async resolve => {
    checkValidBrowser()

    checkForWallet()

    if (!state.web3Wallet) {
      storeItem('_assist_newUser', 'true')
      resolve()
      return
    }

    if (!state.web3Instance) {
      configureWeb3()
    }

    await checkAccountAccess()

    await checkNetwork().catch(handleWeb3Error)

    if (state.accessToAccounts && state.correctNetwork) {
      await checkMinimumBalance()
    }

    resolve()
  })
}

// Prepare for transaction
export function prepareForTransaction(categoryCode, originalResolve) {
  return new Promise(async (resolve, reject) => {
    originalResolve = originalResolve || resolve

    await checkUserEnvironment()

    if (state.mobileDevice && state.config.mobileBlocked) {
      handleEvent(
        { eventCode: 'mobileBlocked', categoryCode },
        {
          onClose: () =>
            setTimeout(() => {
              const errorObj = new Error('User is on mobile device')
              errorObj.eventCode = 'mobileBlocked'
              reject(errorObj)
            }, timeouts.changeUI)
        }
      )
      return
    }

    if (getItem('_assist_newUser') === 'true') {
      if (!state.validBrowser) {
        handleEvent(
          {
            eventCode: 'browserFail',
            categoryCode
          },
          {
            onClose: () =>
              setTimeout(() => {
                const errorObj = new Error('User has an invalid browser')
                errorObj.eventCode = 'browserFail'
                reject(errorObj)
              }, timeouts.changeUI)
          }
        )
        return
      }

      const previouslyWelcomed = getItem('_assist_welcomed')

      if (previouslyWelcomed !== 'true' && previouslyWelcomed !== 'null') {
        try {
          await welcomeUser(categoryCode)
        } catch (errorObj) {
          reject(errorObj)
          return
        }
      }

      if (!state.web3Wallet) {
        try {
          await getWeb3Wallet(categoryCode)
        } catch (errorObj) {
          reject(errorObj)
          return
        }
      }
    }

    if (!state.web3Instance) {
      configureWeb3()
    }

    if (state.legacyWallet && !state.accessToAccounts) {
      try {
        await legacyAccountAccess(categoryCode, originalResolve)
      } catch (errorObj) {
        reject(errorObj)
        return
      }
    }

    if (state.modernWallet && !state.accessToAccounts) {
      try {
        await modernAccountAccess(categoryCode, originalResolve)
      } catch (errorObj) {
        reject(errorObj)
        return
      }
    }

    if (!state.correctNetwork) {
      try {
        await getCorrectNetwork(categoryCode)
      } catch (errorObj) {
        reject(errorObj)
        return
      }
    }

    await checkMinimumBalance()

    if (!state.minimumBalance) {
      try {
        await getMinimumBalance(categoryCode, originalResolve)
      } catch (errorObj) {
        reject(errorObj)
        return
      }
    }

    if (getItem('_assist_newUser') === 'true') {
      await newOnboardComplete(categoryCode)
      storeItem('_assist_newUser', 'false')
    }

    resolve('User is ready to transact')
    originalResolve && originalResolve('User is ready to transact')
  })
}

function welcomeUser(categoryCode) {
  return new Promise((resolve, reject) => {
    handleEvent(
      {
        eventCode: 'welcomeUser',
        categoryCode
      },
      {
        onClose: () =>
          setTimeout(() => {
            const errorObj = new Error('User is being welcomed')
            errorObj.eventCode = 'welcomeUser'
            reject(errorObj)
          }, timeouts.changeUI),
        onClick: () => {
          storeItem('_assist_welcomed', 'true')
          closeModal()
          setTimeout(resolve, timeouts.changeUI)
        }
      }
    )
  })
}

function getWeb3Wallet(categoryCode) {
  return new Promise((resolve, reject) => {
    handleEvent(
      {
        eventCode: 'walletFail',
        categoryCode,
        wallet: {
          provider: state.currentProvider
        }
      },
      {
        onClose: () =>
          setTimeout(() => {
            const errorObj = new Error(
              'User does not have a web3 wallet installed'
            )
            errorObj.eventCode = 'walletFail'
            reject(errorObj)
          }, timeouts.changeUI),
        onClick: () => {
          window.location.reload()
        }
      }
    )
  })
}

function checkAccountAccess() {
  return new Promise(async resolve => {
    const accounts = await getAccounts().catch(resolve)
    if (accounts && accounts[0]) {
      updateState({
        accessToAccounts: true,
        accountAddress: accounts[0],
        walletLoggedIn: true,
        walletEnabled: true
      })
    } else {
      const loggedIn = state.modernWallet
        ? await checkUnlocked().catch(resolve)
        : false

      updateState({
        accessToAccounts: false,
        walletLoggedIn: loggedIn,
        walletEnabled: state.modernWallet ? false : null,
        minimumBalance: null
      })
    }
    resolve()
  })
}

export function checkNetwork() {
  return new Promise(async resolve => {
    const networkId = await getNetworkId().catch(handleWeb3Error)

    updateState({
      correctNetwork:
        Number(networkId) === (Number(state.config.networkId) || 1),
      userCurrentNetworkId: networkId
    })
    resolve && resolve()
  })
}

function checkMinimumBalance() {
  return new Promise(async (resolve, reject) => {
    await checkAccountAccess()
    if (!state.accessToAccounts) {
      resolve()
    }
    const { web3Version } = state
    const version = web3Version && web3Version.slice(0, 3)
    const minimum = state.config.minimumBalance || 0
    const account = await getAccountBalance().catch(resolve)
    const minimumBalance = await web3Functions
      .bigNumber(version)(minimum)
      .catch(reject)
    const accountBalance = await web3Functions
      .bigNumber(version)(account)
      .catch(reject)
    const sufficientBalance = accountBalance.gte(minimumBalance)

    updateState({
      accountBalance: accountBalance.toString(),
      minimumBalance: sufficientBalance
    })
    resolve()
  })
}

function legacyAccountAccess(categoryCode, originalResolve) {
  return new Promise(async (resolve, reject) => {
    handleEvent(
      {
        eventCode: 'walletLogin',
        categoryCode,
        wallet: {
          provider: state.currentProvider
        }
      },
      {
        onClose: () =>
          setTimeout(() => {
            const errorObj = new Error('User needs to login to their account')
            errorObj.eventCode = 'walletLogin'
            reject(errorObj)
          }, timeouts.changeUI),
        onClick: async () => {
          if (state.accessToAccounts) {
            closeModal()
            setTimeout(async () => {
              await prepareForTransaction(categoryCode, originalResolve).catch(
                reject
              )
              resolve()
            }, timeouts.changeUI)
          } else {
            addOnboardWarning('loggedIn')
          }
        }
      }
    )
  })
}

function enableWallet(categoryCode, originalResolve) {
  return new Promise(async (resolve, reject) => {
    await checkAccountAccess()

    if (state.walletEnabled) {
      resolve()
      return
    }

    if (state.accessToAccounts) {
      if (state.walletEnableCalled) {
        // the popup dialog has been called
        if (state.walletEnableCanceled) {
          // the user has cancelled the dialog, but we have access to accounts
          // so we just resolve
          resolve()
        } else {
          // The user must have missed the connect dialog or closed it without confirming or
          // cancelling, so we show enable account UI
          handleEvent(
            {
              eventCode: 'walletEnable',
              categoryCode,
              wallet: {
                provider: state.currentProvider
              }
            },
            {
              onClose: () =>
                setTimeout(() => {
                  const errorObj = new Error('User needs to enable wallet')
                  errorObj.eventCode = 'walletEnable'
                  reject(errorObj)
                }, timeouts.changeUI),
              onClick: async () => {
                await checkAccountAccess()
                if (state.accessToAccounts || !state.walletLoggedIn) {
                  closeModal()
                  setTimeout(async () => {
                    await prepareForTransaction(
                      categoryCode,
                      originalResolve
                    ).catch(reject)
                    resolve()
                  }, timeouts.changeUI)
                } else {
                  addOnboardWarning('enabled')
                  await enableWallet(categoryCode, originalResolve).catch(
                    reject
                  )
                }
              }
            }
          )
        }
      } else {
        // wallet enable hasn't been called, but we have access to accounts so it doesn't matter
        resolve()
      }
    } else if (
      !state.walletEnableCalled ||
      (state.walletEnableCalled && state.walletEnableCanceled)
    ) {
      // if enable popup has been called and canceled, or hasn't been called yet then,
      // show metamask login and connect dialog popup
      requestLoginEnable()
        .then(accounts => {
          updateState({
            accountAddress: accounts[0],
            walletLoggedIn: true,
            walletEnabled: true,
            accessToAccounts: true
          })
        })
        .catch(() => {
          updateState({
            walletEnableCanceled: true,
            walletEnabled: false,
            accessToAccounts: false
          })
        })

      updateState({
        walletEnableCalled: true,
        walletEnableCanceled: false
      })

      // Show UI to inform user to connect
      handleEvent(
        {
          eventCode: 'walletEnable',
          categoryCode,
          wallet: {
            provider: state.currentProvider
          }
        },
        {
          onClose: () =>
            setTimeout(() => {
              const errorObj = new Error('User needs to enable wallet')
              errorObj.eventCode = 'walletEnable'
              reject(errorObj)
            }, timeouts.changeUI),
          onClick: async () => {
            await checkAccountAccess()
            if (state.accessToAccounts || !state.walletLoggedIn) {
              closeModal()
              setTimeout(async () => {
                await prepareForTransaction(
                  categoryCode,
                  originalResolve
                ).catch(reject)
                resolve()
              }, timeouts.changeUI)
            } else {
              addOnboardWarning('enabled')
              await enableWallet(categoryCode, originalResolve).catch(reject)
            }
          }
        }
      )
    } else {
      // Wallet enable has been called but not canceled, so popup window must have been closed
      // Call wallet enable again
      requestLoginEnable()
        .then(accounts => {
          if (accounts && accounts[0]) {
            updateState({
              accountAddress: accounts[0],
              walletLoggedIn: true,
              walletEnabled: true,
              accessToAccounts: true
            })
          }
        })
        .catch(() => {
          updateState({
            walletEnableCanceled: true,
            walletEnabled: false,
            accessToAccounts: false
          })
        })

      updateState({
        walletEnableCalled: true,
        walletEnableCanceled: false
      })

      // Show UI to inform user to connect
      handleEvent(
        {
          eventCode: 'walletEnable',
          categoryCode,
          wallet: {
            provider: state.currentProvider
          }
        },
        {
          onClose: () =>
            setTimeout(() => {
              const errorObj = new Error('User needs to enable wallet')
              errorObj.eventCode = 'walletEnable'
              reject(errorObj)
            }, timeouts.changeUI),
          onClick: async () => {
            await checkAccountAccess()
            if (state.accessToAccounts || !state.walletLoggedIn) {
              closeModal()
              setTimeout(async () => {
                await prepareForTransaction(
                  categoryCode,
                  originalResolve
                ).catch(reject)
                resolve()
              }, timeouts.changeUI)
            } else {
              addOnboardWarning('enabled')
              await enableWallet(categoryCode, originalResolve).catch(reject)
            }
          }
        }
      )
    }
  })
}

function unlockWallet(categoryCode, originalResolve) {
  return new Promise((resolve, reject) => {
    requestLoginEnable()
      .then(accounts => {
        updateState({
          accountAddress: accounts[0],
          walletLoggedIn: true,
          walletEnabled: true,
          accessToAccounts: true
        })
      })
      .catch(() => {
        updateState({
          walletEnableCanceled: true,
          walletEnabled: false,
          accessToAccounts: false
        })
      })

    updateState({ walletEnableCalled: true, walletEnableCanceled: false })

    // Show onboard login UI
    handleEvent(
      {
        eventCode: 'walletLoginEnable',
        categoryCode,
        wallet: {
          provider: state.currentProvider
        }
      },
      {
        onClose: () =>
          setTimeout(() => {
            const errorObj = new Error('User needs to login to wallet')
            errorObj.eventCode = 'walletLoginEnable'
            reject(errorObj)
          }, timeouts.changeUI),
        onClick: async () => {
          await checkAccountAccess()
          if (state.walletLoggedIn) {
            closeModal()
            setTimeout(async () => {
              await prepareForTransaction(categoryCode, originalResolve).catch(
                reject
              )
              resolve()
            }, timeouts.changeUI)
          } else {
            addOnboardWarning('loggedIn')
            await unlockWallet(categoryCode, originalResolve).catch(reject)
            updateState({ walletLoggedIn: true })
            closeModal()
            setTimeout(async () => {
              await prepareForTransaction(categoryCode, originalResolve).catch(
                reject
              )
              resolve()
            }, timeouts.changeUI)
          }
        }
      }
    )
  })
}

function modernAccountAccess(categoryCode, originalResolve) {
  return new Promise(async (resolve, reject) => {
    if (state.walletLoggedIn) {
      try {
        await enableWallet(categoryCode, originalResolve)
        resolve()
      } catch (errorObj) {
        reject(errorObj)
      }
    } else {
      try {
        await unlockWallet(categoryCode, originalResolve)
      } catch (errorObj) {
        reject(errorObj)
        return
      }

      try {
        await enableWallet(categoryCode, originalResolve)
      } catch (errorObj) {
        reject(errorObj)
        return
      }
      resolve()
    }
  })
}

function getCorrectNetwork(categoryCode) {
  return new Promise(async (resolve, reject) => {
    handleEvent(
      {
        eventCode: 'networkFail',
        categoryCode,
        walletNetworkID: state.userCurrentNetworkId,
        walletName: state.currentProvider
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

function getMinimumBalance(categoryCode, originalResolve) {
  return new Promise((resolve, reject) => {
    handleEvent(
      {
        eventCode: 'nsfFail',
        categoryCode,
        wallet: {
          balance: state.accountBalance,
          minimum: state.minimumBalance,
          provider: state.currentProvider,
          address: state.accountAddress
        }
      },
      {
        onClose: () =>
          setTimeout(() => {
            const errorObj = new Error(
              'User does not have the minimum balance specified in the config'
            )
            errorObj.eventCode = 'nsfFail'
            reject(errorObj)
          }, timeouts.changeUI),
        onClick: async () => {
          await checkMinimumBalance()
          if (state.minimumBalance || !state.accessToAccounts) {
            closeModal()
            setTimeout(async () => {
              await prepareForTransaction(categoryCode, originalResolve).catch(
                reject
              )
              resolve()
            }, timeouts.changeUI)
          } else {
            addOnboardWarning('minimumBalance')
          }
        }
      }
    )
  })
}

function newOnboardComplete(categoryCode) {
  return new Promise(resolve => {
    handleEvent(
      {
        eventCode: 'newOnboardComplete',
        categoryCode
      },
      {
        onClose: resolve,
        onClick: () => {
          closeModal()
          resolve()
        }
      }
    )
  })
}
