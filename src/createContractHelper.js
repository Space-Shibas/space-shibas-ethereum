import { ethers } from "ethers";

export function createContractHelper(address, abi, provider) {
  if (!provider) {
    return { web3Enabled: false }
  }
  const signer = provider.getSigner()
  const contractHelper = {
    web3Enabled: true,
    reader: new ethers.Contract(address, abi, provider),
    signer: new ethers.Contract(address, abi, signer),
  }
  contractHelper.interface = contractHelper.reader.interface
  return contractHelper
}