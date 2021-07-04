import { useEffect, useState } from 'react'
import { useAsyncEffect } from "use-async-effect";
import { ethers, utils } from 'ethers'
import './App.css'
import SpaceShibas from './artifacts/contracts/SpaceShibas.sol/SpaceShibas.json'

const spaceShibasAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

function App() {
  const [buyAmount, setBuyAmountValue] = useState(0)
  const [buyPrice, setBuyPrice] = useState(0)
  const [isSaleActive, setIsSaleActive] = useState(false)
  const [lastPurchasedShibaIds, setLastPurchasedShibaIds] = useState([])

  const spaceShibasInterface = new utils.Interface(SpaceShibas.abi)

  useAsyncEffect(async () => {
    setIsSaleActive(await fetchIsSaleActive())
    setBuyPrice(utils.formatEther(await getBuyPrice()))
  }, [])

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function getBuyPrice() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(spaceShibasAddress, SpaceShibas.abi, provider)
      try {
        const data = await contract.price()
        console.log('price result:', data)
        return data
      } catch (err) {
        console.log("price Error:", err)
      }
    }
  }

  async function fetchIsSaleActive() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(spaceShibasAddress, SpaceShibas.abi, provider)
      try {
        console.log('?!?!?!?!?!?!?!')
        const data = await contract.saleEnabled()
        console.log('data:', data)
        return data
      } catch (err) {
        console.log("Error:", err)
      }
    }
  }

  async function buyShibas() {
    if (!buyAmount || !parseInt(buyAmount)) return
    if (typeof window.ethereum === 'undefined') return
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(spaceShibasAddress, SpaceShibas.abi, signer)
    const etherAmount = utils.parseEther(buyPrice.toString()).mul(buyAmount)
    const transaction = await contract.buy(buyAmount, { value: etherAmount })
    await transaction.wait()
    const txReceipt = await provider.getTransactionReceipt(transaction.hash)
    const purchasedIds = txReceipt.logs.map((log) => spaceShibasInterface.parseLog(log).args.tokenId.toNumber())
    console.log('purchased!', transaction)
    setBuyAmountValue(0)
    setLastPurchasedShibaIds(purchasedIds)
  }

  return (
    <div className="App">
      <header className="App-header">
        Sale active: {isSaleActive.toString()}<br />
        Buy price: {buyPrice}<br />
        Last purchased Ids: {lastPurchasedShibaIds.join(', ')}
        <button onClick={buyShibas}>Mint Shibas</button>
        <input
            onChange={e => setBuyAmountValue(e.target.value)}
            placeholder="Amount to Purchase"
            value={buyAmount}
        />
      </header>
    </div>
  )
}

export default App
