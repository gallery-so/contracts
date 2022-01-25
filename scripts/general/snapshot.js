import fetch from "node-fetch"
import fs from "fs"
// import { ethers } from "ethers"

// const alchemyKey = process.env.ALCHEMY_API_KEY
const openseaAPIKey = process.env.OPENSEA_API_KEY
const openseaAPIURL = "https://api.opensea.io/api/v1/assets"
const zeroAddress = "0x0000000000000000000000000000000000000000"
const contractaddresses = [
  "0x364547ADfc7a180744D762056Df35eeaEa803EC4",
  "0x123214ef2bB526D1b3FB84A6D448985F537d9763",
  "0xB228D7B6e099618Ca71bd5522B3a8c3788A8F172",
]

const main = async () => {
  let toSnapshot = []
  for (let address of contractaddresses) {
    console.log(`Fetching assets for ${address}`)
    let snapshot = await fetchAssets(address, 0, 0)
    toSnapshot = toSnapshot.concat(snapshot)
  }

  fs.writeFileSync("./snapshot_new.json", JSON.stringify(toSnapshot))
  console.log("Done!")
}

const fetchAssets = async (contractAddress, offset, retry) => {
  let toSnapshot = []

  console.log(`Fetching assets for ${contractAddress}`)

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
      await sleep(5000 + retry * 1000)
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
    toSnapshot.push(address)
  }
  if (assets.length === 50) {
    let next = await fetchAssets(contractAddress, offset + 50, 0)
    toSnapshot = toSnapshot.concat(next)
  }

  return dedupArray(toSnapshot)
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
