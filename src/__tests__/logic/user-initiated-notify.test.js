import da from '~/js'
import userInitiatedNotify, {
  defaultTimeout
} from '~/js/logic/user-initiated-notify'
import { updateState, initialState, state } from '~/js/helpers/state'
import * as events from '~/js/helpers/events'

jest.useFakeTimers()
const ONE_MIN_IN_MS = 60000

describe('user-initiated-notify.js', () => {
  describe('userInitiatedNotify', () => {
    const message = 'some-msg'
    const customEventCodes = ['success', 'pending', 'error']
    test('throws if eventCode is invalid', () => {
      expect(() => userInitiatedNotify('invalid code', message)).toThrow()
    })
    customEventCodes.forEach(eventCode => {
      describe(`type ${eventCode}`, () => {
        test('throws if customTimeout is not a number', () => {
          expect(() =>
            userInitiatedNotify(eventCode, message, { customTimeout: '123' })
          ).toThrow()
        })
        test('throws if customCode is not a string', () => {
          expect(() =>
            userInitiatedNotify(eventCode, message, { customCode: 123 })
          ).toThrow()
        })
        test('throws if customCode is greater than 24 characters', () => {
          const customCode = '0123456789012345678901234'
          expect(() =>
            userInitiatedNotify(eventCode, message, { customCode })
          ).toThrow()
        })
        test('when no customCode is specified the correct default is passed to logEvent', () => {
          const logEventSpy = jest
            .spyOn(events.lib, 'logEvent')
            .mockImplementation(() => {})
          userInitiatedNotify(eventCode, message)
          const lastCallIndex = logEventSpy.mock.calls.length - 1
          expect(logEventSpy.mock.calls[lastCallIndex][0]).toMatchObject({
            customCode: `custom ${eventCode}`
          })
          logEventSpy.mockRestore()
        })
        test('when a customCode is specified it is included in the object passed to logEvent', () => {
          const customCode = '123'
          const logEventSpy = jest
            .spyOn(events.lib, 'logEvent')
            .mockImplementation(() => {})
          userInitiatedNotify(eventCode, message, { customCode })
          const lastCallIndex = logEventSpy.mock.calls.length - 1
          expect(logEventSpy.mock.calls[lastCallIndex][0]).toMatchObject({
            customCode
          })
          logEventSpy.mockRestore()
        })
        test('triggers notification and defaults to correct timeout', () => {
          userInitiatedNotify('success', message)
          // notification should exist after being triggered
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeTruthy()
          // advance time past the defaultTimeout
          jest.advanceTimersByTime(defaultTimeout(eventCode) + 500)
          // notification should have timed out
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeFalsy()
        })
        test(`doesn't throw if dismiss is called after the notification has already timed out`, () => {
          expect(() => {
            const notify = userInitiatedNotify(eventCode, message, {
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
            const notify = userInitiatedNotify(eventCode, message, {
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
          userInitiatedNotify(eventCode, message, { customTimeout: 500 })
          jest.advanceTimersByTime(1000)
          expect(
            state.iframeDocument.body.innerHTML.includes(message)
          ).toBeFalsy()
        })
        test(`setting customTimeout to -1 stops it automatically timing out`, () => {
          userInitiatedNotify(eventCode, message, { customTimeout: -1 })
          jest.advanceTimersByTime(ONE_MIN_IN_MS)
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
