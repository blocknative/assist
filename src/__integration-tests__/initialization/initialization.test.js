/*
 * Runs through variations of how the library can be initialized.
 * For each variation assert that expected side effects occur.
 */

import bowser from 'bowser'
import Web3 from 'web3'
import da from '~/js'
import * as events from '~/js/helpers/events'
import * as websockets from '~/js/helpers/websockets'
import { state, initialState, updateState } from '~/js/helpers/state'
import { storeTransactionQueue } from '~/js/helpers/storage'
import { port } from '../../../internals/ganacheConfig'
import { version as packageVersion } from '../../../package.json'

describe('init is called', () => {
  describe('with a basic valid config', () => {
    const config = { dappId: '123', networkId: 1 }
    test('state.version should be set correctly', () => {
      da.init(config)
      expect(state.version).toEqual(packageVersion)
    })
    test('state.userAgent should be set', () => {
      da.init(config)
      expect(state.userAgent).toHaveProperty('browser')
    })
    test('an empty iframe should be created and accessible via state', async () => {
      da.init(config)
      // iframe exists
      expect(document.body.innerHTML.includes('iframe')).toEqual(true)
      expect(state).toHaveProperty('iframe')
      expect(state).toHaveProperty('iframeDocument')
      expect(state).toHaveProperty('iframeWindow')

      // after all promises are resolved the iframe doesn't contain any elements
      await new Promise(res => setImmediate(() => res()))
      expect(state.iframeDocument.body.innerHTML.includes('<')).toBeFalsy()
    })
    // skip due to having issues mocking window.addEventListener
    xtest(`eventListener is added for 'unload'`, () => {
      da.init(config)
      const spy = jest.spyOn(window, 'addEventListener')
      expect(spy).toHaveBeenCalledWith('unload', storeTransactionQueue)
      spy.mockRestore()
    })
    test('event initState should be emitted with expected payload', async () => {
      const handleEventSpy = jest.spyOn(events, 'handleEvent')
      const assistInstance = da.init(config)
      const initState = await assistInstance.getState()
      expect(events.handleEvent).toHaveBeenCalledWith({
        eventCode: 'initState',
        categoryCode: 'initialize',
        state: {
          accessToAccounts: initState.accessToAccounts,
          correctNetwork: initState.correctNetwork,
          legacyWallet: initState.legacyWallet,
          legacyWeb3: initState.legacyWeb3,
          minimumBalance: initState.minimumBalance,
          mobileDevice: initState.mobileDevice,
          modernWallet: initState.modernWallet,
          modernWeb3: initState.modernWeb3,
          walletEnabled: initState.walletEnabled,
          walletLoggedIn: initState.walletLoggedIn,
          web3Wallet: initState.web3Wallet,
          validBrowser: initState.validBrowser
        }
      })
      handleEventSpy.mockRestore()
    })
    test('should return object with expected properties', () => {
      const initalizedAssist = da.init(config)
      expect(initalizedAssist).toHaveProperty('onboard')
      expect(initalizedAssist).toHaveProperty('Contract')
      expect(initalizedAssist).toHaveProperty('Transaction')
      expect(initalizedAssist).toHaveProperty('getState')
    })

    describe('when onboarding is in progress from a previous session', () => {
      beforeEach(() => {
        window.localStorage.setItem('onboarding', 'true')
      })
      test('onboard modal should appear', async () => {
        da.init(config)
        // wait for promises to resolve
        await new Promise(res => setImmediate(() => res()))

        // iframe should exist in DOM
        expect(document.body.innerHTML.includes('iframe')).toBeTruthy()
        // iframe should display a modal
        expect(
          state.iframeDocument.body.innerHTML.includes('bn-onboard-modal')
        ).toBeTruthy()
      })
    })

    describe('when transactionQueue is set in localStorage', () => {
      const tx = { transaction: { startTime: Date.now() } }
      beforeEach(() => {
        window.localStorage.setItem('transactionQueue', JSON.stringify([tx]))
      })
      test('state.transactionQueue should be initialized', () => {
        da.init(config)
        expect(state.transactionQueue).toEqual([tx])
      })
      test('transactions older than 150000ms should be ignored', () => {
        const oldTx = { transaction: { startTime: Date.now() - 150001 } }
        window.localStorage.setItem(
          'transactionQueue',
          JSON.stringify([tx, oldTx])
        )
        da.init(config)
        expect(state.transactionQueue).toEqual([tx])
      })
    })

    describe('from a mobile device', () => {
      let getParserSpy
      beforeAll(() => {
        // Set platform to mobile
        const userAgent = { platform: { type: 'mobile' } }
        getParserSpy = jest
          .spyOn(bowser, 'getParser')
          .mockImplementation(() => ({
            parse: () => ({ parsedResult: userAgent }),
            satisfies: () => false
          }))
      })
      afterAll(() => {
        getParserSpy.mockRestore()
      })
      test('state.mobileDevice should be set to true', () => {
        da.init(config)
        expect(state.mobileDevice).toEqual(true)
      })

      describe('mobileBlocked is true in config', () => {
        const configMobBlocked = { ...config, mobileBlocked: true }
        test('state.validBrowser should be false', () => {
          da.init(configMobBlocked)
          expect(state.validBrowser).toEqual(false)
        })
        test('event mobileBlocked should be emitted', () => {
          const handleEventSpy = jest.spyOn(events, 'handleEvent')
          da.init(configMobBlocked)
          expect(handleEventSpy).toHaveBeenCalledWith({
            eventCode: 'mobileBlocked',
            categoryCode: 'initialize'
          })
          handleEventSpy.mockRestore()
        })
      })
    })
  })

  describe('without a config argument', () => {
    it('should throw', () => {
      expect(() => {
        da.init()
      }).toThrow()
    })
    it('event initFail should be emitted correctly', () => {
      const handleEventSpy = jest.spyOn(events, 'handleEvent')
      expect(() => {
        da.init()
      }).toThrow()
      expect(handleEventSpy).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason:
          'Expected `config` to be of type `object` but received type `undefined`'
      })
      handleEventSpy.mockRestore()
    })
  })

  describe(`with a config missing 'dappId'`, () => {
    const config = { networkId: 1 }
    test(`should throw`, () => {
      expect(() => {
        da.init(config)
      }).toThrow()
    })
    test(`event initFail should be emitted correctly`, () => {
      const handleEventSpy = jest.spyOn(events, 'handleEvent')
      expect(() => {
        da.init(config)
      }).toThrow()
      expect(events.handleEvent).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason:
          'Expected property `dappId` to be of type `string` but received type `undefined` in object `config`'
      })
      handleEventSpy.mockRestore()
    })
  })

  describe(`with a config with an unexpected property`, () => {
    const config = { networkId: 1, dappId: '123', hheadlessMode: true }
    test(`should throw`, () => {
      expect(() => {
        da.init(config)
      }).toThrow()
    })
    test(`event initFail should be emitted correctly`, () => {
      const handleEventSpy = jest.spyOn(events, 'handleEvent')
      expect(() => {
        da.init(config)
      }).toThrow()
      expect(events.handleEvent).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason:
          'Did not expect property `hheadlessMode` to exist, got `true` in object `config`'
      })
      handleEventSpy.mockRestore()
    })
  })

  describe(`with a config with an invalid notificationsPosition`, () => {
    const config = {
      networkId: 1,
      dappId: '123',
      style: {
        notificationsPosition: {
          mobile: 'top',
          desktop: 'rightBottom'
        }
      }
    }
    test(`should throw`, () => {
      expect(() => {
        da.init(config)
      }).toThrow()
    })
    test(`event initFail should be emitted correctly`, () => {
      const handleEventSpy = jest.spyOn(events, 'handleEvent')
      expect(() => {
        da.init(config)
      }).toThrow()
      expect(events.handleEvent).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason:
          'Any predicate failed with the following errors:\n- Expected property property `notificationsPosition` to be of type `string` but received type `Object`\n- Expected property string `desktop` `rightBottom` to pass custom validation function in object `notificationsPosition` in object `style` in object `config`'
      })
      handleEventSpy.mockRestore()
    })
  })

  describe(`with a config with all possible fields specified`, () => {
    const config = {
      networkId: 1,
      dappId: '123',
      web3: new Web3(`ws://localhost:${port}`),
      mobileBlocked: true,
      headlessMode: true,
      messages: {
        txRequest: () => {},
        txSent: () => {},
        txPending: () => {},
        txSendFail: () => {},
        txStall: () => {},
        txFailed: () => {},
        nsfFail: () => {},
        txRepeat: () => {},
        txAwaitingApproval: () => {},
        txConfirmReminder: () => {},
        txConfirmed: () => {},
        txSpeedUp: () => {}
      },
      images: {
        welcome: {
          src: '123',
          srcset: '321'
        },
        complete: {
          src: '123',
          srcset: '321'
        }
      },
      style: {
        darkMode: true,
        notificationsPosition: { mobile: 'top', desktop: 'bottomLeft' },
        css: '123'
      }
    }
    test(`should not throw`, () => {
      expect(() => {
        da.init(config)
      }).not.toThrow()
    })
  })

  describe('with headlessMode: true', () => {
    const config = { dappId: '123', networkId: 1, headlessMode: true }
    test('no iframe should be created', () => {
      da.init(config)
      expect(document.body.innerHTML.includes('iframe')).toEqual(false)
    })
  })

  describe('with a legacy web3 object', () => {
    const mockLegacyWeb3 = { version: { api: '0.20' } }
    const config = { dappId: '123', networkId: 1, web3: mockLegacyWeb3 }
    test('web3 state should be set correctly', () => {
      da.init(config)
      expect(state.legacyWeb3).toEqual(true)
      expect(state.modernWeb3).toEqual(false)
      expect(state.web3Version).toEqual('0.20')
      expect(state.web3Instance).toEqual(mockLegacyWeb3)
    })
  })

  describe('with a modern web3 object', () => {
    const mockModernWeb3 = { version: '1.20' }
    const config = { dappId: '123', networkId: 1, web3: mockModernWeb3 }
    test('web3 state should be set correctly', () => {
      da.init(config)
      expect(state.legacyWeb3).toEqual(false)
      expect(state.modernWeb3).toEqual(true)
      expect(state.web3Version).toEqual('1.20')
      expect(state.web3Instance).toEqual(mockModernWeb3)
    })
  })
})

beforeAll(() => {
  jest.spyOn(websockets, 'openWebsocketConnection').mockImplementation(() => {})
})

afterEach(() => {
  document.body.innerHTML = ''
  updateState(initialState)
  window.localStorage.clear()
  jest.clearAllMocks()
})
