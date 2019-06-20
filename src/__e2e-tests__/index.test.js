import { Server } from 'mock-socket'
import truffleContract from 'truffle-contract'
import convertLibJson, { abi } from '~/__tests__/res/ConvertLib.json'
import da from '~/js'
import * as websockets from '~/js/helpers/websockets'
import { initialState, updateState } from '~/js/helpers/state'

import {
  convertLibAddress,
  port,
  accounts
} from '../../internals/ganacheConfig'

const multidepRequire = require('multidep')('multidep.json')

// truffle contracts require an old web3
const Web3v0p20 = multidepRequire('web3', '0.20.6')

const getTruffleContract = async () => {
  const contractDef = truffleContract(convertLibJson)
  contractDef.setProvider(
    new Web3v0p20.providers.HttpProvider(`http://localhost:${port}`)
  )
  return contractDef.at(convertLibAddress)
}

const getWeb3Contract = async web3 =>
  web3.eth.contract
    ? web3.eth.contract(abi).at(convertLibAddress) // 0.20
    : new web3.eth.Contract(abi, convertLibAddress) // 1.0.0-beta

// multidep docs: https://github.com/joliss/node-multidep
multidepRequire.forEachVersion('web3', (version, Web3) => {
  describe(`user initializes assist using web3 ${version}`, () => {
    let assistInstance
    let web3
    let mockServer
    beforeAll(async () => {
      // mock up a websocket connection
      jest
        .spyOn(websockets, 'openWebsocketConnection')
        .mockImplementation(() => {})
      const fakeUrl = 'ws://localhost:8080'
      mockServer = new Server(fakeUrl)
      updateState({
        socket: new WebSocket(fakeUrl),
        socketConnection: true,
        pendingSocketConnection: false
      })
      const provider = version.includes('0.20')
        ? new Web3.providers.HttpProvider(`http://localhost:${port}`) // 0.20
        : `ws://localhost:${port}` // 1.0
      web3 = new Web3(provider)
      window.web3 = web3
      const config = { dappId: '123', web3, networkId: 5 }
      assistInstance = da.init(config)
    })
    afterAll(() => {
      document.body.innerHTML = ''
      updateState(initialState)
      window.localStorage.clear()
      mockServer.close()
    })
    test('the user can call getState on assist', async () => {
      const state = await assistInstance.getState()
      const expectedAddress = version.includes('0.20')
        ? accounts[0].toLowerCase()
        : accounts[0]
      expect(state).toMatchObject({
        accessToAccounts: true,
        accountAddress: expectedAddress
      })
    })

    describe(`the user decorates a web3 contract`, async () => {
      let decoratedContract
      let contract
      beforeAll(async () => {
        contract = await getWeb3Contract(web3)
        decoratedContract = assistInstance.Contract(contract)
      })

      test('they can estimate gas of a method call from the decorated contract', async () => {
        const expected = 21988
        if (version.includes('0.20')) {
          const gasEstimate = await decoratedContract.convert.estimateGas(1, 2)
          expect(gasEstimate).toEqual(expected)
        } else {
          const gasEstimate = await decoratedContract.methods
            .convert(1, 2)
            .estimateGas()
          expect(gasEstimate).toEqual(expected)
        }
      })

      describe('the user makes a contract method call', () => {
        let res
        beforeAll(async () => {
          const args = [2, 5]
          if (version.includes('0.20')) {
            res = await decoratedContract.convert(...args)
          } else {
            res = await decoratedContract.methods.convert(...args).call({
              from: accounts[0]
            })
          }
        })

        test('results in the expected response', () => {
          const expected = '10'
          expect(res.convertedAmount || res.toString()).toEqual(expected)
        })
      })
    })

    describe(`the user decorates a truffle contract`, async () => {
      let decoratedContract
      let contract
      beforeAll(async () => {
        contract = await getTruffleContract(web3)
        decoratedContract = assistInstance.Contract(contract)
      })

      test('they can estimate gas of a method call from the decorated contract', async () => {
        const expected = await contract.convert.estimateGas(1, 2)
        const gasEstimate = await decoratedContract.convert.estimateGas(1, 2)
        expect(gasEstimate).toEqual(expected)
      })

      describe('the user makes a contract method call', () => {
        let res
        beforeAll(async () => {
          res = await decoratedContract.convert(2, 5)
        })
        test('results in the expected response', () => {
          const expected = '10'
          expect(res.toString()).toEqual(expected)
        })
      })
    })
  })
})
