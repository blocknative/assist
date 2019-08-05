import { state } from '~/js/helpers/state'
import { capitalize, networkName } from '~/js/helpers/utilities'

import welcome from '../../../lib/images/XUPOg7L.jpg'
import welcome2x from '../../../lib/images/s8euD9T.jpg'

import browser from '../../../lib/images/EgcXT0z.jpg'
import browser2x from '../../../lib/images/4zplgXa.jpg'

import metamask from '../../../lib/images/tKkRH5L.jpg'
import metamask2x from '../../../lib/images/BEhzPx6.jpg'

import login from '../../../lib/images/HuDHbXP.jpg'
import login2x from '../../../lib/images/XLBqwPO.jpg'

import connect from '../../../lib/images/0VBtqGV.jpg'
import connect2x from '../../../lib/images/t7WS9Sc.jpg'

import network from '../../../lib/images/1TWEHRY.jpg'
import network2x from '../../../lib/images/jfdXqIU.jpg'

import complete from '../../../lib/images/8ptZott.jpg'
import complete2x from '../../../lib/images/elR9xQ8.jpg'

import blockNativeLogo from '../../../lib/images/fJxOtIj.png'
import blockNativeLogo2x from '../../../lib/images/UhcCuKF.png'

import blockNativeLogoLight from '../../../lib/images/bn-branding-white.png'
import blockNativeLogoLight2x from '../../../lib/images/bn-branding-white@2x.png'

import mobile from '../../../lib/images/EcUxQVJ.jpg'
import mobile2x from '../../../lib/images/GS6owd9.jpg'

import mobileLight from '../../../lib/images/mobile-not-supported-white.png'
import mobileLight2x from '../../../lib/images/mobile-not-supported-white@2x.png'

import browserFail from '../../../lib/images/riXzN0X.jpg'
import browserFail2x from '../../../lib/images/xpWtOVX.jpg'

import browserFailLight from '../../../lib/images/browser-not-supported-white.png'
import browserFailLight2x from '../../../lib/images/browser-not-supported-white@2x.png'

import chromeLogo from '../../../lib/images/XAwAAmL.png'
import chromeLogo2x from '../../../lib/images/maxXVIH.png'

import firefoxLogo from '../../../lib/images/WjOSJTh.png'
import firefoxLogo2x from '../../../lib/images/kodZvyO.png'

import mobileWalletLight from '../../../lib/images/mobile-wallet-required-white.png'
import mobileWalletLight2x from '../../../lib/images/mobile-wallet-required-white@2x.png'

import mobileWallet from '../../../lib/images/mobile-wallet-required.png'
import mobileWallet2x from '../../../lib/images/mobile-wallet-required@2x.png'

import trustLogo from '../../../lib/images/trust.png'
import trustLogo2x from '../../../lib/images/trust@2x.png'

import coinbaseLogo from '../../../lib/images/coinbase.png'
import coinbaseLogo2x from '../../../lib/images/coinbase@2x.png'

import braveLogo from '../../../lib/images/brave.png'
import braveLogo2x from '../../../lib/images/brave@2x.png'

import operaLogo from '../../../lib/images/opera.png'
import operaLogo2x from '../../../lib/images/opera@2x.png'

import operaTouchLogo from '../../../lib/images/opera-touch.png'
import operaTouchLogo2x from '../../../lib/images/opera-touch@2x.png'

export const notSupported = {
  mobileNotSupported: {
    heading: 'Mobile Not Supported',
    description: () =>
      'Our distributed application does not support mobile browsers. Please visit our site on a desktop browser. Thank you!'
  },
  browserNotSupported: {
    heading: 'This Browser is Not Supported',
    description: () =>
      `This Dapp is not supported in ${state.userAgent.browser.name}. Please visit us in one of the following browsers. Thank You!`
  },
  mobileWalletNotSupported: {
    heading: 'Install A Mobile Dapp Wallet',
    description: () =>
      'A mobile ethereum wallet is needed to use this dapp. We recommend one of the following mobile wallets.'
  }
}

