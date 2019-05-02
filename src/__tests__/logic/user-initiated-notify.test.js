import da from '~/js'
import userInitiatedNotify from '~/js/logic/user-initiated-notify'
import { updateState, initialState, state } from '~/js/helpers/state'

jest.useFakeTimers()
const ONE_MIN_IN_MS = 60000

describe('user-initiated-notify.js', () => {
  describe('userInitiatedNotify', () => {
    test(`doesn't throw if dismiss is called after the notification has already timed out`, () => {
      expect(() => {
        const notify = userInitiatedNotify('success', 'some-msg', 100)
        setTimeout(() => {
          notify()
        }, 1000)
        jest.advanceTimersByTime(500) // trigger timeout
        jest.runOnlyPendingTimers() // trigger notify
      }).not.toThrow()
    })
    test(`doesn't throw if notification times out after dismiss was already called`, () => {
      expect(() => {
        const notify = userInitiatedNotify('success', 'some-msg', 1000)
        setTimeout(() => {
          notify()
        }, 100)
        jest.advanceTimersByTime(500) // trigger notify
        jest.runOnlyPendingTimers() // trigger timeout
      }).not.toThrow()
    })
    const customEventCodes = ['success', 'pending', 'error']
    customEventCodes.forEach(event => {
      test(`setting customTimeout in a ${event} event overrides the default timeout`, () => {
        const message = 'some-msg'
        userInitiatedNotify(event, message, 500)
        jest.advanceTimersByTime(1000)
        expect(
          state.iframeDocument.body.innerHTML.includes(message)
        ).toBeFalsy()
      })
      test(`setting customTimeout to -1 in a ${event} event stops it automatically timing out`, () => {
        const message = 'some-msg'
        userInitiatedNotify(event, message, -1)
        jest.advanceTimersByTime(ONE_MIN_IN_MS * 10)
        expect(
          state.iframeDocument.body.innerHTML.includes(message)
        ).toBeTruthy()
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
