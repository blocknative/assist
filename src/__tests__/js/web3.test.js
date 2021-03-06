import truffleContract from 'truffle-contract'
import abi from '~/__tests__/res/dstoken.json'
import { initialState, updateState } from '~/js/helpers/state'
import * as websockets from '~/js/helpers/websockets'
import { web3Functions } from '~/js/helpers/web3'
import convertLibJson from '~/__tests__/res/ConvertLib'
import {
  accounts,
  convertLibAddress,
  port
} from '../../../internals/ganacheConfig'

const multidepRequire = require('multidep')('multidep.json')

const Web3v0p20 = multidepRequire('web3', '0.20.6')

const zeroAddress = '0x0000000000000000000000000000000000000000'

const initWeb3 = (simpleVersion, Web3) => {
  if (simpleVersion === '1.') {
    return new Web3(`http://localhost:${port}`)
  }
  const provider = new Web3.providers.HttpProvider(`http://localhost:${port}`)
  return new Web3(provider)
}

describe(`web3.js tests`, () => {
  multidepRequire.forEachVersion('web3', (version, Web3) => {
    describe(`using web3 ${version}`, () => {
      describe('assist is initialised correctly', () => {
        let web3
        let simpleVersion
        beforeEach(() => {
          jest
            .spyOn(websockets, 'openWebsocketConnection')
            .mockImplementation(() => Promise.resolve(true))
          jest
            .spyOn(websockets, 'checkForSocketConnection')
            .mockImplementation(() => Promise.resolve(true))
          simpleVersion = version.slice(0, 2)
          web3 = initWeb3(simpleVersion, Web3)

          updateState({
            web3Instance: web3,
            legacyWeb3: simpleVersion === '0.'
          })
        })

        describe('web3Functions', () => {
          describe('networkId', () => {
            test('should return the expected networkId', async () => {
              const networkId = await web3Functions.networkId(simpleVersion)()
              if (simpleVersion === '1.') expect(networkId).toEqual(5)
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
              const expected = '20000000000' // recommended gasPrice should be 20000000000
              const gasPrice = await web3Functions.gasPrice(simpleVersion)()
              expect(gasPrice.toString()).toEqual(expected)
            })
          })
          describe('contractGas', () => {
            let contract
            describe('from a web3 contract', () => {
              beforeEach(() => {
                contract = web3.eth.contract
                  ? web3.eth.contract(abi).at(zeroAddress) // web3 0.20
                  : new web3.eth.Contract(abi, zeroAddress) // web3 1.0
              })
              test('should return the expected gas cost', async () => {
                const expected = 21400 // gas the setOwner call should cost
                const contractObj = web3.eth.contract
                  ? web3.eth.contract(abi).at(zeroAddress) // web3 0.20
                  : new web3.eth.Contract(abi, zeroAddress) // web3 1.0
                const parameters = [zeroAddress]
                const contractGas = await web3Functions.contractGas(
                  simpleVersion
                )({ contractObj, methodName: 'setOwner', args: parameters })
                expect(contractGas).toEqual(expected)
              })
            })
            describe('from a truffle contract', () => {
              let contractInstance
              beforeEach(async () => {
                contract = truffleContract(convertLibJson)
                contract.setProvider(
                  new Web3v0p20.providers.HttpProvider(
                    `http://localhost:${port}`
                  )
                )
                contractInstance = await contract.at(convertLibAddress)
              })
              // doesn't seem to work
              // see https://github.com/blocknative/assist/issues/171
              test('should return the expected gas cost', async () => {
                const expected = 21988 // gas the convert call should cost
                const contractObj = contractInstance
                const parameters = [5, 10]
                const contractGas = await web3Functions.contractGas(
                  simpleVersion,
                  true
                )({ contractObj, methodName: 'convert', args: parameters })
                expect(contractGas).toEqual(expected)
              })
            })
          })
          describe('transactionGas', () => {
            test('should return the expected gas cost', async () => {
              const expected = 21464 // gas this tx should cost
              const estimate = await web3Functions.transactionGas(
                simpleVersion
              )({
                to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                data:
                  '0xc6888fa10000000000000000000000000000000000000000000000000000000000000003'
              })
              expect(estimate).toEqual(expected)
            })
          })
          describe('balance', () => {
            test(`should return an address's balance`, async () => {
              const expected = '100000000000000000000' // 100 ETH
              const balance = await web3Functions.balance(simpleVersion)(
                accounts[1]
              )
              expect(balance.toString()).toEqual(expected)
            })
          })
          describe('accounts', () => {
            test(`should return the correct list of accounts`, async () => {
              const expected =
                simpleVersion === '1.'
                  ? accounts
                  : accounts.map(a => a.toLowerCase())
              const res = await web3Functions.accounts(simpleVersion)()
              expect(res).toEqual(expected)
            })
          })
          describe('txReceipt', () => {
            test(`should return the correct receipt`, async () => {
              const hash = await new Promise(resolve => {
                if (simpleVersion === '1.') {
                  web3.eth
                    .sendTransaction({
                      from: accounts[0],
                      to: zeroAddress,
                      value: 10
                    })
                    .on('transactionHash', hash => {
                      resolve(hash)
                    })
                } else {
                  web3.eth.sendTransaction(
                    {
                      from: accounts[0],
                      to: zeroAddress,
                      value: 10
                    },
                    (err, hash) => resolve(hash)
                  )
                }
              })
              const receipt = await web3Functions.txReceipt(hash)
              expect(receipt.to).toEqual(zeroAddress)
              expect(receipt).toHaveProperty('blockNumber')
              expect(receipt).toHaveProperty('transactionHash')
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
