import da from '~/js'
import userInitiatedNotify from '~/js/logic/user-initiated-notify'
import { updateState, initialState } from '~/js/helpers/state'

jest.useFakeTimers()

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
  })
})

beforeEach(() => {
  da.init({ dappId: '123' })
})

afterEach(() => {
  updateState(initialState)
})
