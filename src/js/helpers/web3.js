import { promisify } from 'bluebird'
import { state, updateState } from './state'
import { formatNumber, handleWeb3Error, timeouts } from './utilities'

const errorObj = new Error('undefined version of web3')
errorObj.eventCode = 'initFail'

export const web3Functions = {
  networkId: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.version.getNetwork)
      case '1.0':
        return state.web3Instance.eth.net.getId
      default:
        return () => Promise.reject(errorObj)
    }
  },
  bigNumber: version => {
    switch (version) {
      case '0.2':
        return value =>
          Promise.resolve(state.web3Instance.toBigNumber(formatNumber(value)))
      case '1.0':
        return value =>
          Promise.resolve(state.web3Instance.utils.toBN(formatNumber(value)))
      default:
        return () => Promise.reject(errorObj)
    }
  },
  gasPrice: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.eth.getGasPrice)
      case '1.0':
        return state.web3Instance.eth.getGasPrice
      default:
        return () => Promise.reject(errorObj)
    }
  },
  contractGas: version => {
    switch (version) {
      case '0.2':
        return (contractMethod, parameters, txObject) =>
          state.config.truffleContract
            ? contractMethod.estimateGas(...parameters, txObject)
            : promisify(contractMethod.estimateGas)(...parameters, txObject)
      case '1.0':
        return (contractMethod, parameters, txObject) =>
          state.config.truffleContract
            ? contractMethod.estimateGas(...parameters, txObject)
            : contractMethod(...parameters).estimateGas(txObject)
      default:
        return () => Promise.reject(errorObj)
    }
  },
  transactionGas: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.eth.estimateGas)
      case '1.0':
        return state.web3Instance.eth.estimateGas
      default:
        return () => Promise.reject(errorObj)
    }
  },
  balance: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.eth.getBalance)
      case '1.0':
        return state.web3Instance.eth.getBalance
      default:
        return () => Promise.reject(errorObj)
    }
  },
  accounts: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.eth.getAccounts)
      case '1.0':
        return state.web3Instance.eth.getAccounts
      default:
        return () => Promise.reject(errorObj)
    }
  },
  txReceipt: txHash =>
    promisify(state.web3Instance.eth.getTransactionReceipt)(txHash)
}

export function configureWeb3(web3) {
  if (!web3) {
    web3 = window.web3 // eslint-disable-line prefer-destructuring
  }

  // If web3 has been prefaced with the default property, re-assign it
  if (web3.default) {
    web3 = web3.default
  }

  // Check which version of web3 we are working with
  let legacyWeb3
  let modernWeb3
  let web3Version

  if (web3.version.api && typeof web3.version.api === 'string') {
    legacyWeb3 = true
    modernWeb3 = false
    web3Version = web3.version.api
  } else if (web3.version && typeof web3.version === 'string') {
    legacyWeb3 = false
    modernWeb3 = true
    web3Version = web3.version
  } else {
    legacyWeb3 = false
    modernWeb3 = false
    web3Version = undefined
  }

  // Update the state
  updateState({
    legacyWeb3,
    modernWeb3,
    web3Version,
    web3Instance: web3
  })
}

export function checkForWallet() {
  if (window.ethereum) {
    updateState({
      currentProvider: getCurrentProvider(),
      validBrowser: true,
      web3Wallet: true,
      legacyWallet: false,
      modernWallet: true
    })
  } else if (window.web3) {
    updateState({
      currentProvider: getCurrentProvider(),
      validBrowser: true,
      web3Wallet: true,
      legacyWallet: true,
      modernWallet: false
    })
  } else {
    updateState({
      web3Wallet: false,
      accessToAccounts: false,
      walletLoggedIn: false,
      walletEnabled: false
    })
  }
}

export function getNetworkId() {
  const version = state.web3Version && state.web3Version.slice(0, 3)
  return web3Functions.networkId(version)()
}

