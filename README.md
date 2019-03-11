# assist.js

Takes care of onboarding your users, keeping them informed about
transaction status and comprehensive usage analytics with minimal
setup. Supports web3 versions 0.20 and 1.0 (up to version `1.0.0-beta-37`).

## Preview

![Assist's UI elements](https://i.imgur.com/UlJ8F7m.jpg)

☝️ A collection of Assist's UI elements.

👇 Assist's transaction notifications in action.

![Assist's transaction notifications](https://media.giphy.com/media/ZgSzBEev0pEym34rb1/giphy.gif)


## Getting Started

To integrate `assist.js` into your dapp, you'll need to do 5 things:

1. Create a free account and get an API key from [blocknative.com](https://blocknative.com)
2. Install the widget
3. Initialize the library
4. Call `onboard`
5. Decorate your contracts

### Install the widget

#### npm

```
npm i bnc-assist
```

#### Script Tag
The library uses [semantic versioning](https://semver.org/spec/v2.0.0.html).
The current version is 0.3.5.
There are minified and non-minified versions.
Put this script at the top of your `<head>`
 
```html
<script src="https://assist.blocknative.com/0-3-5/assist.js"></script>

<!-- OR... -->

<script src="https://assist.blocknative.com/0-3-5/assist.min.js"></script>
```

### Initialize the Library

Full documentation of the `config` object is below, but the minimum required `config`
is as follows:

```javascript
var bncAssistConfig = {
  dappId: dappId,       // [String] The API key supplied to you by Blocknative when you sign up for an account

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
    console.log(error.msg);
  })
```

### Decorate Your Contracts

The first three steps in the getting started flow will get your users onboarded. This step adds
transaction support in order to help guide your users through a series of issues that can arise
when signing transactions.

Using our decorated contracts will also enable some anonymised transaction-level metrics to give
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

To speed things up, you can replace the contract after saving the original:

```javascript
var myContract = new web3.eth.Contract(abi, address)
var originalMyContract = myContract
myContract = assistInstance.Contract(myContract)
```

## API Reference

### Config

A JavaScript Object that is passed to the `init` function. Default values are in [square brackets] where they are set by assist.js.

```javascript
var config = {
  networkId: Number, // The network id of the Ethereum network your Dapp is working with (REQUIRED)
  dappId: String, // The API key supplied to you by Blocknative (REQUIRED)
  web3: Object, // The instantiated version of web3 that the Dapp is using
  mobileBlocked: Boolean, // Defines if the Dapp works on mobile [false]
  minimumBalance: String, // Defines the minimum balance in Wei that a user needs to have to use the Dapp [0]
  headlessMode: Boolean, // Turn off Assist UI, but still retain analytics collection [false]
  messages: {
    // See custom transaction messages section below for more details
    txPending: Function, // Transaction is pending and awaiting confirmation
    txSent: Function, // Transaction has been sent to the network
    txSendFail: Function, // Transaction failed to be sent to the network
    txStall: Function, // Transaction was sent but not received in the mempool after 30 secs
    txFailed: Function, // Transaction failed
    nsfFail: Function, // User doesn't have enough funds to complete transaction
    txRepeat: Function, // Warning to user that they might be repeating a transaction
    txAwaitingApproval: Function, // Warning to user that they have a previous transaction awaiting approval
    txConfirmReminder: Function, // A warning to the user that their transaction is still awaiting approval
    txConfirmed: Function // Transaction is confirmed
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
  }
}
```

### Custom Transaction Messages

The functions provided to the `messages` object in the config, will be
called with the following object so that a custom message string can be returned:


```javascript
{
  transaction: {
    to: String, // The address the transaction was going to
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

#### Example

```javascript
var config = {
  //...
  messages: {
    txConfirmed: function(data) {
      if (data.contract.methodName === 'contribute') {
        return 'Congratulations! You are now a contributor to the campaign'
      }
    }
  }
}
```

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
  message: 'An API key is required to run assist'
}
```

#### Error Codes

The following are the possible error codes from assist.js.

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

By default, assist will create UI elements in your application at certain times to guide users. You can disable this feature and run assist in "headless mode" by setting `headlessMode: true` in the config. This still enables you to collect analytics, but won't change the underlying behaviour of your application at all.

### Mobile Dapps

By default assist's UI elements are responsive and support mobile displays, however some dapps don't work effectively in mobile viewports or with mobile web3 providers like Status.im or Coinbase Wallet. setting `mobileBlocked: true` in the config will detect mobile user agents and direct them to use a desktop browser instead.

### Minimum Balance

By supplying an amount of wei to the `minimumBalance` option of the config, developers can limit access to their dapp to users who have at least this much ETH in their wallet.

### Repeat Transactions

Assist will detect transactions which look to be repeated. We notify users of repeat transactions when we see sequential transactions with the same `to` address and the same `value`.

## API

### `init(config)`

#### Parameters

`config` - `Object`: Config object to configure and setup assist (**Required**)

#### Returns

The initialized version of the assist library

#### Example

```javascript
var assistLib = assist.init(assistConfig)
```

### `onboard()`

#### Returns

`Promise`

- resolves with onboard success message if user has been successfully onboarded
- rejects with an error message if the user exits onboarding before completion. The error will detail the stage of onboarding the user was up to when they exited

#### Example

```javascript
da.onboard()
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
const myDecoratedContract = da.Contract(myContract)

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
da.Transaction(txObject)
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
  version: String,
  validApiKey: Boolean,
  supportedNetwork: Boolean,
  config: Object,
  userAgent: String,
  mobileDevice: Boolean,
  validBrowser: Boolean,
  legacyWeb3: Boolean,
  modernWeb3: Boolean,
  web3Version: String,
  web3Instance: Object,
  currentProvider: String,
  web3Wallet: Boolean,
  legacyWallet: Boolean,
  modernWallet: Boolean,
  accessToAccounts: Boolean,
  walletLoggedIn: Boolean,
  walletEnabled: Boolean,
  walletEnableCalled: Boolean,
  walletEnableCanceled: Boolean,
  accountBalance: String,
  correctNetwork: Boolean,
  minimumBalance: String,
  correctNetwork: Boolean,
  userCurrentNetworkId: Number,
  socket: Object,
  pendingSocketConnection: Boolean,
  socketConnection: Boolean,
  accountAddress: String,
  transactionQueue: Array,
  transactionAwaitingApproval: Boolean,
  iframe: Object,
  iframeDocument: Object,
  iframeWindow: Object,
  connectionId: String
}
```

#### Example

```javascript
da.getState()
  .then(function(state) {
    if (state.validBrowser) {
      console.log('valid browser')
    }
  })
```

## Contribute

### Installing Dependencies

#### NPM

`npm i`

#### Yarn

`yarn`

### Tests

#### NPM

`npm test`

#### Yarn

`yarn test`

### Building

#### NPM

`npm run build`

#### Yarn

`yarn build`
