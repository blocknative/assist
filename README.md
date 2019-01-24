# assist.js

Takes care of onboarding your users, keeping them informed about
transaction status and comprehensive usage analytics with minimal
setup. Supports web3 versions 0.20 and 1.0.

## Preview

![Assist's UI elements](https://i.imgur.com/UlJ8F7m.jpg)

☝️ A collection of Assist's UI elements.

👇 Assist's transaction notifications in action.

![Assist's transaction notifications](https://media.giphy.com/media/ZgSzBEev0pEym34rb1/giphy.gif)


## Getting Started

To integrate `assist.js` into your dapp, you'll need to do 4 things:

1. Install the widget
2. Initialize the library
3. Call `onboard`
4. Decorate your contracts

### Install the widget

Our widget is currently hosted on S3.
The library uses [semantic versioning](https://semver.org/spec/v2.0.0.html).
The current version 0.2.0.
There are minified and non-minified versions.
Put this script at the top of your `<head>`
 
```html
<script src="https://s3.amazonaws.com/bnc-assist/0-2-0/assist.js"
  integrity="sha384-wtXu8HYQaAoqqmGxbJa799ue405EZi/uNhmblOFpOQOAcL0Tk5wUCYfbELA4OvP6"
  crossorigin="anonymous"></script>

<!-- OR... -->

<script src="https://s3.amazonaws.com/bnc-assist/0-2-0/assist.min.js"
  integrity="sha384-1pabeMrnax5diGU6TvH3LqKx5EOLvgHy7gv0Kyh7l+qMr/YsQ82W2eXWXcAW6gfz"
  crossorigin="anonymous"></script>
```

A module will be available on NPM in the coming weeks.

### Initialize the library

Full documentation of the `config` object is below, but the minimum required `config`
is as follows:

```javascript
var bncAssistConfig = {
  dappId: dappId,       // [String] The dapp ID supplied to you by Blocknative when you sign up for an account
  networkId: networkId  // [Integer] The network ID of the Ethereum network your dapp is deployd on.
                        //           See below for instructions on how to setup for local blockchains.
};

var assistInstance = assist.init(bncAssistConfig);
```

### Call `onboard` 

At some point in your dapp's workflow, you'll want to ensure users have the proper environment.
This is done by calling `onboard`. Some dapps will call `onboard` immediately upon any page
load. Others may wait until loading certain pages or until a certain button is clicked.
In any event, it is as simple as calling:

```javascript
assistInstance.onboard()
  .then(function(success) {
    // User has been successfully onboarded and is ready to transact
  })
  .catch(function(error) {
    // The user exited onboarding before completion
    // Will let you know what stage of onboarding the user was up to when they exited
    console.log(error.msg);
  })
```

### Decorate your contracts

The first three steps in the getting started flow will get your users onboarded. This step adds
transaction support in order to help guide your users through a series of issues that can arise
when signing transactions.

Using our decorated contracts will also enable some transaction-level metrics tracking to give
you insights into things like:

- How many transactions fail because a user doesn't have enough Ether
- How many transactions are started but rejected by the user

Decorating your contracts is simple:

```javascript
var myContract = new web3.eth.Contract(abi, address);
var myDecoratedContract = assistInstance.Contract(myContract)

// and then replace `myContract` with `myDecoratedContract`
// throughout your app
// ...

```

You can then use `myDecoratedContract` instead of `myContract`.

To speed things up, you can replace the contract after saving the original:

```javascript
var myContract = new web3.eth.Contract(abi, address);
var originalMyContract = myContract;
myContract = assistInstance.Contract(myContract)
```

## API Reference 

### Config

A JavaScript Object that is passed to the `init` function.

```javascript
var config = {
  networkId: Number, // The network id of the Ethereum network your Dapp is working with (REQUIRED)
  dappId: String, // The api key supplied to you by Blocknative (REQUIRED)
  web3: Object, // The instantiated version of web3 that the Dapp is using
  mobileBlocked: Boolean, // Defines if the Dapp works on mobile
  minimumBalance: String, // Defines the minimum balance in Wei that a user needs to have to use the Dapp
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
called with the following object so that a custom string can be returned:

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

#### Local networks

When you are running locally (e.g. using ganache), set `networkId` to `0`.
This represents a local network.

### Errors

All errors are called with `eventCode` and `msg` properties

#### Example

```javascript
{
  eventCode: 'initFail',
  msg: 'A api key is required to run assist'
}
```

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
- rejects with an error msg if the user exits onboarding before completion. The error will detail the stage of onboarding the user was up to when they exited

#### Example

```javascript
da.onboard()
  .then(function(success) {
    // User has been successfully onboarded and is ready to transact
  })
  .catch(function(error) {
    // The user exited onboarding before completion
    console.log(error.msg) // Will let you know what stage of onboarding the user was up to when they exited
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
- rejects with an error msg

#### Example

```javascript
da.Transaction(txObject)
  .then(txHash => {
    // Transaction has been sent to the network
  })
  .catch(error => {
    console.log(error.msg) // => 'User has insufficient funds'
  })
```

### `getState()`

#### Returns

`Promise`

- resolves with the current state of the app represented as a JavaScript Object

```javascript
state = {
  config: Object,
  legacyWeb3: Boolean,
  modernWeb3: Boolean,
  web3Version: String,
  web3: Object,
  userAgent: String,
  validKey: Boolean,
  newUser: Boolean,
  userWelcomed: Boolean,
  currentProvider: String,
  validBrowser: Boolean,
  web3Wallet: Boolean,
  legacyWallet: Boolean,
  modernWallet: Boolean,
  accessToAccounts: Boolean,
  walletLoggedIn: Boolean,
  walletEnabled: Boolean,
  walletEnableCalled: Boolean,
  walletEnableCanceled: Boolean,
  correctNetwork: Boolean,
  userCurrentNetworkId: Number,
  minimumBalance: String,
  socket: Object,
  socketConnection: Boolean,
  accountAddress: String,
  accountBalance: String,
  transactionQueue: Array,
  transactionAwaitingApproval: Boolean,
  iframe: Object,
  iframeDocument: Object,
  iframeWindow: Object
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

### Installing dependencies

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
