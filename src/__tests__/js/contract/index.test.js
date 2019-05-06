import fclone from 'fclone'
import abi from '~/__tests__/res/abi.json'
import da from '~/js'
import * as web3Helpers from '~/js/helpers/web3'
import { initialState, updateState } from '~/js/helpers/state'

const multidepRequire = require('multidep')('multidep.json')

const someAddress = '0x0000000000000000000000000000000000000000'

/* Prepares contract for snapshot
 * - Removes circular refs
 * - Repalces random websocket key with predefined value
 * - Replaces random nonce with predefined value
 */
const websocketRegex = /nSec-WebSocket-Key.*?==/g
const base64NonceRegex = /base64nonce.*?==/g
function sanitiseContract(contract) {
  const contractNoCircular = fclone(contract)
  return JSON.parse(
    JSON.stringify(contractNoCircular)
      .replace(websocketRegex, 'nSec-WebSocket-Key: somekey==')
      .replace(base64NonceRegex, 'base64nonce":"somenonce==')
  )
}

// multidep docs: https://github.com/joliss/node-multidep
multidepRequire.forEachVersion('web3', (version, Web3) => {
  describe(`using web3 ${version}`, () => {
    describe('Contract function is called', () => {
      let assistInstance
      let web3
      let contract
      const config = { dappId: '123' }
      beforeEach(() => {
        web3 = new Web3('ws://some-socket.123')
        contract = version.includes('0.20')
          ? new web3.eth.contract(abi, someAddress) // eslint-disable-line new-cap
          : new web3.eth.Contract(abi, someAddress)
        assistInstance = da.init(config)
      })
      /* Takes a snapshot of the decorated contract returned to the user.
       * This snapshot may fail if web3 changes the internals of Contract.
       * If it does fail, carefully check that any critical methods/functionality
       * was not attached to the decorated contract.
       */
      test('it returns the expected decorated contract', () => {
        const assistInstance = da.init({ dappId: '123', web3, networkId: '1' })
        const decoratedContract = assistInstance.Contract(contract)
        expect(sanitiseContract(decoratedContract)).toMatchSnapshot()
      })
      describe(`when user doesn't have a validApiKey`, () => {
        beforeEach(() => {
          updateState({ validApiKey: false })
        })
        test('should throw the expected error', () => {
          expect(() => {
            assistInstance.Contract(abi, someAddress)
          }).toThrowError('Your API key is not valid')
        })
      })
      describe(`when state.supportedNetwork is falsy`, () => {
        beforeEach(() => {
          updateState({ supportedNetwork: null })
        })
        test('should throw the expected error', () => {
          expect(() => {
            assistInstance.Contract(abi, someAddress)
          }).toThrowError('This network is not supported')
        })
      })
      describe('when user is on mobile and mobile is not blocked', () => {
        beforeEach(() => {
          updateState({ mobileDevice: true, config: { mobileBlocked: false } })
        })
        test('it should return the contract unmodified', () => {
          const decoratedContract = assistInstance.Contract(contract)
          expect(JSON.stringify(fclone(contract))).toEqual(
            JSON.stringify(fclone(decoratedContract))
          )
        })
      })
      describe('when state.web3Instance is falsy', () => {
        beforeEach(() => {
          updateState({ web3Instance: undefined })
        })
        describe('and window.web3 exists', () => {
          beforeEach(() => {
            window.web3 = web3
          })
          afterEach(() => {
            delete window.web3
          })
          test('configureWeb3 should be called', () => {
            const configureWeb3Mock = jest
              .spyOn(web3Helpers, 'configureWeb3')
              .mockImplementation(() => {})
            assistInstance.Contract(contract)
            expect(configureWeb3Mock).toHaveBeenCalledTimes(1)
            configureWeb3Mock.mockRestore()
          })
        })
        describe('and window.web3 is falsy', () => {
          test('it should throw the expected error', () => {
            expect(() => {
              assistInstance.Contract(contract)
            }).toThrowError('A web3 instance is needed to decorate contract')
          })
        })
      })
    })
  })
})

afterEach(() => {
  document.body.innerHTML = ''
  updateState(initialState)
  window.localStorage.clear()
  jest.clearAllMocks()
})
