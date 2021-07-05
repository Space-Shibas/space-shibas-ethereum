import { useState } from 'react'
import { utils } from 'ethers'
import './App.css'
import { createContractStateHook } from "./createContractStateHook";
import { resolveProvider } from "./resolveProvider";
import { createContractHelper } from "./createContractHelper";
import SpaceShibas from './artifacts/contracts/SpaceShibas.sol/SpaceShibas.json'

const spaceShibasAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const provider = resolveProvider()
const spaceShibas = createContractHelper(spaceShibasAddress, SpaceShibas.abi, provider)
const useSpaceShibasState = createContractStateHook(spaceShibas.reader)

function App() {
  const [buyAmount, setBuyAmountValue] = useState(0)
  const [lastPurchasedShibaIds, setLastPurchasedShibaIds] = useState([])

  const [buyPrice] = useSpaceShibasState({
    stateVarName: 'price',
    initialData: utils.parseUnits('0'),
    transformData: (data) => utils.formatEther(data)
  })

  const [isSaleActive] = useSpaceShibasState('saleEnabled', false)

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function buyShibas() {
    if (!buyAmount || !parseInt(buyAmount || !buyPrice)) return
    const etherAmount = utils.parseEther(buyPrice.toString()).mul(buyAmount)
    await requestAccount()
    const transaction = await spaceShibas.signer.buy(buyAmount, { value: etherAmount })
    await transaction.wait()
    const txReceipt = await provider.getTransactionReceipt(transaction.hash)
    // const purchasedIds = txReceipt.logs.map((log) => spaceShibasInterface.parseLog(log).args.tokenId.toNumber())
    const purchasedIds = txReceipt.logs
      .map((log) => spaceShibas.interface.parseLog(log))
      .filter((log) => log.name === 'Transfer')
      .map((log) => log.args.tokenId.toNumber())
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
