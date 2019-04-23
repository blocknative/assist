/*
 * Check that DOM renders correctly in response to events
 */

import { handleEvent } from '../js/helpers/events'
import { createIframe } from '../js/helpers/iframe'
import { state, updateState } from '../js/helpers/state'
import assistStyles from '../css/styles.css'
import { storeItem } from '../js/helpers/storage'

// Create an initial state to be passed in fresh to each test
const initialState = Object.assign({}, state, {
  userAgent: {
    browser: { name: 'Chrome', version: '73.0.3683.86' },
    engine: { name: 'Blink' },
    os: { name: 'Linux' },
    platform: { type: 'desktop' }
  },
  config: {}
})

const emptyStorageSetup = [['_NULL', 'null']]

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
 *   categories: ['categoryCode1', 'categoryCode2', ...], // tests run for every category
 *   params: {}, // config information passed as first param for event
 *   clickHandlers: new Set(['onClose', ...]) // OPTIONAL: specify any clickHandlers
 *   customStorage: [[key, value]] // OPTIONAL: specify different storage scenarios to test
 * }
 */
const eventsToTest = {
  browserFail: {
    categories: ['onboard'],
    clickHandlers: new Set(['onClose'])
  },
  welcomeUser: {
    categories: ['onboard'],
    clickHandlers: new Set(['onClose', 'onClick']),
    customStorage: [['_assist_newUser', 'true']]
  },
  mobileBlocked: {
    categories: ['initialize'],
    clickHandlers: new Set(['onClose'])
  },
  nsfFail: {
    categories: ['activePreflight'],
    params: { transaction: mockTxFactory() }
  },
  txRepeat: {
    categories: ['activePreflight'],
    params: { transaction: mockTxFactory() }
  },
  txAwaitingApproval: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() }
  },
  txRequest: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() }
  },
  txConfirmReminder: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() }
  },
  txSendFail: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory() }
  },
  txSent: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ startTime: true }) }
  },
  txStall: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) }
  },
  txPending: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) }
  },
  txConfirmed: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customState: { transactionQueue: [{ transaction: mockTransaction }] }
  },
  txConfirmedClient: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) },
    customState: { transactionQueue: [{ transaction: mockTransaction }] }
  },
  txFailed: {
    categories: ['activeTransaction', 'activeContract'],
    params: { transaction: mockTxFactory({ nonce: true, startTime: true }) }
  }
}

describe('dom-rendering', () => {
  // Test each eventCode
  Object.entries(eventsToTest).forEach(([eventCode, testConfig]) => {
    // Test each events category
    testConfig.categories.forEach(categoryCode => {
      const {
        params,
        customState,
        customStorage = emptyStorageSetup
      } = testConfig
      describe(`event ${categoryCode}-${eventCode}`, () => {
        // Test each specified storage scenario
        customStorage.forEach(store => {
          const [itemName, value] = store
          const storeDesc =
            itemName !== '_NULL' ? ` [Storage: ${itemName}='${value}']` : ''
          customStorage.forEach(store => {
            beforeEach(() => {
              if (customState) updateState(customState)
              if (store) storeItem(itemName, value)
            })
            // Test DOM elements are rendered
            test(`should trigger correct DOM render${storeDesc}`, () => {
              handleEvent({
                categoryCode,
                eventCode,
                ...params
              })
              expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
            })

            test(`should trigger correct DOM render when passed inlineCustomMsgs${storeDesc}`, () => {
              const inlineCustomMsgs = {
                [eventCode]: () => `${eventCode} inlineCustomMsg msg`
              }
              handleEvent({
                categoryCode,
                eventCode,
                inlineCustomMsgs,
                ...params
              })
              expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
            })

            // Test clickHandlers
            if (testConfig.clickHandlers) {
              if (testConfig.clickHandlers.has('onClose')) {
                test('onClose should be called when close is clicked', () => {
                  const onCloseMock = jest.fn()
                  handleEvent(
                    {
                      categoryCode,
                      eventCode,
                      ...params
                    },
                    {
                      onClose: onCloseMock
                    }
                  )
                  const closeBtn = state.iframeDocument.getElementsByClassName(
                    'bn-onboard-close'
                  )[0]
                  closeBtn.click()
                  expect(onCloseMock).toHaveBeenCalledTimes(1)
                })
              }

              if (testConfig.clickHandlers.has('onClick')) {
                test('onClose should be called when the primary btn is clicked', () => {
                  const onClickMock = jest.fn()
                  handleEvent(
                    {
                      categoryCode,
                      eventCode,
                      ...params
                    },
                    {
                      onClick: onClickMock
                    }
                  )
                  const defaultBtn = state.iframeDocument.getElementsByClassName(
                    'bn-btn'
                  )[0]
                  defaultBtn.click()
                  expect(onClickMock).toHaveBeenCalledTimes(1)
                })
              }
            }
          })
        })
      })
    })
  })
})

// Between each test create a new iframe and reset to clean state
beforeEach(() => {
  updateState(initialState)
  window.localStorage.clear()
  createIframe(document, assistStyles)
})
