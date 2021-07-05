import { ethers } from "ethers";

export function createContractHelper(address, abi, provider) {
  const signer = provider.getSigner()
  const contractHelper = {
    reader: new ethers.Contract(address, abi, provider),
    signer: new ethers.Contract(address, abi, signer),
  }
  contractHelper.interface = contractHelper.reader.interface
  return contractHelper
}