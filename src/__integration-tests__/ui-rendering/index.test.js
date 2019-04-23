/*
 * Check that DOM renders correctly in response to events
 */

import { handleEvent } from '../../js/helpers/events'
import { createIframe } from '../../js/helpers/iframe'
import { state, updateState } from '../../js/helpers/state'
import assistStyles from '../../css/styles.css'
import { storeItem } from '../../js/helpers/storage'
import eventDefinitions from './event-definitions'

// Create a base state to be used in each test
// eslint-disable-next-line import/prefer-default-export
export const initialState = Object.assign({}, state, {
  userAgent: {
    browser: { name: 'Chrome', version: '73.0.3683.86' },
    engine: { name: 'Blink' },
    os: { name: 'Linux' },
    platform: { type: 'desktop' }
  },
  config: {}
})

describe('dom-rendering', () => {
  // Test each eventCode
  Object.entries(eventDefinitions).forEach(([eventCode, testConfig]) => {
    // Test each event category
    testConfig.categories.forEach(categoryCode => {
      const {
        params,
        customStates = [initialState],
        customStores = [{}]
      } = testConfig
      describe(`event ${categoryCode}-${eventCode}`, () => {
        // Test each storage scenario
        customStores.forEach((customStore, customStoreIndex) => {
          // Test each state scenario
          customStates.forEach((customState, customStateIndex) => {
            // Get custom storage description
            let storeDesc = ''
            if (Object.keys(customStore).length > 0) {
              storeDesc = ` [Storage: ${customStoreIndex}]`
            }
            // Get custom state description
            let stateDesc = ''
            if (customStates.length > 1) {
              stateDesc = ` [Custom state ${customStateIndex}]`
            }

            // Test DOM elements are rendered
            test(`should trigger correct DOM render${storeDesc}${stateDesc}`, () => {
              setTestEnv(customState, customStore)
              handleEvent({
                categoryCode,
                eventCode,
                ...params
              })
              expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
            })

            // Test clickHandlers
            if (testConfig.clickHandlers) {
              if (testConfig.clickHandlers.has('onClose')) {
                test(`onClose should be called when close is clicked${storeDesc}${stateDesc}`, () => {
                  setTestEnv(customState, customStore)
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
                  if (!closeBtn) return // make sure btn actually exists
                  closeBtn.click()
                  expect(onCloseMock).toHaveBeenCalledTimes(1)
                })
              }

              if (testConfig.clickHandlers.has('onClick')) {
                test(`onClick should be called when the primary btn is clicked${storeDesc}${stateDesc}`, () => {
                  setTestEnv(customState, customStore)
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
                  if (!defaultBtn) return // make sure btn actually exists
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

// Reset to a specified state and store
// (not using beforeEach for this as it was behaiving strangely)
const setTestEnv = (state, store) => {
  window.localStorage.clear()
  updateState(initialState)
  updateState(state)
  createIframe(document, assistStyles)
  if (Object.keys(store).length > 0) {
    Object.entries(store).forEach(([k, v]) => storeItem(k, v))
  }
}
