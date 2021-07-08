import mysteryShiba from './images/mystery.png'
import {useEffect, useState} from "react";
import {APP_STATE} from "./MintSection";
import loadingSpinner from './images/loading-image.gif'
import './ShibaPortrait.css'

const BASE_URI = 'https://spaceshibas.mypinata.cloud/ipfs/QmUMJ8KCcrLFsY8946qcq7U6jiwVHhML4ydQB1uc1n52sn'
// const BASE_URI = 'https://ipfs.io/ipfs/QmUMJ8KCcrLFsY8946qcq7U6jiwVHhML4ydQB1uc1n52sn'
const TRANSPARENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
const OPENSEA_URI_PREFIX = 'https://testnets.opensea.io/assets'

function ShibaPortrait({ id, nftId, appState, isBlank, contractAddress }) {
  const [imagesPreloaded, setImagesPreloaded] = useState({})

  useEffect(() => {
    if (appState === APP_STATE.readyToMint) {
      setImagesPreloaded({})
    }
  }, [appState])

  let mysteryClassName
  if (appState === APP_STATE.waitingForTx && !isBlank) {
    mysteryClassName = 'mystery waiting'
  } else if (isBlank) {
    mysteryClassName = 'mystery blank'
  } else {
    mysteryClassName = 'mystery'
  }

  const purchasedSrc = nftId ? `${BASE_URI}/${nftId}.png` : TRANSPARENT
  if (nftId && !imagesPreloaded[nftId] && appState !== APP_STATE.readyToMint) {
    const image = new Image()
    image.src = purchasedSrc
    image.onload = () => {
      setImagesPreloaded({ ...imagesPreloaded, [nftId]: true })
    }
  }

  const imageLoaded = !!imagesPreloaded[nftId]
  let purchasedClassName
  if (appState === APP_STATE.txSuccess && nftId) {
    purchasedClassName = imageLoaded ? 'purchased complete' : 'purchased hidden'
  } else {
    purchasedClassName = 'purchased hidden'
  }

  let loadingClassName
  if (appState === APP_STATE.txSuccess && nftId) {
    loadingClassName = 'loading'
  } else {
    loadingClassName = 'loading hidden'
  }


  const openseaClassName = appState === APP_STATE.txSuccess && nftId && imageLoaded
    ? 'opensea-link show-link'
    : 'opensea-link hidden'

  function onClick() {
    if (appState === APP_STATE.txSuccess && nftId && imageLoaded) {
      window.open(`${OPENSEA_URI_PREFIX}/${contractAddress}/${nftId}`)
    }
  }

  return <div
    className='shiba-portrait'
    onClick={onClick}
  >
    <img id={id} className={mysteryClassName} src={mysteryShiba}/>
    {appState !== APP_STATE.readyToMint && <img className={loadingClassName} src={loadingSpinner}/>}
    <img className={purchasedClassName} src={purchasedSrc} />
    <div className={openseaClassName}>VIEW ON OPENSEA</div>
  </div>
}

export default ShibaPortrait
