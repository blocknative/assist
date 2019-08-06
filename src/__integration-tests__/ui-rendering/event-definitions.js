import { initialState } from './index.test'

const mockTransaction = {
  id: 'cf7fc5a7-1498-419e-8bf9-654d06af5534',
  gas: '54707',
  gasPrice: '1000000000',
  value: '1848587500000000',
  to: '0x9b913956036a3462330b0642b20d3879ce68b450',
  from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
}

/* Returns a mock transaction, optionally adding a nonce or startTime property.
 * - nonce should be specified when the UI notification displays the transaction ID
 * - startTime should be specified when the UI displays a clock with a timer (eg 5 sec)
 */
const mockTxFactory = ({ nonce, startTime } = {}) => {
  const MOCK_NONCE = 1235
  const MOCK_START_TIME = 1262264000000
  const additions = {}
  if (nonce) additions.nonce = MOCK_NONCE
  if (startTime) additions.startTime = MOCK_START_TIME
  return { ...mockTransaction, ...additions }
}

/* Specify events to test
 * [eventCode]: {
 *   categories: ['categoryCode1', 'categoryCode2', ...], // specify eventCategories
 *   params: {}, // OPTIONAL: items to add alongside eventCode/categoryCode in the first object passed to handleEvent
 *   clickHandlers: new Set(['onClose', 'onClick']) // OPTIONAL: specify any clickHandlers
 *   customStores: [store1, store2, ...] // OPTIONAL: specify storage scenarios to test
 *   customStates: [state1, state2, ...] // OPTIONAL: specify states to test
 * }
 */
export default {
  success: {
    categories: ['userInitiatedNotify'],
    customStates: [
      {
        config: { messages: { success: () => 'success custom msg' }, style: {} }
      }
    ]
  },
  pending: {
    categories: ['userInitiatedNotify'],
    params: { transaction: mockTxFactory({ startTime: true }) },
    customStates: [
      {
        config: { messages: { pending: () => 'pending custom msg' }, style: {} }
      }
    ]
  },
  error: {
    categories: ['userInitiatedNotify'],
    customStates: [
      { config: { messages: { error: () => 'error custom msg' }, style: {} } }
    ]
  },
  browserFail: {
    categories: ['onboard'],
    clickHandlers: new Set(['onClose'])
  },
  txSpeedUp: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      {
        transactionQueue: [{ transaction: mockTransaction }]
      },
      {
        transactionQueue: [{ transaction: mockTransaction }],
        config: {
          messages: { txSpeedUp: () => 'txSpeedUp custom msg' },
          style: {}
        }
      }
    ]
  },
  walletFail: {
    categories: ['onboard', 'activePreflight'],
    customStores: [{ _assist_newUser: 'true' }],
    clickHandlers: new Set(['onClose', 'onClick'])
  },
  walletLogin: {
    categories: ['onboard', 'activePreflight'],
    clickHandlers: new Set(['onClose', 'onClick'])
  },
  newOnboardComplete: {
    categories: ['onboard', 'activePreflight'],
    customStores: [{ _assist_newUser: 'true' }],
    clickHandlers: new Set(['onClose', 'onClick']),
    customStates: [
      initialState,
      {
        config: {
          images: {
            complete: { src: 'custom-img-src', srcset: 'custom-img-srcset' }
          },
          style: {}
        }
      }
    ]
  },
  walletLoginEnable: {
    categories: ['onboard', 'activePreflight'],
    clickHandlers: new Set(['onClose', 'onClick'])
  },
  walletEnable: {
    categories: ['onboard', 'activePreflight'],
    clickHandlers: new Set(['onClose', 'onClick'])
  },
  networkFail: {
    categories: ['onboard', 'activePreflight'],
    clickHandlers: new Set(['onClose', 'onClick']),
    customStates: [
      initialState,
      { userCurrentNetworkId: 42, config: { networkId: 4, style: {} } }
    ]
  },
  welcomeUser: {
    categories: ['onboard', 'activePreflight'],
    clickHandlers: new Set(['onClose', 'onClick']),
    customStores: [{ _assist_newUser: 'true' }],
    customStates: [
      initialState,
      {
        config: {
          images: {
            welcome: { src: 'custom-img-src', srcset: 'custom-img-srcset' }
          },
          style: {}
        }
      }
    ]
  },
  mobileBlocked: {
    categories: ['initialize', 'activePreflight'],
    clickHandlers: new Set(['onClose'])
  },
  nsfFail: {
    categories: ['activePreflight', 'onboard'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          minimumBalance: '12300000000000000000',
          messages: { nsfFail: () => 'nsfFail custom msg' },
          style: {}
        }
      }
    ]
  },
  txRepeat: {
    categories: ['activePreflight'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          messages: { txRepeat: () => 'txRepeat custom msg' },
          style: {}
        }
      }
    ]
  },
  txAwaitingApproval: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          messages: {
            txAwaitingApproval: () => 'txAwaitingApproval custom msg'
          },
          style: {}
        }
      }
    ]
  },
  txRequest: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          messages: { txRequest: () => 'txRequest custom msg' },
          style: {}
        }
      }
    ]
  },
  txConfirmReminder: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          messages: { txConfirmReminder: () => 'txConfirmReminder custom msg' },
          style: {}
        }
      }
    ]
  },
  txSendFail: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() },
    customStates: [
      initialState,
      {
        config: {
          messages: { txSendFail: () => 'txSendFail custom msg' },
          style: {}
        }
      }
    ]
  },
  txSent: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ startTime: true }) },
    customStates: [
      initialState,
      { config: { messages: { txSent: () => 'txSent custom msg' }, style: {} } }
    ]
  },
  txStallPending: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      initialState,
      {
        config: {
          messages: { txStallPending: () => 'txStall custom msg' },
          style: {}
        }
      }
    ]
  },
  txStallConfirmed: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      initialState,
      {
        config: {
          messages: { txStallConfirmed: () => 'txStall custom msg' },
          style: {}
        }
      }
    ]
  },
  txPending: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      initialState,
      {
        config: {
          messages: { txPending: () => 'txPending custom msg' },
          style: {}
        }
      }
    ]
  },
  txConfirmed: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      {
        transactionQueue: [{ transaction: mockTransaction }]
      },
      {
        transactionQueue: [{ transaction: mockTransaction }],
        config: {
          messages: { txConfirmed: () => 'txConfirmed custom msg' },
          style: {}
        }
      }
    ]
  },
  txConfirmedClient: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      {
        transactionQueue: [{ transaction: mockTransaction }]
      },
      {
        transactionQueue: [{ transaction: mockTransaction }],
        config: {
          messages: { txConfirmed: () => 'txConfirmedClient custom msg' },
          style: {}
        }
      }
    ]
  },
  txFailed: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customStates: [
      initialState,
      {
        config: {
          messages: { txFailed: () => 'txFailed custom msg' },
          style: {}
        }
      }
    ]
  }
}
