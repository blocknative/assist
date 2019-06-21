import { state } from './state'
import { networkName } from './utilities'

let provider

export const getEthersProvider = () => {
  if (!provider) {
    const { ethers } = state.config
    if (typeof window.ethereum !== 'undefined') {
      provider = new ethers.providers.Web3Provider(window.ethereum)
    } else if (typeof window.web3 !== 'undefined') {
      provider = new ethers.providers.Web3Provider(window.web3.currentProvider)
    } else {
      provider = ethers.getDefaultProvider(networkName(state.config.networkId))
    }
  }

  return provider
}

let UncheckedSigner

export const getUncheckedSigner = () => {
  if (!UncheckedSigner) {
    const { ethers } = state.config
    const provider = getEthersProvider()
    class UncheckedJsonRpcSigner extends ethers.Signer {
      constructor(signer) {
        super()
        ethers.utils.defineReadOnly(this, 'signer', signer)
        ethers.utils.defineReadOnly(this, 'provider', signer.provider)
      }

      getAddress() {
        return this.signer.getAddress()
      }

      sendTransaction(transaction) {
        return this.signer.sendUncheckedTransaction(transaction).then(hash => ({
          hash,
          nonce: null,
          gasLimit: null,
          gasPrice: null,
          data: null,
          value: null,
          chainId: null,
          confirmations: 0,
          from: null,
          wait: confirmations =>
            this.provider.waitForTransaction(hash, confirmations)
        }))
      }
    }

    UncheckedSigner = new UncheckedJsonRpcSigner(provider.getSigner())
  }

  return UncheckedSigner
}
