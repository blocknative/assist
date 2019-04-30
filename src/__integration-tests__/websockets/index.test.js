import { WebSocket, Server } from 'mock-socket'

import da from '~/js'
import { state, updateState, initialState } from '~/js/helpers/state'
import * as websockets from '~/js/helpers/websockets'
import * as utilities from '~/js/helpers/utilities'
import * as events from '~/js/helpers/events'

const socketUrl = 'wss://api.blocknative.com/v0'

describe('a websocket connection is requested', () => {
  let mockServer
  const config = { dappId: '123', networkId: '1' }
  beforeEach(() => {
    da.init(config)
    mockServer = new Server(socketUrl)
  })
  afterEach(() => {
    mockServer.close()
  })
  test('state.pendingSocketConnection is set to true', () => {
    websockets.openWebsocketConnection()
    expect(state.pendingSocketConnection).toEqual(true)
  })
  describe('socket creation succeeds', () => {
    let handleEventSpy
    const connectionId = '123'
    beforeEach(() => {
      handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      window.localStorage.setItem('connectionId', connectionId)
      websockets.openWebsocketConnection()
      mockServer.emit('open')
    })
    afterEach(() => {
      handleEventSpy.mockRestore()
    })
    test('state.pendingSocketConnection set to false', () => {
      expect(state.pendingSocketConnection).toEqual(false)
    })
    test('state.socketConnection set to true', () => {
      expect(state.socketConnection).toEqual(true)
    })
    test('state.socket refs the socket', () => {
      expect(state.socket.url).toEqual(socketUrl)
    })
    test('event checkDappId is emitted with correct payload', () => {
      expect(handleEventSpy).toBeCalledWith({
        categoryCode: 'initialize',
        eventCode: 'checkDappId',
        connectionId
      })
    })
  })
  describe('socket refuses to connect', () => {
    beforeEach(() => {
      websockets.openWebsocketConnection()
      mockServer.emit('error')
    })
    test('state.pendingSocketConnection is set to false', () => {
      expect(state.pendingSocketConnection).toEqual(false)
    })
  })
  describe('socket creation throws an error', () => {
    beforeEach(() => {
      global.WebSocket = null
    })
    afterEach(() => {
      global.WebSocket = WebSocket
    })
    test('assistLog should be called with the error', () => {
      const assistLogSpy = jest
        .spyOn(utilities, 'assistLog')
        .mockImplementation(() => {})
      expect(() => {
        websockets.openWebsocketConnection()
      }).toThrow()
      expect(assistLogSpy).toHaveBeenCalled()
      assistLogSpy.mockRestore()
    })
  })
})

