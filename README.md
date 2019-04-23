# Assist.js

Takes care of onboarding your users, keeping them informed about
transaction status and comprehensive usage analytics with minimal
setup. Supports `web3.js` versions 0.20 and 1.0.

_note: `web3.js` 1.0.0 beta versions 38, 39, 40, 41, 42, 43, 44, 45 have bugs when interacting with MetaMask, we recommend you avoid these versions of `web3.js`_

## Preview

![Assist's UI elements](https://i.imgur.com/UlJ8F7m.jpg)

☝️ A collection of Assist's UI elements.

👇 Assist's transaction notifications in action.

![Assist's transaction notifications](https://media.giphy.com/media/ZgSzBEev0pEym34rb1/giphy.gif)

## Getting Started

To integrate Assist.js into your dapp, you'll need to do 5 things:

1. Create a free account and get an API key from [account.blocknative.com](https://account.blocknative.com)
2. Install the widget
3. Initialize the library
4. Call `onboard`
5. Decorate your contracts

### Install the widget

#### npm

```bash
npm i bnc-assist
```

#### Yarn

```bash
yarn add bnc-assist
```

#### Script Tag

The library uses [semantic versioning](https://semver.org/spec/v2.0.0.html).
The current version is 0.5.3.
There are minified and non-minified versions.
Put this script at the top of your `<head>`

```html
<script src="https://assist.blocknative.com/0-5-3/assist.js"></script>

<!-- OR... -->

<script src="https://assist.blocknative.com/0-5-3/assist.min.js"></script>
```

### Initialize the Library

Full documentation of the `config` object is below, but the minimum required `config`
is as follows:

```javascript
var bncAssistConfig = {
  dappId: apiKey,       // [String] The API key created on https://account.blocknative.com

  networkId: networkId  // [Integer] The network ID of the Ethereum network your dapp is deployd on.
                        //           See below for instructions on how to setup for local blockchains.
};

var assistInstance = assist.init(bncAssistConfig);
```

### Call `onboard`

At some point in your dapp's workflow, you'll want to ensure users are within an environment which
will allow them to make transactions, such as a browser with MetaMask, unlocked wallet, etc.
This is done by calling `onboard`. Some dapps might want to call `onboard` immediately upon any page
load. Others may wait until loading certain pages or until a certain button is clicked.
In any event, it is as simple as calling:

```javascript
assistInstance.onboard()
  .then(function(success) {
    // User has been successfully onboarded and is ready to transact
    // This means we can be sure of the follwing user properties:
    //  - They are using a compatible browser
    //  - They have a web3-enabled wallet installed
    //  - The wallet is connected to the config-specified networkId
    //  - The wallet is unlocked and contains at least `minimumBalance` in wei
    //  - They have connected their wallet to the dapp, congruent with EIP1102
  })
  .catch(function(error) {
    // The user exited onboarding before completion
    // Will let you know what stage of onboarding the user was up to when they exited
    console.log(error.message);
  })
```

### Decorate Your Contracts

The first three steps in the getting started flow will get your users onboarded. This step adds
transaction support in order to help guide your users through a series of issues that can arise
when signing transactions.

Using our decorated contracts will also enable some anonymized transaction-level metrics to give
you insights into things including but not limited to:

- How many transactions fail because a user doesn't have enough Ether
- How many transactions are started but rejected by the user
- How many users come to your dapp without a web3 wallet

Decorating your contracts is simple:

```javascript
var myContract = new web3.eth.Contract(abi, address)
var myDecoratedContract = assistInstance.Contract(myContract)

// and then replace `myContract` with `myDecoratedContract`
// throughout your app
// ...

```

You can then use `myDecoratedContract` instead of `myContract`.

To speed things up, you can decorate the contract inline:

```javascript
var myContract = assistInstance.Contract(new web3.eth.Contract(abi, address))
```

## API Reference

### Config

A JavaScript Object that is passed to the `init` function. Default values are in [square brackets] where they are set by Assist.js.

```javascript
var config = {
  networkId: Number, // The network id of the Ethereum network your dapp is working with (REQUIRED)
  dappId: String, // The API key supplied to you by Blocknative (REQUIRED)
  web3: Object, // The instantiated version of web3 that the dapp is using
  mobileBlocked: Boolean, // Defines if the dapp works on mobile [false]
  minimumBalance: String, // Defines the minimum balance in Wei that a user needs to have to use the dapp [0]
  headlessMode: Boolean, // Turn off Assist UI, but still retain analytics collection [false]
  messages: {
    // See custom transaction messages section below for more details
    txRequest: Function, // Transaction request has been initiated and is awaiting user approval
    txSent: Function, // Transaction has been sent to the network
    txPending: Function, // Transaction is pending and has been detected in the mempool
    txSendFail: Function, // Transaction failed to be sent to the network
    txStall: Function, // Transaction was sent but not received in the mempool after 30 secs
    txFailed: Function, // Transaction failed
    nsfFail: Function, // User doesn't have enough funds to complete transaction
    txRepeat: Function, // Warning to user that they might be repeating a transaction
    txAwaitingApproval: Function, // Warning to the user that they have a previous transaction awaiting approval
    txConfirmReminder: Function, // A warning to the user that their current transaction is still awaiting approval
    txConfirmed: Function, // Transaction is confirmed
    txSpeedUp: Function // The user has re-submitted a transaction with a higher gas price
  },
  images: {
    welcome: {
      src: String, // Image URL for welcome onboard modal
      srcset: String // Image URL(s) for welcome onboard modal
    },
    complete: {
      src: String, // Image URL for complete onboard modal
      srcset: String // Image URL(s) for complete onboard modal
    }
  },
  style: {
    darkMode: Boolean, // Set Assist UI to dark mode
    notificationsPosition: String, // Defines which corner transaction notifications will be positioned. Options: 'topLeft', 'topRight', 'bottomRight', 'bottomLeft'. ['bottomRight']
    css: String // Custom css string to overide Assist default styles
  }
}
```

### Custom Transaction Messages

Custom transaction messages can be set to override the default messages `Assist` provides. To do this you provide callback functions for each `eventCode` that you want to override. The callback functions must return a `String` and will be called with the following object to provide context information about the transaction:

```javascript
{
  transaction: {
    to: String, // The address the transaction is going to
    gas: String, // Gas (wei)
    gasPrice: String, // Gas price (wei)
    hash: String, // The transaction hash
    nonce: Number, // The transaction nonce
    value: String // The value of the transaction (wei)
  },
  contract: {
    // This object will be undefined if it is not a contract transaction
    methodName: String, // The name of the method that was called
    parameters: Array // The parameters that the method was called with
  }
}
```

You can provide a `messages` object to the `config` to set global message overrides. Each callback can parse the context object that is passed to it and decide what to return or just return a standard message for each `eventCode`:

```javascript
var config = {
  //...
  messages: {
    txSent: function(data) {
      return 'Your transaction has been sent to the network'
    },
    txConfirmed: function(data) {
      if (data.contract.methodName === 'contribute') {
        return 'Congratulations! You are now a contributor to the campaign'
      }
    }
    // ....
  }
}
```

Sometimes you want more granular control over the transaction messages and you have all the relevant information you need to create a custom transaction message at the time of calling the method. In that case you can also add custom transactions messages inline with your transaction calls which take precedent over the messages set globally in the config.

#### Example

```javascript
// 0.2 style send
myContract.vote(param1, param2, options, callback, {messages: {txPending: () => `Voting for ${param1} in progress`}})

// 1.0 style send
myContract.vote(param1, param2).send(options, {messages: {txPending: () => `Voting for ${param1} in progress`}})
```

The `messages` object _must_ always be the _last_ argument provided to the send method for it to be recognized.

### Ethereum Network Ids

The available ids for the `networkId` property of the config object:

- `1`: mainnet
- `3`: ropsten testnet
- `4`: rinkeby testnet

*The kovan testnet is not supported.*

#### Local Networks

When you are running locally (e.g. using ganache), set `networkId` in the config to the network id that the local network is set to. Any number that is not `1`, `3`, `4` and `42` is valid and will be recognized as a local network. If using the Ganache CLI you can set the network id via the `--networkId` option.

### Errors

All errors are called with `eventCode` and `message` properties.

#### Example

```javascript
{
  eventCode: 'initFail',
  message: 'An API key is required to run Assist'
}
```

#### Error Codes

The following are the possible error codes from Assist.js.

```
initFail          - initialization of the library failed
mobileBlocked     - mobile browsers are blocked from accessing this dapp
browserFail       - browser is not compatible with web3.js wallets
walletFail        - user does not have a web3-enabled wallet installed
walletEnableFail  - user has not logged into their wallet
networkFail       - user's web3 wallet is not connected to the correct network
nsfFail           - user does not have enough funds in their wallet
```

### Headless Mode

By default, Assist will create UI elements in your application at certain times to guide users. You can disable this feature and run Assist in "headless mode" by setting `headlessMode: true` in the config. This still enables you to collect analytics, but won't change the underlying behaviour of your application at all.

### Mobile Dapps

Assist doesn't currently support mobile dapp browsers. If your dapp also _doesn't_ support mobile browsers, setting `mobileBlocked: true` in the config will detect mobile user agents and show UI that will direct them to use a desktop browser instead. If your dapp _does_ support mobile devices then Assist will be disabled and your transactions and contracts will work as normal. However if you call the `onboard` function when a user is on a mobile device, Assist will show a mobile not supported UI as onboarding isn't supported on mobile. So it is advised to check if a user is on a mobile device before calling `onboard`. Calling `getState` and referring to the `mobileDevice` property is an easy way of doing that.

### Minimum Balance

By supplying an amount of wei to the `minimumBalance` option of the config, developers can limit access to their dapp to users who have at least this much Ether in their wallet.

### Repeat Transactions

Assist will detect transactions which look to be repeated. We notify users of repeat transactions when we see sequential transactions with the same `to` address and the same `value`.

## API

### `init(config)`

#### Parameters

`config` - `Object`: Config object to configure and setup Assist (**Required**)

#### Returns

The initialized version of the Assist library

#### Example

```javascript
var assistInstance = assist.init(assistConfig)
```

### `onboard()`

#### Returns

`Promise`

- resolves with onboard success message if user has been successfully onboarded
- rejects with an error message if the user exits onboarding before completion. The error will detail the stage of onboarding the user was up to when they exited

#### Example

```javascript
assistInstance.onboard()
  .then(function(success) {
    // User has been successfully onboarded and is ready to transact
  })
  .catch(function(error) {
    // The user exited onboarding before completion
    console.log(error.message) // Will let you know what stage of onboarding the user was up to when they exited
  })
```

### `Contract(contractInstance)`

#### Parameters

`contractInstance` - `Object`: Instantiated web3 `contract` object (**Required**)

#### Returns

A decorated `contract` to be used instead of the original instance

#### Example

```javascript
const myContract = new web3.eth.Contract(abi, address)
const myDecoratedContract = assistInstance.Contract(myContract)

mydecoratedContract.myMethod().call()
```

### `Transaction(txObject [, callback])`

#### Parameters

`txObject` - `Object`: Transaction object (**Required**)
`callback` - `Function`: Optional error first style callback if you don't want to use promises

#### Returns

`Promise` or `PromiEvent` (`web3.js 1.0`)

- resolves with transaction hash
- rejects with an error message

#### Example

```javascript
assistInstance.Transaction(txObject)
  .then(txHash => {
    // Transaction has been sent to the network
  })
  .catch(error => {
    console.log(error.message) // => 'User has insufficient funds'
  })
```

### `getState()`

#### Returns

`Promise`

- resolves with the current state of the app represented as a JavaScript Object

```javascript
state = {
  mobileDevice: Boolean, // User is on a mobile device
  validBrowser: Boolean, // User is on a valid web3 browser
  currentProvider: String, // Current provider being used to connect to the network
  web3Wallet: Boolean, // User has a web3Wallet installed
  accessToAccounts: Boolean, // Dapp has access to accounts
  walletLoggedIn: Boolean, // User is logged in to wallet
  walletEnabled: Boolean, // User has enabled EIP 1102 compliant wallet
  accountAddress: String, // Address of the user's selected account
  accountBalance: String, // User account balance
  minimumBalance: String, // User has the minimum balance specified in the config
  userCurrentNetworkId: Number, // Network id of the network the user is currently on
  correctNetwork: Boolean, // User is on the network specified in the config
}
```

#### Example

```javascript
assistInstance.getState()
  .then(function(state) {
    if (state.validBrowser) {
      console.log('valid browser')
    }
  })
```

## Contribute

### Installing Dependencies

#### npm

`npm i`

#### Yarn

`yarn`

### Tests

#### npm

`npm test`

#### Yarn

`yarn test`

### Building

#### npm

`npm run build`

#### Yarn

`yarn build`
