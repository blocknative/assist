import da from '~/js'
import { initialState, updateState } from '~/js/helpers/state'
import * as websockets from '~/js/helpers/websockets'
import { web3Functions } from '~/js/helpers/web3'

const multidepRequire = require('multidep')('multidep.json')

const initWeb3 = (simpleVersion, Web3) => {
  if (simpleVersion === '1.0') {
    return new Web3('ws://localhost:8546')
  }
  const provider = new Web3.providers.HttpProvider('http://localhost:8546')
  return new Web3(provider)
}

describe(`web3.js tests`, () => {
  multidepRequire.forEachVersion('web3', (version, Web3) => {
    describe(`using web3 ${version}`, () => {
      describe('assist is initialised correctly', () => {
        let web3
        let config
        let simpleVersion
        beforeEach(() => {
          jest
            .spyOn(websockets, 'openWebsocketConnection')
            .mockImplementation(() => {})
          simpleVersion = version.slice(0, 3)
          web3 = initWeb3(simpleVersion, Web3)
          config = { dappId: '123', web3, networkId: '5' }
          da.init(config)
        })
        afterEach(() => {
          // need to close any websocket connection
          if (simpleVersion === '1.0') {
            web3.currentProvider.connection.close()
          }
        })
        describe('web3Functions', () => {
          describe('networkId', () => {
            test('should return the expected networkId', async () => {
              const networkId = await web3Functions.networkId(simpleVersion)()
              if (simpleVersion === '1.0') expect(networkId).toEqual(5)
              else expect(networkId).toEqual('5') // 0.20 returns networkId as a string
            })
          })
          describe('bigNumber', () => {
            test('should return the expected bigNumber', async () => {
              const bigNum1 = await web3Functions.bigNumber(simpleVersion)(5)
              const bigNum2 = await web3Functions.bigNumber(simpleVersion)('10')
              expect(typeof bigNum1).toEqual('object')
              expect(bigNum1.toString()).toEqual('5')
              expect(bigNum1.toNumber()).toEqual(5)
              expect(bigNum1.add(bigNum2).toString()).toEqual('15')
            })
          })
          describe('gasPrice', () => {
            test('should return the expected gasPrice', async () => {
              const gasPrice = await web3Functions.gasPrice(simpleVersion)()
              expect(gasPrice.toString()).toEqual('20000000000')
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
