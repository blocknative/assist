/*
 * Check that the DOM correctly renders in response to events
 * being fired
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
  }
})

// Generates the suffix to append to test names that are
// run over multiple stores and/or states
const generateDescriptionSuffix = (states, stateIndex, store, storeIndex) => {
  let storeDesc = ''
  // Get custom storage description
  if (Object.keys(store).length > 0) {
    storeDesc = ` [Custom storage ${storeIndex}]`
  }
  // Get custom state description
  let stateDesc = ''
  if (states.length > 1) {
    stateDesc = ` [Custom state ${stateIndex}]`
  }
  return `${stateDesc}${storeDesc}`
}

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
            const descSuffix = generateDescriptionSuffix(
              customStates,
              customStateIndex,
              customStore,
              customStoreIndex
            )

            // Test DOM elements are rendered as expected
            test(`should trigger correct DOM render${descSuffix}`, () => {
              resetEnv(customState, customStore)
              handleEvent({
                categoryCode,
                eventCode,
                ...params
              })
              expect(state.iframeDocument.body.innerHTML).toMatchSnapshot()
            })

            // Check that the iframe is visible and can be interacted with
            test(`should be visible and respond to pointer events${descSuffix}`, () => {
              expect(state.iframe.style.pointerEvents).toEqual('all')
              expect(state.iframe.style['z-index']).toEqual('999')
            })

            // Test clickHandlers
            if (testConfig.clickHandlers) {
              if (testConfig.clickHandlers.has('onClose')) {
                test(`UI should be closed as expected called when close is clicked${descSuffix}`, () => {
                  resetEnv(customState, customStore)
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
                  expect(state.iframe.style.pointerEvents).toEqual('none')
                  expect(state.iframe.style['z-index']).toEqual('initial')
                })
              }

              if (testConfig.clickHandlers.has('onClick')) {
                test(`onClick should be called when the primary btn is clicked${descSuffix}`, () => {
                  resetEnv(customState, customStore)
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

// Reset the environment to a specified state and localstorage,
// then create a new iframe
// (not using beforeEach for this as it was behaiving strangely)
const resetEnv = (state, store) => {
  window.localStorage.clear()
  updateState(initialState)
  updateState(state)
  createIframe(document, assistStyles)
  if (Object.keys(store).length > 0) {
    Object.entries(store).forEach(([k, v]) => storeItem(k, v))
  }
}
