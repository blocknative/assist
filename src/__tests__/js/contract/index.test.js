import { Server } from 'mock-socket'
import abi from '~/__tests__/res/abi.json'
import da from '~/js'
import * as web3Helpers from '~/js/helpers/web3'
import { initialState, updateState } from '~/js/helpers/state'

const multidepRequire = require('multidep')('multidep.json')

const someAddress = '0x0000000000000000000000000000000000000000'

// multidep docs: https://github.com/joliss/node-multidep
multidepRequire.forEachVersion('web3', (version, Web3) => {
  describe(`using web3 ${version}`, () => {
    describe('Contract function is called', () => {
      let assistInstance
      let web3
      let contract
      let mockServer
      const config = { dappId: '123' }
      const fakeURL = 'ws://localhost:8080'
      beforeEach(() => {
        mockServer = new Server(fakeURL)
        web3 = new Web3(fakeURL)
        contract = web3.eth.contract
          ? web3.eth.contract(abi, someAddress).at(someAddress)
          : new web3.eth.Contract(abi, someAddress)
        assistInstance = da.init(config)
      })
      afterEach(() => {
        mockServer.close()
      })
      test(`it doesn't fail and returns the expected decorated contract`, () => {
        const assistInstance = da.init({ dappId: '123', web3, networkId: '1' })
        const decoratedContract = assistInstance.Contract(contract)

        if (decoratedContract.methods) {
          expect({
            givenProvider: decoratedContract.givenProvider,
            BatchRequest: decoratedContract.BatchRequest,
            options: decoratedContract.options,
            methods: decoratedContract.methods,
            abiModel: decoratedContract.abiModel,
            _jsonInterface: decoratedContract._jsonInterface,
            events: {
              ...decoratedContract.events,
              contract: null
            }
          }).toMatchSnapshot()
        } else {
          expect({
            ...decoratedContract,
            _eth: null
          }).toMatchSnapshot()
        }
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
          expect(decoratedContract).toEqual(contract)
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
            const configureWeb3Mock = jest.spyOn(web3Helpers, 'configureWeb3')
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
