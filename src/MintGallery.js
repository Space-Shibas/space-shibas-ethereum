import ShibaPortrait from './ShibaPortrait'
import './MintGallery.css'

function MintGallery({ buyAmount, purchasedIds, appState, contractAddress }) {
    const portraits = []
    for (let i = 0; i < 10; i++) {
        const nftId = purchasedIds ? purchasedIds[i] : null
        const isBlank = i >= buyAmount
        portraits.push(
          <ShibaPortrait
            key={`portrait-${i}`}
            nftId={nftId}
            appState={appState}
            isBlank={isBlank}
            contractAddress={contractAddress}
          />
        )
    }

    return <div className='mint-gallery'>{portraits}</div>
}

export default MintGallery
