# assist.js

Takes care of onboarding your users, transaction support and smart contract analytics with minimal setup. Supports web3 versions 0.2 and 1.0.

## Installation

### CDN

```html
<script src="https://blocknative-alpha.s3.amazonaws.com/assist.js"></script>
<script src="https://blocknative-alpha.s3.amazonaws.com/assist.min.js"></script>
```

## Documentation

### Config

A JavaScript Object that is passed to the `init` function.

```javascript
const config = {

  networkId: Number, // The network id of the Ethereum network your Dapp is working with (REQUIRED)
  dappId: String, // The api key supplied to you by Blocknative (REQUIRED)
  web3: Object, // The instantiated version of web3 that the Dapp is using
  mobileBlocked: Boolean, // Defines if the Dapp works on mobile
  minimumBalance: String, // Defines the minimum balance in Wei that a user needs to have to use the Dapp
  messages: { // See custom transaction messages section below for more details
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

The functions provided to the `messages` object in the config, will be called with the following object so that a custom string can be returned:

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
const config = {
  //...
  messages: {
    txConfirmed: data => {
      const { contract } = data
      if (contract.methodName === 'contribute') {
        return 'Congratulations! You are now a contributor to the campaign'
      }
    }
  }
}
```

### Ethereum Network Ids

The available ids for the `networkId` property of the config object:

- `5777`: local - any number that isn't listed below will be treated as a local network
- `1`: main
- `3`: ropsten
- `4`: rinkeby
- `42`: kovan (not supported)

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
const assistLib = assist.init(assistConfig)
```

### `onboard()`

#### Returns

`Promise`

- resolves with onboard success message if user has been successfully onboarded
- rejects with an error msg if the user exits onboarding before completion. The error will detail the stage of onboarding the user was up to when they exited

#### Example

```javascript
da.onboard().then(success => {
  // User has been successfully onboarded and is ready to transact
}).catch(error => {
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
da.Transaction(txObject).then(txHash => {
  // Transaction has been sent to the network
}).catch(error => {
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
da.getState().then(state => {
  if (state.validBrowser) {
    console.log("valid browser")
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