export function getTransactionParams(
  txObject = {},
  contractMethod,
  contractEventObj
) {
  return new Promise(async resolve => {
    const version = state.web3Version && state.web3Version.slice(0, 3)

    // Sometimes value is in exponent notation and needs to be formatted
    if (txObject.value) {
      txObject.value = formatNumber(txObject.value)
    }

    const valuePromise = txObject.value
      ? web3Functions.bigNumber(version)(txObject.value)
      : web3Functions.bigNumber(version)('0')

    const gasPricePromise = new Promise(async (resolve, reject) => {
      try {
        // If gasPrice isn't passed explicitly, ask web3 for a suitable one
        const gasPrice = txObject.gasPrice
          ? txObject.gasPrice
          : await web3Functions.gasPrice(version)()
        resolve(web3Functions.bigNumber(version)(gasPrice))
      } catch (e) {
        reject(e)
      }
    })

    const gasPromise = new Promise(async (resolve, reject) => {
      try {
        // Get a gas estimate based on if the tx is a contract method call
        // or regular transaction
        const gas = contractMethod
          ? await web3Functions.contractGas(version)(
              contractMethod,
              contractEventObj.parameters,
              txObject
            )
          : await web3Functions.transactionGas(version)(txObject)
        resolve(web3Functions.bigNumber(version)(gas))
      } catch (e) {
        reject(e)
      }
    })

    const [value, gasPrice, gas] = await Promise.all([
      valuePromise,
      gasPricePromise,
      gasPromise
    ]).catch(handleWeb3Error)

    resolve({ value, gasPrice, gas })
  })
}

export function hasSufficientBalance({ value = 0, gas = 0, gasPrice = 0 }) {
  return new Promise(async resolve => {
    const version = state.web3Version && state.web3Version.slice(0, 3)

    const gasCost = gas.mul(gasPrice)

    const buffer = gasCost.div(
      await web3Functions
        .bigNumber(version)('10')
        .catch(handleWeb3Error)
    )

    const transactionCost = gasCost.add(value).add(buffer)

    const balance = await getAccountBalance().catch(handleWeb3Error)
    const accountBalance = await web3Functions
      .bigNumber(version)(balance)
      .catch(handleWeb3Error)

    const sufficientBalance = accountBalance.gt(transactionCost)

    resolve(sufficientBalance)
  })
}

export function getAccountBalance() {
  return new Promise(async resolve => {
    const accounts = await getAccounts().catch(handleWeb3Error)
    updateState({ accountAddress: accounts && accounts[0] })

    const version = state.web3Version && state.web3Version.slice(0, 3)
    const balance = await web3Functions
      .balance(version)(accounts[0])
      .catch(handleWeb3Error)

    resolve(balance)
  })
}

export function getAccounts() {
  const version = state.web3Version && state.web3Version.slice(0, 3)
  return web3Functions.accounts(version)()
}

export function checkUnlocked() {
  return window.ethereum._metamask.isUnlocked()
}

export function requestLoginEnable() {
  return window.ethereum.enable()
}

export function getCurrentProvider() {
  const web3 = state.web3Instance || window.web3
  if (web3.currentProvider.isMetaMask) {
    return 'metamask'
  }
  if (web3.currentProvider.isTrust) {
    return 'trust'
  }
  if (typeof window.SOFA !== 'undefined') {
    return 'toshi'
  }
  if (typeof window.__CIPHER__ !== 'undefined') {
    return 'cipher'
  }
  if (web3.currentProvider.constructor.name === 'EthereumProvider') {
    return 'mist'
  }
  if (web3.currentProvider.constructor.name === 'Web3FrameProvider') {
    return 'parity'
  }
  if (
    web3.currentProvider.host &&
    web3.currentProvider.host.indexOf('infura') !== -1
  ) {
    return 'infura'
  }
  if (
    web3.currentProvider.host &&
    web3.currentProvider.host.indexOf('localhost') !== -1
  ) {
    return 'localhost'
  }
  if (web3.currentProvider.connection) {
    return 'Infura Websocket'
  }

  return undefined
}

// Poll for a tx receipt
export function waitForTransactionReceipt(txHash) {
  return new Promise(resolve => {
    return checkForReceipt()

    function checkForReceipt() {
      return web3Functions
        .txReceipt(txHash)
        .then(txReceipt => {
          if (!txReceipt) {
            return setTimeout(() => checkForReceipt(), timeouts.pollForReceipt)
          }

          return resolve(txReceipt)
        })
        .catch(errorObj => {
          handleWeb3Error(errorObj)
          return resolve(null)
        })
    }
  })
}