export const onboardHeading = {
  mobileNetwork: { advanced: () => 'Switch to the Correct Network' },
  mobileWalletEnable: { advanced: () => 'Connect Wallet' },
  '0': { basic: () => 'Let’s Get You Started' },
  '1': {
    basic: () =>
      `Install ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'a Wallet'
      }`
  },
  '2': {
    basic: () =>
      `Login to ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'Your Wallet'
      }`,
    advanced: () =>
      `Login to ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'Your Wallet'
      }`
  },
  '3': {
    basic: () =>
      `Connect to ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'Your Wallet'
      }`,
    advanced: () =>
      `Connect to ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'Your Wallet'
      }`
  },
  '4': {
    basic: () => 'Join the Correct Network',
    advanced: () => 'Wrong Network'
  },
  '5': {
    basic: () => 'Get Some Ether',
    advanced: () => 'Get Some ETH'
  },
  '6': { basic: () => 'Ready to Go' }
}

export const onboardDescription = {
  mobileNetwork: {
    advanced: () =>
      `We’ve detected that you need to be on the ${networkName(
        state.config.networkId
      ) ||
        'mainnet'} network for this application but you have your wallet set to ${networkName(
        state.userCurrentNetworkId
      )}. Please switch to the correct network.`
  },
  mobileWalletEnable: {
    advanced: () => 'Please allow connection to your wallet'
  },
  '0': {
    basic: () =>
      'To use this feature you’ll need to be set up and ready to use the blockchain. This onboarding guide will walk you through each step of the process. It won’t take long and at any time you can come back and pick up where you left off.'
  },
  '1': {
    basic: () =>
      state.currentProvider === 'metamask'
        ? 'We use a product called MetaMask to manage everything you need to interact with a blockchain application like this one. MetaMask is free, installs right into your browser, hyper secure, and can be used for any other blockchain application you may want to use. <a href="https://metamask.io/" target="_blank">Get MetaMask now</a>'
        : 'A wallet is used to manage everything you need to interact with a blockchain application like this one. Wallets are either built into your browser or an extension added to your browser. They are hyper secure, and can be used for any other blockchain application you may want to use.'
  },
  '2': {
    basic: () =>
      `Now you have ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'a wallet'
      } installed, you’ll need to log into it. The first time you use it, you may need to set up an account. When you’ve got that set up and you’re logged in, let us know.`,
    advanced: () =>
      `We’ve detected you are not logged in to ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'your wallet'
      }. Please log in to continue using the blockchain enabled features of this application.`
  },
  '3': {
    basic: () => 'Please allow connection to your wallet',
    advanced: () => 'Connect your wallet to interact with this Dapp'
  },
  '4': {
    basic: () =>
      `Blockchain applications have different networks they can work on. Think of this like making sure you’re on Netflix vs Hulu to watch your favorite show. We’ve detected that you need to be on the ${networkName(
        state.config.networkId
      ) || 'mainnet'} network for this application but you have ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'your wallet'
      } set to ${networkName(
        state.userCurrentNetworkId
      )}. Switch the network name in ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'your wallet'
      } and you’ll be ready to go.`,
    advanced: () =>
      `We’ve detected that you need to be on the ${networkName(
        state.config.networkId
      ) || 'mainnet'} network for this application but you have ${
        state.currentProvider === 'metamask' ? 'MetaMask' : 'your wallet'
      } set to ${networkName(
        state.userCurrentNetworkId
      )}. Please switch to the correct network.`
  },
  '5': {
    basic: () =>
      `Blockchain applications sometimes require Ether to perform various functions. You’ll need at least ${state
        .config.minimumBalance /
        1000000000000000000} Ether (ETH) for this application.`,
    advanced: () =>
      `Blockchain applications sometimes require Ether to perform various functions. You’ll need at least ${state
        .config.minimumBalance /
        1000000000000000000} Ether (ETH) for this application.`
  },
  '6': {
    basic: () =>
      'You have successfully completed all the steps necessary to use this application. Welcome to the world of blockchain.'
  }
}

export const onboardButton = {
  mobileWallet: { advanced: 'CHECK MY MOBILE WALLET' },
  mobileNetwork: { advanced: 'CHECK MY NETWORK' },
  mobileWalletEnable: { advanced: 'CHECK THAT I’M CONNECTED' },
  '0': { basic: 'I’M READY' },
  '1': {
    basic: () =>
      `CHECK THAT I HAVE ${
        state.currentProvider === 'metamask' ? 'METAMASK' : 'A WALLET'
      }`
  },
  '2': {
    basic: 'CHECK THAT I’M LOGGED IN',
    advanced: 'CHECK THAT I’M LOGGED IN'
  },
  '3': {
    basic: 'CHECK THAT I’M CONNECTED',
    advanced: 'CHECK THAT I’M CONNECTED'
  },
  '4': {
    basic: 'CHECK THAT I’M ON THE RIGHT NETWORK',
    advanced: 'CHECK MY NETWORK'
  },
  '5': {
    basic: 'CHECK THAT I HAVE ETHER',
    advanced: 'I HAVE ENOUGH ETH'
  },
  '6': { basic: 'BACK TO THE APP' }
}

