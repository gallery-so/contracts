const fetch = require("node-fetch")
const fs = require("fs")

const openseaAPIKey = process.env.OPENSEA_API
const openseaAPIURL = "https://api.opensea.io/api/v1/assets"
const zeroAddress = "0x0000000000000000000000000000000000000000"

let toSnapshot = {
  CONTRACT_ADDRESS: ["0", "1", "2", "3"],
}

const main = async () => {
  const snapshot = []
  for (const [key, value] in Object.entries(toSnapshot)) {
    let toSnapshot = await fetchAssets(key, value, 0, 0)
    snapshot = snapshot.concat(toSnapshot)
  }
  console.log(snapshot)
  fs.writeFileSync("./snapshot.json", JSON.stringify(snapshot))
  console.log("Done!")
}

const fetchAssets = async (contractAddress, tids, offset, retry) => {
  let toSnapshot = []
  let tokenIDs = tids.map(tokenID => {
    return `token_ids=${tokenID}&`
  })
  const res = await fetch(
    `${openseaAPIURL}?contract_address=${contractAddress}&${tokenIDs}limit=50&offset=${offset}`,
    {
      headers: {
        "X-API-KEY": openseaAPIKey,
      },
    }
  )
  if (!res.ok) {
    if (res.status === 429 && retry < 3) {
      console.log("Too many requests, sleeping for a bit...")
      await sleep(10000)
      return fetchAssets(contractAddress, tids, offset, retry + 1)
    }
    throw new Error(`${res.status} ${res.statusText}`)
  }
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
    let next = await fetchAssets(contractAddress, tids, offset + 50, 0)
    toSnapshot = toSnapshot.concat(next)
  }

  return toSnapshot
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .then(() => process.exit(0))
