/*
 * Check that UI is rendered correctly in response to events
 */

import { handleEvent } from '../js/helpers/events'
import { createIframe } from '../js/helpers/iframe'
import { state, updateState } from '../js/helpers/state'
import assistStyles from '../css/styles.css'

// Make a copy of the initial state
const initialState = Object.assign({}, state)

const mockTransaction = {
  id: 'cf7fc5a7-1498-419e-8bf9-654d06af5534',
  gas: '54707',
  gasPrice: '1000000000',
  value: '1848587500000000',
  to: '0x9b913956036a3462330b0642b20d3879ce68b450',
  from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
}

// Specify events to test [<categoryCode>, <eventCode>, <nonceExpected>, <startTimeExpected>]
// Setting txShouldBeBroadcasted to true asserts that an error should be thrown if
// 'nonce', 'startTime', 'txSent' or 'inTxPool' is missing from the passed transaction object
const eventsToTest = [
  ['activeTransaction', 'txAwaitingApproval', false, false],
  ['activeTransaction', 'txRequest', false, false],
  ['activeTransaction', 'txConfirmReminder', false, false],
  ['activeTransaction', 'txSendFail', false, false],
  ['activeTransaction', 'txSent', false, true],
  ['activeTransaction', 'txStall', true, true],
  ['activeTransaction', 'txPending', true, true],
  ['activeTransaction', 'txConfirmed', true, true],
  ['activeTransaction', 'txConfirmedClient', true, true],
  ['activeTransaction', 'txFailed', true, true],
  ['activeContract', 'txAwaitingApproval', false, false],
  ['activeContract', 'txRequest', false, false],
  ['activeContract', 'txConfirmReminder', false, false],
  ['activeContract', 'txSendFail', false, false],
  ['activeContract', 'txSent', false, true],
  ['activeContract', 'txStall', true, true],
  ['activeContract', 'txPending', true, true],
  ['activeContract', 'txConfirmed', true, true],
  ['activeContract', 'txConfirmedClient', true, true],
  ['activeContract', 'txFailed', true, true]
]

describe('ui-rendering', () => {
  describe('notificationsUI', () => {
    eventsToTest.forEach(eventInfo => {
      const [
        categoryCode,
        eventCode,
        nonceExpected,
        startTimeExpected
      ] = eventInfo
      // Decide which transaction type to pass with the event
      const transaction = Object.assign({}, mockTransaction)
      if (nonceExpected) transaction.nonce = 1235
      if (startTimeExpected) transaction.startTime = 1262264000000
      describe(`event ${categoryCode}-${eventCode}`, () => {
        test('should trigger correct DOM render', () => {
          handleEvent({
            categoryCode,
            eventCode,
            transaction
          })
          expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
        })
      })
    })
  })
})

// Create an iframe and reset state between each test
beforeEach(() => {
  updateState({
    config: {},
    // Add mockTransaction to the queue so 'txConfirmed' and 'txConfirmedClient' events work correctly
    transactionQueue: [{ transaction: mockTransaction }]
  })
  createIframe(document, assistStyles)
})

afterEach(() => {
  updateState(Object.assign({}, initialState))
})
