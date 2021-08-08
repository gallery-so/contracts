require("dotenv").config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const contractABI = require("../contract.json")
const contractAddress = "0xb4E9B4Ec66cF15Af5E20F7dA01eaf74C3fDDA9b2"
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

export async function mintNFT(tokenID) {
  if (tokenID.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    }
  }

  window.contract = new web3.eth.Contract(contractABI.abi, contractAddress)

  const method = window.contract.methods.mint(
    window.ethereum.selectedAddress,
    Number(tokenID)
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

export async function mintNFTbatch(tokenIds, addresses) {
  if (tokenIds.length !== addresses.length) {
    return {
      success: false,
      status:
        "❗Please make sure that token ids length is equal to addresses length.",
    }
  }
  window.contract = new web3.eth.Contract(contractABI.abi, contractAddress)

  const method = window.contract.methods.mintBatch(addresses, tokenIds)

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

export async function transferToken(tokenId, toAddr) {
  if (tokenId.trim() === "" || toAddr.trim() === "") {
    return {
      success: false,
      status:
        "❗Please make sure all fields are completed before transferring.",
    }
  }
  window.contract = new web3.eth.Contract(contractABI.abi, contractAddress)

  const method = window.contract.methods.safeTransferFrom(
    window.ethereum.selectedAddress,
    toAddr,
    Number(tokenId)
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
export async function redeem(tokenId) {
  if (tokenId.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before redeeming.",
    }
  }
  window.contract = new web3.eth.Contract(contractABI.abi, contractAddress)

  const method = window.contract.methods.redeem(Number(tokenId))

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
