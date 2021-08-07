import { useEffect, useState } from "react"
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from "./util/interact.js"

const Minter = props => {
  const [walletAddress, setWallet] = useState("")
  const [status, setStatus] = useState("")
  const [tokenID, setTokenID] = useState("")

  useEffect(() => {
    async function doit() {
      const { address, status } = await getCurrentWalletConnected()

      setWallet(address)
      setStatus(status)

      addWalletListener()
    }
    doit()
  }, [])

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        if (accounts.length > 0) {
          setWallet(accounts[0])
          setStatus("👆🏽 Write a message in the text-field above.")
        } else {
          setWallet("")
          setStatus("🦊 Connect to Metamask using the top right button.")
        }
      })
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      )
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet()
    setStatus(walletResponse.status)
    setWallet(walletResponse.address)
  }

  const onMintPressed = async () => {
    const { success, status } = await mintNFT(tokenID)
    setStatus(status)
    if (success) {
      setTokenID("")
    }
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">NFT Minter</h1>
      <p>Yippeee</p>
      <form>
        <h2>🖼 Token ID: </h2>
        <input
          type="text"
          placeholder="e.g. 1"
          onChange={event => setTokenID(event.target.value)}
        />
      </form>
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
      <p id="status" style={{ color: "red" }}>
        {status}
      </p>
    </div>
  )
}

export default Minter
