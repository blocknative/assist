import da from '~/js'
import userInitiatedNotify, {
  defaultTimeout
} from '~/js/logic/user-initiated-notify'
import { updateState, initialState, state } from '~/js/helpers/state'

jest.useFakeTimers()
const ONE_MIN_IN_MS = 60000

describe('user-initiated-notify.js', () => {
  describe('userInitiatedNotify', () => {
    const message = 'some-msg'
    const customEventCodes = ['success', 'pending', 'error']
    customEventCodes.forEach(event => {
      describe(`type ${event}`, () => {
        test('triggers notification and defaults to correct timeout', () => {
          userInitiatedNotify('success', message)
          // notification should exist after being triggered
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeTruthy()
          // advance time past the defaultTimeout
          jest.advanceTimersByTime(defaultTimeout(event) + 500)
          // notification should have timed out
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeFalsy()
        })
        test(`doesn't throw if dismiss is called after the notification has already timed out`, () => {
          expect(() => {
            const notify = userInitiatedNotify(event, message, {
              customTimeout: 100
            })
            setTimeout(() => {
              notify()
            }, 1000)
            jest.advanceTimersByTime(500) // trigger timeout
            jest.runOnlyPendingTimers() // trigger notify
          }).not.toThrow()
        })
        test(`doesn't throw if notification times out after dismiss was already called`, () => {
          expect(() => {
            const notify = userInitiatedNotify(event, message, {
              customTimeout: 1000
            })
            setTimeout(() => {
              notify()
            }, 100)
            jest.advanceTimersByTime(500) // trigger notify
            jest.runOnlyPendingTimers() // trigger timeout
          }).not.toThrow()
        })
        test(`setting customTimeout overrides the default timeout`, () => {
          userInitiatedNotify(event, message, { customTimeout: 500 })
          jest.advanceTimersByTime(1000)
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeFalsy()
        })
        test(`setting customTimeout to -1 stops it automatically timing out`, () => {
          userInitiatedNotify(event, message, { customTimeout: -1 })
          jest.advanceTimersByTime(ONE_MIN_IN_MS * 10)
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeTruthy()
        })
      })
    })
  })
})

beforeEach(() => {
  da.init({ dappId: '123' })
})

afterEach(() => {
  updateState(initialState)
})
