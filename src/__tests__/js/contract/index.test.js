import truffleContract from 'truffle-contract'
import { Server } from 'mock-socket'
import abi from '~/__tests__/res/dstoken.json'
import da from '~/js'
import * as web3Helpers from '~/js/helpers/web3'
import { initialState, updateState } from '~/js/helpers/state'
import convertLibJson from '~/__tests__/res/ConvertLib.json'
import { convertLibAddress, port } from '../../../../internals/ganacheConfig'

const multidepRequire = require('multidep')('multidep.json')

// truffle contracts require an old web3
const Web3v0p20 = multidepRequire('web3', '0.20.6')

const someAddress = '0x0000000000000000000000000000000000000000'

const getTruffleContract = async () => {
  const contractDef = truffleContract(convertLibJson)
  contractDef.setProvider(
    new Web3v0p20.providers.HttpProvider(`http://localhost:${port}`)
  )
  return contractDef.at(convertLibAddress)
}

const getWeb3Contract = async web3 =>
  web3.eth.contract
    ? web3.eth.contract(abi).at(someAddress) // 0.20
    : new web3.eth.Contract(abi, someAddress) // 1.0.0-beta

// multidep docs: https://github.com/joliss/node-multidep
multidepRequire.forEachVersion('web3', (version, Web3) => {
  describe(`using web3 ${version}`, () => {
    describe('Contract is called', () => {
      let assistInstance
      let web3
      let contract
      let mockServer
      let config
      beforeEach(() => {
        mockServer = new Server('ws://localhost:8080')
        const provider = version.includes('0.20')
          ? new Web3.providers.HttpProvider(`http://localhost:${port}`)
          : `ws://localhost${port}`
        web3 = new Web3(provider)
        config = { dappId: '123', web3, networkId: 1 }
        assistInstance = da.init(config)
      })
      afterEach(() => {
        mockServer.close()
      })
      const contracts = [
        ['truffle', getTruffleContract],
        ['web3', getWeb3Contract]
      ]
      contracts.forEach(([name, getContract]) => {
        describe(`with a ${name} contract`, () => {
          beforeEach(async () => {
            contract = await getContract(web3)
          })
          test(`it doesn't fail and returns the expected decorated contract`, () => {
            const decoratedContract = assistInstance.Contract(contract)

            // check that methods on truffle contracts retain their properties
            if (name === 'truffle') {
              const methodName = 'subtract'
              const originalKeys = Object.keys(contract[methodName])
              const decoratedKeys = Object.keys(decoratedContract[methodName])
              expect(new Set(decoratedKeys)).toEqual(new Set(originalKeys))
            }

            // check that methods on web3 v0.20 contracts retain their properties
            if (version.includes('0.20') && name !== 'truffle') {
              const methodName = 'setOwner'
              const originalKeys = Object.keys(contract[methodName])
              const decoratedKeys = Object.keys(decoratedContract[methodName])
              expect(new Set(decoratedKeys)).toEqual(new Set(originalKeys))

              const overLoadedMethodName = 'approve'
              const overLoadedMethodArgs = ['address', 'address,uint256']
              overLoadedMethodArgs.forEach(args => {
                const originalKeys = Object.keys(
                  contract[overLoadedMethodName][args]
                )
                const decoratedKeys = Object.keys(
                  decoratedContract[overLoadedMethodName][args]
                )
                expect(new Set(decoratedKeys)).toEqual(new Set(originalKeys))
              })
            }

            // check that methods on web3 v1 contracts retain their properties
            if (version.includes('1.0') && name !== 'truffle') {
              const methodsToTest = [
                'setOwner',
                'start()',
                'mint(uint256)',
                'mint(address,uint256)'
              ]
              methodsToTest.forEach(methodName => {
                const originalKeys = Object.keys(contract.methods[methodName])
                const decoratedKeys = Object.keys(
                  decoratedContract.methods[methodName]
                )
                expect(new Set(originalKeys)).toEqual(new Set(decoratedKeys))
              })
            }

            if (decoratedContract.methods) {
              // test web3js v1.0.0-beta.X
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
              // test web3js v0.20.X
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
                const configureWeb3Mock = jest.spyOn(
                  web3Helpers,
                  'configureWeb3'
                )
                assistInstance.Contract(contract)
                expect(configureWeb3Mock).toHaveBeenCalledTimes(1)
                configureWeb3Mock.mockRestore()
              })
            })
            describe('and window.web3 is falsy', () => {
              test('it should throw the expected error', () => {
                expect(() => {
                  assistInstance.Contract(contract)
                }).toThrowError(
                  'A web3 instance is needed to decorate contract'
                )
              })
            })
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
