import fetch from "node-fetch"
import fs from "fs"
import { BigNumber, ethers } from "ethers"

const openseaAPIKey = process.env.OPENSEA_API_KEY
const openseaAPIURL = "https://api.opensea.io/api/v1/assets"
const zeroAddress = "0x0000000000000000000000000000000000000000"
const contractaddress = "0x13aAe6f9599880edbB7d144BB13F1212CeE99533"

const provider = new ethers.providers.AlchemyProvider(
  null,
  process.env.ALCHEMY_API_KEY
)

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenIdToProjectId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const contract = new ethers.Contract(contractaddress, abi, provider)

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function dedupArray(arr) {
  let seen = {}
  return arr.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true)
  })
}

const main = async () => {
  let snapshot = await fetchAssets(contractaddress, 0, 0)

  console.log(snapshot)
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
    throw new Error(`${res.status} ${res.statusText}`)
  }
  console.log("Parsing opensea...")
  const json = await res.json()
  const assets = json.assets
  for (const asset of assets) {
    let { address } = asset.owner
    if (address === zeroAddress) {
      continue
    }
    let tid = BigNumber.from(asset.token_id)
    let projectID = await contract.tokenIdToProjectId(tid, {})
    if (projectID.toNumber() !== 1) {
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

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .then(() => process.exit(0))
