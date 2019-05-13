import Web3 from 'web3'
import da from '~/js/index'
import * as events from '~/js/helpers/events'
import * as websocket from '~/js/helpers/websockets'
import * as stateMock from '~/js/helpers/state'
import * as iframeMock from '~/js/helpers/iframe'
import abi from '../res/abi'

jest.mock('../../js/helpers/web3')
jest.mock('../../js/helpers/browser')
jest.mock('../../js/helpers/iframe')

events.handleEvent = jest.fn()

// this is a little hacky but it's easier than creating a __mocks__ directory just for this case
websocket.openWebsocketConnection = jest.fn(() => {
  jest.fn()
})

const assist = da.init({ dappId: 'something' })

test('Fails if we try to initialise without a config object', () => {
  try {
    da.init()
  } catch (e) {
    expect(events.handleEvent).toHaveBeenCalledTimes(1)
    expect(e.eventCode).toBe('initFail')
  }
})

test('Fails if we try to initialise without a dappId', () => {
  try {
    da.init({ some: 'value ' })
  } catch (e) {
    expect(events.handleEvent).toHaveBeenCalledTimes(1)
    expect(e.eventCode).toBe('initFail')
  }
})

test('Returns the dassist object', () => {
  expect(assist).toHaveProperty('onboard')
  expect(assist).toHaveProperty('Contract')
  expect(assist).toHaveProperty('Transaction')
  expect(assist).toHaveProperty('getState')
})

test('Fails if we try to decorate without a web3 instance', () => {
  stateMock.state.config = {}
  const web3 = new Web3('ws://example.com')
  const contract = new web3.eth.Contract(
    abi,
    '0x0000000000000000000000000000000000000000'
  )

  try {
    assist.Contract(contract)
  } catch (e) {
    expect(e.eventCode).toBe('initFail')
  }
})

test('Does not delete any methods from the contract object when decorating', () => {
  const web3 = new Web3('ws://example.com')
  stateMock.state.web3Instance = web3
  stateMock.state.config = {}
  const assistWithWeb3 = da.init({
    dappId: 'something',
    web3
  })
  const contract = new web3.eth.Contract(
    abi,
    '0x0000000000000000000000000000000000000000'
  )
  const contractProps = Object.keys(contract)

  const decoratedContract = assistWithWeb3.Contract(contract)
  const decoratedContractProps = Object.keys(decoratedContract)

  expect(decoratedContractProps).toEqual(contractProps)
})

test('Does not allow sending transactions without a valid API key', async () => {
  stateMock.state.validApiKey = false
  stateMock.state.config = {}

  try {
    assist.Transaction({ some: 'property' })
  } catch (e) {
    expect(e.eventCode).toBe('initFail')
    expect(e.message).toBe('Your api key is not valid')
  }
})

test('Does not allow sending transactions on the wrong network', async () => {
  stateMock.state.validApiKey = true
  stateMock.state.supportedNetwork = false
  stateMock.state.config = {}

  try {
    assist.Transaction({ some: 'property' })
  } catch (e) {
    expect(e.eventCode).toBe('initFail')
    expect(e.message).toBe('This network is not supported')
  }
})

test('Does not create an iframe in headless mode', async () => {
  const web3 = new Web3('ws://example.com')
  stateMock.state = { validApiKey: true, accessToAccounts: true }
  da.init({ dappId: 'something', web3, headlessMode: true })
  expect(iframeMock.createIframe).toHaveBeenCalledTimes(0)
})

// reset the mock call count
beforeEach(() => {
  stateMock.updateState(stateMock.initialState)
  events.handleEvent.mockClear()
})
