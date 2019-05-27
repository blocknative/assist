export const initialState = {
  version: null,
  validApiKey: 'unknown',
  supportedNetwork: 'unknown',
  config: undefined,
  userAgent: null,
  mobileDevice: null,
  validBrowser: null,
  legacyWeb3: null,
  modernWeb3: null,
  web3Version: null,
  web3Instance: null,
  currentProvider: null,
  web3Wallet: null,
  legacyWallet: null,
  modernWallet: null,
  accessToAccounts: null,
  accountAddress: null,
  walletLoggedIn: null,
  walletEnabled: null,
  walletEnableCalled: null,
  walletEnableCanceled: null,
  accountBalance: null,
  minimumBalance: null,
  correctNetwork: null,
  userCurrentNetworkId: null,
  socket: null,
  pendingSocketConnection: null,
  socketConnection: null,
  transactionQueue: [],
  transactionAwaitingApproval: false,
  iframe: null,
  iframeDocument: null,
  iframeWindow: null,
  connectionId: null
}

export let state = Object.assign({}, initialState)

export function updateState(newState) {
  state = Object.assign({}, state, newState)
}

export function filteredState() {
  const {
    mobileDevice,
    validBrowser,
    currentProvider,
    web3Wallet,
    accessToAccounts,
    walletLoggedIn,
    walletEnabled,
    accountAddress,
    accountBalance,
    minimumBalance,
    userCurrentNetworkId,
    correctNetwork
  } = state

  return {
    mobileDevice,
    validBrowser,
    currentProvider,
    web3Wallet,
    accessToAccounts,
    walletLoggedIn,
    walletEnabled,
    accountAddress,
    accountBalance,
    minimumBalance,
    userCurrentNetworkId,
    correctNetwork
  }
}