describe('assist is connected to a websocket', () => {
  const config = { dappId: '123', networkId: '1' }
  let mockServer
  beforeEach(() => {
    da.init(config)
    mockServer = new Server(socketUrl)
    websockets.openWebsocketConnection()
    mockServer.emit('open')
  })
  afterEach(() => {
    mockServer.close()
  })
  describe('receives a message with a connectionId', () => {
    const payload = { connectionId: '123' }
    test(`if state.connectionId is null it should be set in state and localStorage`, () => {
      mockServer.emit('message', JSON.stringify(payload))
      expect(state.connectionId).toEqual(payload.connectionId)
      expect(window.localStorage.getItem('connectionId')).toEqual(
        payload.connectionId
      )
    })
    test(`if state.connectionId !== connectionId from the server, update with val from server`, () => {
      updateState({ connectionId: '456' })
      expect(state.connectionId).toEqual('456')
      mockServer.emit('message', JSON.stringify(payload))
      expect(state.connectionId).toEqual(payload.connectionId)
      expect(window.localStorage.getItem('connectionId')).toEqual(
        payload.connectionId
      )
    })
  })
  describe('received message: [not a valid API key]', () => {
    const payload = {
      status: 'error',
      reason: 'not a valid API key',
      event: { eventCode: 'mockEvent' }
    }
    test('the expected error should be thrown', () => {
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrowErrorMatchingSnapshot()
    })
    test('state.validApiKey should be set to false', () => {
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrow()
      expect(state.validApiKey).toEqual(false)
    })
    test('correct initFail event should be emitted', () => {
      const handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrow()
      expect(handleEventSpy).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason: payload.reason
      })
      handleEventSpy.mockRestore()
    })
  })
  describe('received message: [network not supported]', () => {
    const payload = {
      status: 'error',
      reason: 'network not supported',
      event: { eventCode: 'mockEvent' }
    }
    test('the expected error should be thrown', () => {
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrowErrorMatchingSnapshot()
    })
    test('state.validApiKey should be set to false', () => {
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrow()
      expect(state.supportedNetwork).toEqual(false)
    })
    test('correct initFail event should be emitted', () => {
      const handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      expect(() => {
        mockServer.emit('message', JSON.stringify(payload))
      }).toThrow()
      expect(handleEventSpy).toHaveBeenCalledWith({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason: payload.reason
      })
      handleEventSpy.mockRestore()
    })
  })
  describe('received message: [checkDappId]', () => {
    const payload = { status: 'ok', event: { eventCode: 'checkDappId' } }
    beforeEach(() => {
      mockServer.emit('message', JSON.stringify(payload))
    })
    test('state.validApiKey should be set to true', () => {
      expect(state.validApiKey).toEqual(true)
    })
    test('state.supportedNetwork should be set to true', () => {
      expect(state.supportedNetwork).toEqual(true)
    })
  })
  describe('received message with a pending transaction', () => {
    let payload
    let handleEventSpy
    const transaction = {
      status: 'pending',
      nonce: 123,
      id: 'some-id'
    }
    const txObj = {
      transaction,
      eventCode: 'some-event',
      contract: 'some-contract',
      inlineCustomMsgs: { '1': 'msg' }
    }
    beforeEach(() => {
      const existingTx = {
        ...transaction,
        status: 'submitted'
      }
      updateState({ transactionQueue: [{ ...txObj, transaction: existingTx }] })
      handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      mockServer.emit('message', JSON.stringify(payload))
    })
    afterEach(() => {
      handleEventSpy.mockRestore()
    })
    payload = { event: { transaction } }
    test('tx status in transactionQueue should be set to pending', () => {
      expect(state.transactionQueue[0].transaction.status).toEqual('pending')
    })
    test('the expected event should be emitted', () => {
      expect(handleEventSpy).toHaveBeenCalledWith({
        eventCode: payload.eventCode,
        categoryCode: 'activeTransaction',
        transaction: txObj.transaction,
        contract: txObj.contract,
        inlineCustomMsgs: txObj.inlineCustomMsgs
      })
    })
    describe('eventCode is txPool', () => {
      beforeAll(() => {
        payload = {
          event: { transaction, eventCode: 'txPool' }
        }
      })
      test(`emitted event should have eventCode 'txPending'`, () => {
        expect(handleEventSpy).toHaveBeenCalledWith({
          eventCode: 'txPending',
          categoryCode: 'activeTransaction',
          transaction: txObj.transaction,
          contract: txObj.contract,
          inlineCustomMsgs: txObj.inlineCustomMsgs
        })
      })
    })
  })
  describe('received message with a confirmed transaction', () => {
    const transaction = {
      status: 'confirmed',
      nonce: 123,
      id: 'some-id'
    }
    const txObj = {
      transaction,
      eventCode: 'some-event',
      contract: 'some-contract',
      inlineCustomMsgs: { '1': 'msg' }
    }
    let existingTxStatus = 'pending'
    let handleEventSpy
    beforeEach(() => {
      handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      const existingTx = {
        ...transaction,
        status: existingTxStatus
      }
      updateState({ transactionQueue: [{ ...txObj, transaction: existingTx }] })
    })
    afterEach(() => {
      handleEventSpy.mockRestore()
    })
    const payload = { event: { transaction } }
    describe('tx status is confirmed', () => {
      beforeAll(() => {
        existingTxStatus = 'confirmed'
      })
      beforeEach(() => {
        mockServer.emit('message', JSON.stringify(payload))
      })
      test(`tx should be removed from the txQueue`, () => {
        expect(
          state.transactionQueue.find(
            txObj => txObj.transaction.id === 'some-id'
          )
        ).toBeFalsy()
      })
      test(`correct event should be emitted with tx status 'completed'`, () => {
        expect(handleEventSpy).toHaveBeenCalledWith({
          eventCode: 'txConfirmed',
          categoryCode: 'activeTransaction',
          transaction: { ...txObj.transaction, status: 'completed' },
          contract: txObj.contract,
          inlineCustomMsgs: txObj.inlineCustomMsgs
        })
      })
    })
    describe('tx status is NOT confirmed', () => {
      beforeAll(() => {
        existingTxStatus = 'some-status'
      })
      beforeEach(() => {
        mockServer.emit('message', JSON.stringify(payload))
      })
      test(`tx should remain in the txQueue`, () => {
        expect(
          state.transactionQueue.find(
            txObj => txObj.transaction.id === 'some-id'
          )
        ).toBeTruthy()
      })
      test(`correct event should be emitted with tx status 'confirmed'`, () => {
        expect(handleEventSpy).toHaveBeenCalledWith({
          eventCode: 'txConfirmed',
          categoryCode: 'activeTransaction',
          transaction: { ...txObj.transaction, status: 'confirmed' },
          contract: txObj.contract,
          inlineCustomMsgs: txObj.inlineCustomMsgs
        })
      })
    })
  })
  describe('received message with a failed transaction', () => {
    let handleEventSpy
    const transaction = {
      status: 'failed',
      nonce: 123,
      id: 'some-id'
    }
    const txObj = {
      transaction,
      eventCode: 'some-event',
      contract: 'some-contract',
      inlineCustomMsgs: { '1': 'msg' }
    }
    const existingTx = {
      ...transaction,
      status: 'some-status'
    }
    const payload = { event: { transaction } }
    beforeEach(() => {
      updateState({ transactionQueue: [{ ...txObj, transaction: existingTx }] })
      handleEventSpy = jest
        .spyOn(events, 'handleEvent')
        .mockImplementation(() => {})
      mockServer.emit('message', JSON.stringify(payload))
    })
    afterEach(() => {
      handleEventSpy.mockRestore()
    })
    test(`tx should be removed from the txQueue`, () => {
      expect(
        state.transactionQueue.find(txObj => txObj.transaction.id === 'some-id')
      ).toBeFalsy()
    })
    test(`correct event should be emitted with tx status 'failed'`, () => {
      expect(handleEventSpy).toHaveBeenCalledWith({
        eventCode: 'txFailed',
        categoryCode: 'activeTransaction',
        transaction: { ...txObj.transaction, status: 'failed' },
        contract: txObj.contract,
        inlineCustomMsgs: txObj.inlineCustomMsgs
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
