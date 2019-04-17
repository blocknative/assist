/*
 * Check that UI is rendered correctly in response to events
 */

import { handleEvent } from '../js/helpers/events'
import { createIframe } from '../js/helpers/iframe'
import { state, updateState } from '../js/helpers/state'
import assistStyles from '../css/styles.css'

// Make a copy of the initial state
const initialState = Object.assign({}, state)

const mockBareTransaction = {
  id: 'cf7fc5a7-1498-419e-8bf9-654d06af5534',
  gas: '54707',
  gasPrice: '1000000000',
  value: '1848587500000000',
  to: '0x9b913956036a3462330b0642b20d3879ce68b450',
  from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
}

const mockBroadcastTransaction = Object.assign({}, mockBareTransaction, {
  nonce: 1235,
  startTime: 1262264000000,
  txSent: true,
  inTxPool: true
})

// Specify events to test here ([categoryCode, eventCode, txShouldBeBroadcasted])
// Setting txShouldBeBroadcasted to true asserts that an error should be thrown if
// 'nonce', 'startTime', 'txSent' or 'inTxPool' is missing from the passed transaction object
const eventsToTest = [
  ['activeTransaction', 'txRequest', false],
  ['activeTransaction', 'txPending', true],
  ['activeTransaction', 'txSent', true]
]

describe('ui-rendering', () => {
  describe('notificationsUI', () => {
    eventsToTest.forEach(eventInfo => {
      const [categoryCode, eventCode, txShouldBeBroadcasted] = eventInfo
      // Decide which transaction type to pass with the event
      const transaction = txShouldBeBroadcasted
        ? mockBroadcastTransaction
        : mockBareTransaction
      describe(`event ${categoryCode}-${eventCode}`, () => {
        test('should trigger correct DOM render', () => {
          handleEvent({
            categoryCode,
            eventCode,
            transaction
          })
          expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
        })
        if (txShouldBeBroadcasted) {
          test('should fail if transaction is missing attributes', () => {
            expect(() => {
              handleEvent({
                categoryCode,
                eventCode,
                transaction: mockBareTransaction
              })
            }).toThrow()
          })
        }
      })
    })
  })
})

// Create an iframe and reset state between each test
beforeEach(() => {
  updateState({ config: {} })
  createIframe(document, assistStyles)
})

afterEach(() => {
  updateState(Object.assign({}, initialState))
})