export function onboardWarningMsg(type) {
  const { mobileDevice, currentProvider } = state
  const isMetaMask = currentProvider === 'metamask'
  switch (type) {
    case 'loggedIn':
      return `You are not currently logged in to ${
        mobileDevice || !isMetaMask ? 'your wallet' : 'MetaMask'
      }.`
    case 'enabled':
      return `You have not yet approved the connect request in ${
        mobileDevice || !isMetaMask ? 'your wallet' : 'MetaMask'
      }.`
    case 'network':
      return `You currently have ${
        mobileDevice || !isMetaMask ? 'your wallet' : 'MetaMask'
      } set to the ${capitalize(networkName(state.userCurrentNetworkId))} ${
        state.userCurrentNetworkId === 1 ? 'Ethereum' : 'Test'
      } Network.`
    case 'minimumBalance':
      return `Your current ${
        mobileDevice || !isMetaMask ? 'wallet' : 'MetaMask'
      } account has less than the necessary minimum balance of
        ${state.config.minimumBalance / 1000000000000000000} ${capitalize(
        networkName(state.userCurrentNetworkId)
      )} ${
        state.userCurrentNetworkId === 1 ? 'Ethereum' : 'Test'
      } Network Ether (ETH).`
    default:
      return undefined
  }
}

export const imageSrc = {
  blockNativeLogo: {
    src: blockNativeLogo,
    srcset: blockNativeLogo2x
  },
  blockNativeLogoLight: {
    src: blockNativeLogoLight,
    srcset: blockNativeLogoLight2x
  },
  mobile: {
    src: mobile,
    srcset: mobile2x
  },
  browser: {
    src: browserFail,
    srcset: browserFail2x
  },
  mobileLight: {
    src: mobileLight,
    srcset: mobileLight2x
  },
  browserLight: {
    src: browserFailLight,
    srcset: browserFailLight2x
  },
  chromeLogo: {
    src: chromeLogo,
    srcset: chromeLogo2x
  },
  firefoxLogo: {
    src: firefoxLogo,
    srcset: firefoxLogo2x
  },
  trustLogo: {
    src: trustLogo,
    srcset: trustLogo2x
  },
  coinbaseLogo: {
    src: coinbaseLogo,
    srcset: coinbaseLogo2x
  },
  braveLogo: {
    src: braveLogo,
    srcset: braveLogo2x
  },
  operaLogo: {
    src: operaLogo,
    srcset: operaLogo2x
  },
  operaTouchLogo: {
    src: operaTouchLogo,
    srcset: operaTouchLogo2x
  },
  mobileWallet: {
    src: mobileWallet,
    srcset: mobileWallet2x
  },
  mobileWalletLight: {
    src: mobileWalletLight,
    srcset: mobileWalletLight2x
  },
  mobileNetwork: {
    src: network,
    srcset: network2x
  },
  '0': {
    src: welcome,
    srcset: welcome2x
  },
  '1': {
    src: browser,
    srcset: browser2x
  },
  '2': {
    src: metamask,
    srcset: metamask2x
  },
  '3': {
    src: login,
    srcset: login2x
  },
  '4': {
    src: connect,
    srcset: connect2x
  },
  '5': {
    src: network,
    srcset: network2x
  },
  '6': {
    src: complete,
    srcset: complete2x
  }
}

export const transactionMsgs = {
  txRequest: () => `Your transaction is waiting for you to confirm`,
  txPending: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has started`,
  txSent: () => `Your transaction has been sent to the network`,
  txSendFail: () => `You rejected the transaction`,
  txStallPending: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has stalled and has not entered the transaction pool`,
  txStallConfirmed: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has stalled and hasn't been confirmed`,
  txFailed: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has failed`,
  nsfFail: () => 'You have insufficient funds to complete this transaction',
  txRepeat: () => 'This could be a repeat transaction',
  txAwaitingApproval: () =>
    'You have a previous transaction waiting for you to confirm',
  txConfirmReminder: () =>
    'Please confirm your transaction to continue (hint: the transaction window may be behind your browser)',
  txConfirmed: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has succeeded`,
  txSpeedUp: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has been sped up`,
  txCancel: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} is being canceled`
}
