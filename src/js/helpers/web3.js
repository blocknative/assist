import { promisify } from 'bluebird'
import { state, updateState } from './state'
import { formatNumber, handleError, timeouts } from './utilities'

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
  nonce: version => {
    switch (version) {
      case '0.2':
        return promisify(state.web3Instance.eth.getTransactionCount)
      case '1.0':
        return state.web3Instance.eth.getTransactionCount
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
          promisify(contractMethod.estimateGas)(...parameters, txObject)
      case '1.0':
        return (contractMethod, parameters, txObject) =>
          contractMethod(...parameters).estimateGas(txObject)
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
  }
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

export function getNonce(address) {
  const version = state.web3Version && state.web3Version.slice(0, 3)
  return web3Functions.nonce(version)(address)
}

export function hasSufficientBalance(
  txObject = {},
  contractMethod,
  methodArgs
) {
  return new Promise(async (resolve, reject) => {
    const version = state.web3Version && state.web3Version.slice(0, 3)

    const transactionValue = txObject.value
      ? await web3Functions
          .bigNumber(version)(txObject.value)
          .catch(handleError('web3', reject))
      : await web3Functions
          .bigNumber(version)('0')
          .catch(handleError('web3', reject))

    const gasPrice = txObject.gasPrice
      ? await web3Functions
          .bigNumber(version)(txObject.gasPrice)
          .catch(handleError('web3', reject))
      : await web3Functions
          .bigNumber(version)(
            await web3Functions
              .gasPrice(version)()
              .catch(handleError('web3', reject))
          )
          .catch(handleError('web3', reject))

    const gas = contractMethod
      ? await web3Functions
          .bigNumber(version)(
            await web3Functions
              .contractGas(version)(
                contractMethod,
                methodArgs.parameters,
                txObject
              )
              .catch(handleError('web3', reject))
          )
          .catch(handleError('web3', reject))
      : await web3Functions
          .bigNumber(version)(
            await web3Functions
              .transactionGas(version)(txObject)
              .catch(handleError('web3', reject))
          )
          .catch(handleError('web3', reject))

    const transactionFee = gas.mul(gasPrice)

    const buffer = transactionFee.div(
      await web3Functions
        .bigNumber(version)('10')
        .catch(handleError('web3', reject))
    )

    const totalTransactionCost = transactionFee
      .add(transactionValue)
      .add(buffer)

    const balance = await getAccountBalance().catch(handleError('web3', reject))
    const accountBalance = await web3Functions
      .bigNumber(version)(balance)
      .catch(handleError('web3', reject))

    const sufficientBalance = accountBalance.gt(totalTransactionCost)

    const transactionParams = {
      value: transactionValue.toString(),
      gas: gas.toString(),
      gasPrice: gasPrice.toString(),
      to: txObject.to
    }

    resolve({ transactionParams, sufficientBalance })
  })
}

export function getAccountBalance() {
  return new Promise(async (resolve, reject) => {
    const accounts = await getAccounts().catch(handleError('web3', reject))
    updateState({ accountAddress: accounts[0] })

    const version = state.web3Version && state.web3Version.slice(0, 3)
    const balance = web3Functions
      .balance(version)(accounts[0])
      .catch(handleError('web3', reject))

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
  const web3 = state.web3Instance || window.web3
  return new Promise((resolve, reject) => {
    function checkForReceipt() {
      web3.eth.getTransactionReceipt(txHash, (err, res) => {
        if (err) {
          return reject(err)
        }
        if (res === null) {
          return setTimeout(() => checkForReceipt(), timeouts.pollForReceipt)
        }
        return resolve(res)
      })
    }
    checkForReceipt()
  })
}
