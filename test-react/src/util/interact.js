require("dotenv").config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const contractABI = require("../contract.json")
const contractAddress = "0x11eDBb43D972CF81727A24d3f2667d8d399Be425"
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(alchemyKey)

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      }
      return obj
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      }
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    }
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      })
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        }
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        }
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      }
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    }
  }
}

async function loadContract() {
  return new web3.eth.Contract(contractABI, contractAddress)
}

export async function mintNFT(tokenID) {
  if (tokenID.trim() == "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    }
  }

  window.contract = new web3.eth.Contract(contractABI.abi, contractAddress)

  const method = window.contract.methods.mint(
    window.ethereum.selectedAddress,
    parseInt(tokenID)
  )

  const gas = await method.estimateGas({
    from: window.ethereum.selectedAddress,
  })

  const gasPrice = await web3.eth.getGasPrice()

  const encodedABI = method.encodeABI()

  const transactionParameters = {
    to: contractAddress,
    from: window.ethereum.selectedAddress,
    gas: "0x" + gas.toString(16),
    gasPrice: "0x" + gasPrice.toString(16),
    data: encodedABI,
  }

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    })
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    }
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    }
  }
}
