import { state } from '../helpers/state'
import { capitalize, networkName } from '../helpers/utilities'

export const notSupported = {
  mobileNotSupported: {
    heading: 'Mobile Not Supported',
    description: () =>
      'Our distributed application does not support mobile browsers. Please visit our site on a desktop browser. Thank you!'
  },
  browserNotSupported: {
    heading: 'This Browser is Not Supported',
    description: () =>
      `This Dapp is not supported in ${
        state.userAgent.browser.name
      }. Please visit us in one of the following browsers. Thank You!`
  }
}

export const onboardHeading = {
  '0': { basic: 'Let’s Get You Started' },
  '1': { basic: 'Install MetaMask' },
  '2': {
    basic: 'MetaMask Login',
    advanced: 'Login to MetaMask'
  },
  '3': {
    basic: 'MetaMask Connect',
    advanced: 'Connect MetaMask'
  },
  '4': {
    basic: 'Join the Correct Network',
    advanced: 'Wrong Network'
  },
  '5': {
    basic: 'Get Some Ether',
    advanced: 'Get Some ETH'
  },
  '6': { basic: 'Ready to Go' }
}

export const onboardDescription = {
  '0': {
    basic: () =>
      'To use this feature you’ll need to be set up and ready to use the blockchain. This onboarding guide will walk you through each step of the process. It won’t take long and at any time you can come back and pick up where you left off.'
  },
  '1': {
    basic: () =>
      'We use a product called MetaMask to manage everything you need to interact with a blockchain application like this one. MetaMask is free, installs right into your browser, hyper secure, and can be used for any other blockchain application you may want to use. <a href="https://metamask.io/" target="_blank">Get MetaMask now</a>'
  },
  '2': {
    basic: () =>
      'Now you have MetaMask installed, you’ll need to log into it. The first time you use it, you may need to set up an account with MetaMask which you can do right from the extension. When you’ve got that set up and you’re logged into MetaMask, let us know.',
    advanced: () =>
      'We’ve detected you are not logged into MetaMask. Please log in to continue using the blockchain enabled features of this application.'
  },
  '3': {
    basic: () => 'Please allow connection to your wallet',
    advanced: () => 'Connect your wallet to interact with this Dapp'
  },
  '4': {
    basic: () =>
      `Blockchain applications have different networks they can work on. Think of this like making sure you’re on Netflix vs Hulu to watch your favorite show. We’ve detected that you need to be on the ${networkName(
        state.config.networkId
      ) ||
        'mainnet'} network for this application but you have MetaMask set to ${networkName(
        state.userCurrentNetworkId
      )}. Switch the network name in MetaMask and you’ll be ready to go.`,
    advanced: () =>
      `We’ve detected that you need to be on the ${networkName(
        state.config.networkId
      ) ||
        'mainnet'} network for this application but you have MetaMask set to ${networkName(
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
  '0': { basic: 'I’M READY' },
  '1': {
    basic: 'CHECK THAT I HAVE METAMASK'
  },
  '2': {
    basic: 'CHECK THAT I’M LOGGED IN',
    advanced: 'CHECK THAT I’M LOGGED IN'
  },
  '3': {
    basic: "CHECK THAT I'M CONNECTED",
    advanced: "CHECK THAT I'M CONNECTED"
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
  switch (type) {
    case 'loggedIn':
      return 'You are not currently logged in to MetaMask.'
    case 'enabled':
      return 'You have not yet approved the Connect request in MetaMask.'
    case 'network':
      return `You currently have MetaMask set to the ${capitalize(
        networkName(state.userCurrentNetworkId)
      )} ${state.userCurrentNetworkId === '1' ? 'Ethereum' : 'Test'} Network.`
    case 'minimumBalance':
      return `Your current MetaMask account has less than the necessary minimum balance of
        ${state.config.minimumBalance / 1000000000000000000} ${capitalize(
        networkName(state.userCurrentNetworkId)
      )} ${
        state.userCurrentNetworkId === '1' ? 'Ethereum' : 'Test'
      } Network Ether (ETH).`
    default:
      return undefined
  }
}

export const imageSrc = {
  blockNativeLogo: {
    src: 'https://assist.blocknative.com/images/fJxOtIj.png',
    srcset: 'https://assist.blocknative.com/images/UhcCuKF.png 2x'
  },
  mobile: {
    src: 'https://assist.blocknative.com/images/EcUxQVJ.jpg',
    srcset: 'https://assist.blocknative.com/images/GS6owd9.jpg 2x'
  },
  browser: {
    src: 'https://assist.blocknative.com/images/riXzN0X.jpg',
    srcset: 'https://assist.blocknative.com/images/xpWtOVX.jpg 2x'
  },
  chromeLogo: {
    src: 'https://assist.blocknative.com/images/XAwAAmL.png',
    srcset: 'https://assist.blocknative.com/images/maxXVIH.png 2x'
  },
  firefoxLogo: {
    src: 'https://assist.blocknative.com/images/WjOSJTh.png',
    srcset: 'https://assist.blocknative.com/images/kodZvyO.png 2x'
  },
  '0': {
    src: 'https://assist.blocknative.com/images/XUPOg7L.jpg',
    srcset: 'https://assist.blocknative.com/images/s8euD9T.jpg 2x'
  },
  '1': {
    src: 'https://assist.blocknative.com/images/EgcXT0z.jpg',
    srcset: 'https://assist.blocknative.com/images/4zplgXa.jpg 2x'
  },
  '2': {
    src: 'https://assist.blocknative.com/images/tKkRH5L.jpg',
    srcset: 'https://assist.blocknative.com/images/BEhzPx6.jpg 2x'
  },
  '3': {
    src: 'https://assist.blocknative.com/images/HuDHbXP.jpg',
    srcset: 'https://assist.blocknative.com/images/XLBqwPO.jpg 2x'
  },
  '4': {
    src: 'https://assist.blocknative.com/images/0VBtqGV.jpg',
    srcset: 'https://assist.blocknative.com/images/t7WS9Sc.jpg 2x'
  },
  '5': {
    src: 'https://assist.blocknative.com/images/1TWEHRY.jpg',
    srcset: 'https://assist.blocknative.com/images/jfdXqIU.jpg 2x'
  },
  '6': {
    src: 'https://assist.blocknative.com/images/8ptZott.jpg',
    srcset: 'https://assist.blocknative.com/images/elR9xQ8.jpg 2x'
  }
}

export const transactionMsgs = {
  txPending: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has started`,
  txSent: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has been sent to the network`,
  txSendFail: () => `You rejected the transaction`,
  txStall: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has stalled`,
  txFailed: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has failed`,
  nsfFail: () => 'You have insufficient funds to complete this transaction',
  txRepeat: () => 'This could be a repeat transaction',
  txAwaitingApproval: () => 'You have a previous transaction awaiting approval',
  txConfirmReminder: () =>
    'Please confirm your transaction to continue (hint: the transaction window may be behind your browser)',
  txConfirmed: ({ transaction }) =>
    `Your transaction ID: ${transaction.nonce} has succeeded`
}
