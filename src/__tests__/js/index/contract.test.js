import Web3v1 from 'web3'
import fclone from 'fclone'
import da from '~/js'
import abi from '../../res/abi.json'

const websocketRegex = /nSec-WebSocket-Key.*?==/g
const base64NonceRegex = /base64nonce.*?==/g

/* Prepares contract for snapshot
 * - Removes circular refs
 * - Repalces random websocket key with predefined value
 * - Replaces random nonce with predefined value
 */
function sanitiseContract(contract) {
  const contractNoCircular = fclone(contract)
  return JSON.parse(
    JSON.stringify(contractNoCircular)
      .replace(websocketRegex, 'nSec-WebSocket-Key: somekey==')
      .replace(base64NonceRegex, 'base64nonce":"somenonce==')
  )
}

describe('Contract decoration', () => {
  const web3Versions = [[Web3v1, 'v1']]
  web3Versions.forEach(([Web3, version]) => {
    describe(`using web3 ${version}`, () => {
      test('decorating a contract produces the expected output', () => {
        const web3 = new Web3('ws://example.com')
        const assistInstance = da.init({ dappId: '123', web3, networkId: '1' })
        const contract = new web3.eth.Contract(
          abi,
          '0x0000000000000000000000000000000000000000'
        )
        const decoratedContract = assistInstance.Contract(contract)
        expect(sanitiseContract(decoratedContract)).toMatchSnapshot()
      })
    })
  })
})
