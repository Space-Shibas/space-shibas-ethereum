import {ethers} from "ethers";

export function resolveProvider() {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.providers.Web3Provider(window.ethereum)
  }
  throw Error('window.ethereum not defined') // TODO: Be more graceful
}
