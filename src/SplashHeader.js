import './SplashHeader.css'
import shib from './images/shib.png'
import logo from './images/logo.png'
import { ReactComponent as TelegramIcon } from "./images/telegram.svg";
import { ReactComponent as DiscordIcon } from "./images/discord.svg";
import { ReactComponent as TwitterIcon } from "./images/twitter.svg";
import { ReactComponent as GithubIcon } from "./images/github.svg";
import { ReactComponent as OpenSeaIcon } from "./images/open-sea.svg";

function SplashHeader() {

  const scrollToMint = new Event('scrollToMint')

  return (
    <div className="SplashHeader">
      <div className="splash-spacer">&nbsp;</div>
      <div className="shiba-wrap-away">
        <div className="shiba-wrap-sway">
          <div className="shiba-wrap-rotate">
            <div className={"shiba-wrap-float"}>
              <img className="shiba-inu" src={shib} alt="Space Shibas" /><br />
            </div>
          </div>
        </div>
      </div>
      <img className="logo" src={logo} alt="Space Shibas Logo" /><br />
      <a onClick={() => dispatchEvent(scrollToMint)} className="button-1">
        MINT SHIBAS
      </a><br />
      <a href="#" className="button-2">
        VIEW GALLERY
      </a><br />
      <div className="social-icons">
        <a href="https://t.me/SpaceShibas" target='_blank' rel='noreferrer' className="social-icon"><TelegramIcon /></a>
        <a href="https://discord.gg/cXAhtxexJx" target='_blank' rel='noreferrer' className="social-icon"><DiscordIcon /></a>
        <a href="https://twitter.com/Space_Shibas" target='_blank' rel='noreferrer' className="social-icon"><TwitterIcon /></a>
        <a href="https://github.com/Space-Shibas/space-shibas-ethereum" target='_blank' rel='noreferrer' className="social-icon"><GithubIcon /></a>
        <a href="https://opensea.io/Space_Shibas" target='_blank' rel='noreferrer' className="social-icon"><OpenSeaIcon style={{marginBottom: 6}} /></a>
      </div>
    </div>
  )
}

export default SplashHeader
