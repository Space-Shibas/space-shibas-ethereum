import {useEffect, useRef, useState} from 'react'
import { utils } from 'ethers'
import Modal from 'react-modal'
import AnimateOnChange from 'react-animate-on-change'
import scientist from './images/scientist-animated.gif'
import pixelParty from './images/pixel-party.png'
import { ReactComponent as MetaMaskLogo } from './images/mm-logo.svg'
import './MintSection.css'
import './pixelLoader.css'
import { createContractStateHook } from "./createContractStateHook";
import { resolveProvider } from "./resolveProvider";
import { createContractHelper } from "./createContractHelper";
import SpaceShibas from './artifacts/contracts/SpaceShibas.sol/SpaceShibas.json'
import MintGallery from "./MintGallery";
import {useSmoothScrollTo} from "./useSmoothScrollTo";
import {useLocalStorage} from './useLocalStorage'
import {usePrevious} from "./usePrevious";

const spaceShibasAddress = '0x0167F45E9B2F26BeBBE8a2b266804CAE6968d179'
const provider = resolveProvider()
const spaceShibas = createContractHelper(spaceShibasAddress, SpaceShibas.abi, provider)
const useSpaceShibasState = createContractStateHook(spaceShibas.reader)

export const APP_STATE = {
  readyToMint: 'READY_TO_MINT',
  waitingForTx: 'WAITING_FOR_TX',
  txSuccess: 'TX_SUCCESS',
  soldOut: 'SOLD_OUT',
}

function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  })
}

