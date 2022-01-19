import fetch from "node-fetch"
import fs from "fs"
import { ethers } from "ethers"

const alchemyKey = process.env.ALCHEMY_API_KEY
const openseaAPIKey = process.env.OPENSEA_API_KEY
const openseaAPIURL = "https://api.opensea.io/api/v1/assets"
const zeroAddress = "0x0000000000000000000000000000000000000000"
const contractaddress = "0x13aAe6f9599880edbB7d144BB13F1212CeE99533"

const provider = new ethers.providers.AlchemyProvider(null, alchemyKey)

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "tokensOfOwner",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const contract = new ethers.Contract(contractaddress, abi, provider)

const main = async () => {
  let snapshot = await fetchAssets(contractaddress, 0, 0)

  fs.writeFileSync("./snapshot.json", JSON.stringify(snapshot))
  console.log("Done!")
}

const fetchAssets = async (contractAddress, offset, retry) => {
  let toSnapshot = []

  console.log("Fetching opensea...")
  const res = await fetch(
    `${openseaAPIURL}?asset_contract_address=${contractAddress}&limit=50&offset=${offset}&order_direction=desc`,
    {
      headers: {
        "X-API-KEY": openseaAPIKey,
      },
    }
  )
  console.log("Fetched opensea!")
  if (!res.ok) {
    if (res.status === 429 && retry < 3) {
      console.log("Too many requests, sleeping for a bit...")
      await sleep(5000)
      return fetchAssets(contractAddress, offset, retry + 1)
    }
    const text = await res.text()

    throw new Error(`${res.status} ${res.statusText} ${text}`)
  }
  console.log("Parsing opensea...")
  const json = await res.json()
  const assets = json.assets
  for (const asset of assets) {
    let { address } = asset.owner
    if (address === zeroAddress) {
      continue
    }
    let tid = parseInt(asset.token_id)
    if (tid < 1000000 || tid > 1000887) {
      continue
    }
    toSnapshot.push(address)
  }
  if (assets.length === 50) {
    let next = await fetchAssets(contractAddress, offset + 50, 0)
    toSnapshot = toSnapshot.concat(next)
  }

  return dedupArray(toSnapshot)
}

const addUpLegendas = async owners => {
  let total = 0
  for (const owner of owners) {
    let tokens = await contract.tokensOfOwner(owner)
    for (const token of tokens) {
      console.log(`${owner} - ${token.toNumber()}`)
      let num = token.toNumber()
      if (num < 1000000 || num > 1000887) {
        continue
      }
      total++
    }
  }
  return total
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function dedupArray(array) {
  return [...new Set(array)]
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .then(() => process.exit(0))
