import { useEffect, useState } from "react"
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
  mintNFTbatch,
  redeem,
  transferToken,
} from "./util/interact.js"

const Minter = props => {
  const [walletAddress, setWallet] = useState("")
  const [status, setStatus] = useState("")
  const [tokenID, setTokenID] = useState("")
  const [toAddr, setToAddr] = useState("")
  const [addresses, setAddresses] = useState("")
  const [tokensToMint, setTokensToMint] = useState("")

  useEffect(() => {
    async function doit() {
      const { address, status } = await getCurrentWalletConnected()

      setWallet(address)
      setStatus(status)

      addWalletListener()
    }
    doit()
  }, [])

  useEffect(() => {
    console.log(tokenID)
    console.log(toAddr)
    console.log(addresses)
    console.log(tokensToMint)
    console.log(walletAddress)
  }, [walletAddress, tokenID, toAddr, addresses, tokensToMint])

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
  }
  const onRedeemPressed = async () => {
    const { success, status } = await redeem(tokenID)
    setStatus(status)
  }

  const onTransferPressed = async () => {
    const { success, status } = await transferToken(tokenID, toAddr)
    setStatus(status)
  }

  const onMintBatchPressed = async () => {
    const tokenIds = tokensToMint.split(",").map(tokenID => {
      return Number(tokenID)
    })
    const addrs = addresses.split(",")
    const { success, status } = await mintNFTbatch(tokenIds, addrs)
    setStatus(status)
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
        <h2>Token ID: </h2>
        <input
          type="text"
          placeholder="e.g. 1"
          onChange={event => setTokenID(event.target.value)}
        />
        <h2>Send To: </h2>
        <input
          type="text"
          placeholder="e.g. 0xl29ijso92jals92aAls92..."
          onChange={event => setToAddr(event.target.value)}
        />
        <h2>Tokens To Mint Batch: (comma sepparated) </h2>
        <input
          type="text"
          placeholder="e.g. 1,2,3,4"
          onChange={event => setTokensToMint(event.target.value)}
        />
        <h2>Addresses To Mint Batch To: (comma sepparated) </h2>
        <input
          type="text"
          placeholder="e.g. 0xas...,0x020..."
          onChange={event => setAddresses(event.target.value)}
        />
      </form>
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
      <button id="mintButton" onClick={onRedeemPressed}>
        Redeem NFT
      </button>
      <button id="mintButton" onClick={onMintBatchPressed}>
        Mint Batch NFTs
      </button>
      <button id="mintButton" onClick={onTransferPressed}>
        Transfer NFT
      </button>
      <p id="status" style={{ color: "red" }}>
        {status}
      </p>
    </div>
  )
}

export default Minter