function MintSection() {
  const [buyAmount, setBuyAmountValue] = useState(1)
  const [lastPurchasedShibaIds, setLastPurchasedShibaIds] = useState([])
  const [appState, setAppState] = useState(APP_STATE.readyToMint)
  const [modalIsOpen, setModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [shouldAnimateCount, setShouldAnimateCount] = useState(false)
  const [hasMintedShibas, setHasMintedShibas] = useLocalStorage('hasMintedShibas', false)
  const [showViewShibas, setShowViewShibas] = useState(false)

  const loadedNoneMinted = useRef(hasMintedShibas !== true)

  function disableCountAnimation() {
    setShouldAnimateCount(false)
  }

  useEffect(() => {
    if (hasMintedShibas && loadedNoneMinted.current !== hasMintedShibas) {
      setShowViewShibas(true)
    }
  }, [hasMintedShibas, appState])

  const [buyPrice] = useSpaceShibasState({
    stateVarName: 'price',
    initialData: utils.parseUnits('0'),
    transformData: (data) => ({
      wei: data,
      number: utils.formatEther(data)
    })
  })

  const [isSaleActive] = useSpaceShibasState('saleEnabled', true)
  const [shibasMinted, _, __, refreshShibasMinted] = useSpaceShibasState({
    stateVarName: 'shibasMinted',
    transformData: (data) => data.toNumber(),
    swrOptions: { refreshInterval: 6000 },
  })

  const shibasMintedPrevious = usePrevious(shibasMinted)
  useEffect(() => {
    if (
      shibasMinted !== undefined &&
      shibasMintedPrevious !== undefined &&
      shibasMinted !== shibasMintedPrevious
    ) {
      setShouldAnimateCount(true)
    }
  }, [shibasMinted, shibasMintedPrevious])

  useEffect(() => {
    if (!isSaleActive) {
      setAppState(APP_STATE.soldOut)
    }
  }, [isSaleActive])

  function showModal(bool) {
    return () => setModalOpen(bool)
  }

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  function resetAppState() {
    loadedNoneMinted.current = false
    setAppState(APP_STATE.readyToMint)
  }

  async function buyShibas() {
    setErrorMessage(null)
    if (!spaceShibas.web3Enabled) {
      setModalOpen(true)
      return
    }
    if (!buyAmount || !parseInt(buyAmount || !buyPrice.wei)) return
    const etherAmount = buyPrice.wei.mul(buyAmount)
    await requestAccount()
    let txHash
    try {
      // throw Error('Fake error pre-tx.')
      const transaction = await spaceShibas.signer.buy(buyAmount, { value: etherAmount })
      txHash = transaction.hash
      // throw Error('Fake error post-tx.')
      setAppState(APP_STATE.waitingForTx)
      setLastPurchasedShibaIds([])
      // await wait(5000)
      await transaction.wait()
      setAppState(APP_STATE.txSuccess)
      const txReceipt = await provider.getTransactionReceipt(transaction.hash)
      const purchasedIds = txReceipt.logs
        .map((log) => spaceShibas.interface.parseLog(log))
        .filter((log) => log.name === 'Transfer')
        .map((log) => log.args.tokenId.toNumber())
      setLastPurchasedShibaIds(purchasedIds)
      setHasMintedShibas(true)
      await refreshShibasMinted()
    } catch (err) {
      console.error(err)
      if (txHash) {
        setErrorMessage(
          <div className='error-message'>
            Transaction failed: {err.message} <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel='noreferrer'>Click here to see what happened on EtherScan.</a>
          </div>
        )
      } else {
        setErrorMessage(
          <div className='error-message'>
            Error occurred! Error message: {`${err.message}`}
          </div>
        )
      }
      resetAppState()
    }

  }

  const formattedEthAmount = provider ? `${utils.formatEther(buyPrice.wei.mul(buyAmount).mul(utils.parseUnits('0.01')))} ETH` : undefined
  // const formattedEthAmount = provider ? `${utils.formatEther(buyPrice.wei.mul(buyAmount))} ETH` : undefined

  function getMintButton() {
    switch (appState) {
      case APP_STATE.readyToMint:
        return <button
          onClick={buyShibas}
        >
          <span className='mint-word' style={formattedEthAmount ? {float: 'left', marginLeft: 8} : {}}>Mint</span>
          {formattedEthAmount ? <span className='mint-price'>({formattedEthAmount})</span> : ''}
        </button>;

      case APP_STATE.waitingForTx:
        return <button
          className='minting'
          disabled={true}
        >
          <span>Minting...</span>
        </button>

      case APP_STATE.txSuccess:
        return <button
          onClick={resetAppState}
        >
          <span className='mint-more'>Mint more!</span>
        </button>

      case APP_STATE.soldOut:
        return <button
          className='sold-out'
          disabled={true}
        >
          <span className='mint-word'>SOLD OUT!</span>
        </button>

      default:
        return
    }
  }

  function getMintInput() {
    switch (appState) {
      case APP_STATE.readyToMint:
        return <input
          type='number'
          min={1}
          max={10}
          step={1}
          pattern="[0-9]"
          onClick={e => {
            e.target.select()
          }}
          onChange={e => {
            const inputValue = e.target.value
            console.log(inputValue)
            if (inputValue.indexOf('.') > -1) {
              setBuyAmountValue(inputValue.split('.')[0])
              return
            }
            if (inputValue === '') {
              return
            }
            const inputValueInt = parseInt(inputValue)
            if (isNaN(inputValue)) {
              return
            }
            if (inputValueInt > 10) {
              let toSet = inputValue % 10
              toSet = toSet == 0 ? 10 : toSet
              toSet = inputValue == 100 ? 10 : toSet
              toSet = toSet < 1 ? 1 : toSet
              setBuyAmountValue(toSet < 1 ? 1 : toSet)
              return
            }
            if (!e.target.validity.valid) {
              return
            }
            setBuyAmountValue(inputValue)
          }}
          value={buyAmount}
        />

      case APP_STATE.waitingForTx:
        return <div className="loader-container"><div className="pixel-loader"></div></div>

      case APP_STATE.txSuccess:
        return <img src={pixelParty} className='pixel-party' />

      case APP_STATE.soldOut:
        return

      default:
        return
    }
  }

  const bind = useSmoothScrollTo('#mint')

  return (
    <div {...bind} className="MintSection">
      <div className="mint-content-left">
        <h1>How to get your Space Shiba companion!</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas maximus lectus justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas maximus lectus justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas maximus lectus justo.</p>
        <div className="mint-interface">
          <div className='shibas-minted-wrapper'>
            {shibasMinted !== undefined && <div className='shibas-minted'>
              <AnimateOnChange
                baseClassName='shiba-minted-count'
                animationClassName='shiba-minted-count--flash'
                animate={shouldAnimateCount}
                onAnimationEnd={disableCountAnimation}
              >
                {shibasMinted}
              </AnimateOnChange> / 10,000 SHIBAS&nbsp;MINTED
            </div>}
          </div>
          {getMintInput()}
          {getMintButton()}
        </div>
      </div>

      <div className="mint-content-right">
        <img alt='Professor Shiba has no idea what he is doing' src={scientist} />
      </div>

      {errorMessage && errorMessage}

      {!(appState === APP_STATE.soldOut) && <MintGallery
        buyAmount={buyAmount}
        purchasedIds={lastPurchasedShibaIds}
        appState={appState}
        contractAddress={spaceShibasAddress}
      />}

      <div
        disabled={!showViewShibas}
        className={showViewShibas ? 'view-my-shibas' : 'view-my-shibas not-minted-yet'}
      >
        <button>View My Shibas</button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={showModal(false)}
        className="get-metamask-modal"
        overlayClassName="get-metamask-modal-overlay"
        contentLabel="Example Modal"
      >
        <button onClick={showModal(false)}>✕</button>
        <p>You'll need to install MetaMask to continue.<br />Once you have it installed, refresh this page. </p>
        <a href='https://metamask.io/download.html' target='_blank' rel='noreferrer'>Install Metamask<MetaMaskLogo /></a>

      </Modal>
    </div>
  )
}

export default MintSection