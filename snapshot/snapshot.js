const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

const openseaAPIKey = process.env.OPENSEA_API_KEY;
const openseaAPIURL = "https://api.opensea.io/api/v1/assets";
const alchemyAPIURL = process.env.API_URL;
const zeroAddress = "0x0000000000000000000000000000000000000000";
const toSnapshot = JSON.parse(fs.readFileSync("./to-snapshot.json"));
const {
  erc721Addresses,
  erc721TokenIDRanges,
  openseaCollectionNames,
  erc1155AddressTokenIDs,
  manualInclude,
} = toSnapshot;

const oldSnapshot = JSON.parse(fs.readFileSync("./snapshot-old.json"));

const main = async () => {
  let toSnapshot = [];

  console.log("Fetching opensea collections...");

  for (let collection of openseaCollectionNames) {
    console.log(`Fetching assets for ${collection}`);
    let snapshot = await fetchCollectionAssets(collection, 0, 0);
    toSnapshot = toSnapshot.concat(snapshot);
  }

  console.log("Fetching erc1155 assets...");

  for (const [address, tokenID] of Object.entries(erc1155AddressTokenIDs)) {
    console.log(
      `Fetching ERC-1155 assets for ${address} and tokenID ${tokenID}`
    );
    const owners = await fetchAlchemyOwners(address, tokenID);
    toSnapshot = toSnapshot.concat(owners);
  }

  console.log("Fetching ERC-721 token ID ranges...");

  console.log(`Fetched ${toSnapshot.length} assets`);
  for (const [address, range] of Object.entries(erc721TokenIDRanges)) {
    console.log(`Fetching ranged assets for ${address} and range ${range}`);
    const owners = await fetchAssetsOfRange(address, range, 0);
    toSnapshot = toSnapshot.concat(owners);
  }

  console.log("Fetching ERC-721 assets...");

  for (let address of erc721Addresses) {
    console.log(`Fetching assets for ${address}`);
    let snapshot = await fetchAssets(address, 0, 0);
    toSnapshot = toSnapshot.concat(snapshot);
  }

  // Adding old snapshot and manual addresses

  toSnapshot = toSnapshot.concat(manualInclude);
  toSnapshot = toSnapshot.concat(oldSnapshot);

  // Validation

  toSnapshot = dedupe(toSnapshot);
  toSnapshot = validate(toSnapshot);
  toSnapshot = lowercase(toSnapshot);

  console.log(`Fetched ${toSnapshot.length} assets`);

  fs.writeFileSync("./snapshot.json", JSON.stringify(toSnapshot));
  console.log("Done!");
};

const fetchAssets = async (contractAddress, cursor, retry) => {
  let toSnapshot = [];

  let url = `${openseaAPIURL}?limit=50&order_direction=desc&asset_contract_address=${contractAddress}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": openseaAPIKey,
    },
  });
  console.log("Fetched opensea!");
  if (!res.ok) {
    if (res.status === 429 && retry < 3) {
      console.log("Too many requests, sleeping for a bit...");
      await sleep(10000 + retry * 5000);
      return fetchAssets(contractAddress, cursor, retry + 1);
    }
    const text = await res.text();

    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  console.log("Parsing opensea...");
  const json = await res.json();
  const assets = json.assets;
  for (const asset of assets) {
    let { address } = asset.owner;
    if (address === zeroAddress) {
      continue;
    }

    toSnapshot.push(address);
  }

  if (json.next) {
    let next = await fetchAssets(contractAddress, json.next, 0);
    toSnapshot = toSnapshot.concat(next);
  }

  return toSnapshot;
};

const fetchAssetsOfRange = async (contractAddress, range, retry) => {
  let toSnapshot = [];

  let url = `${openseaAPIURL}?limit=30&order_direction=desc&asset_contract_address=${contractAddress}`;
  for (let i = range[0]; i <= range[1] && i < 30 + range[0]; i++) {
    url += `&token_ids=${i}`;
  }
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": openseaAPIKey,
    },
  });
  console.log("Fetched opensea!");
  if (!res.ok) {
    if (res.status === 429 && retry < 3) {
      console.log("Too many requests, sleeping for a bit...");
      await sleep(10000 + retry * 5000);
      return fetchAssetsOfRange(contractAddress, range, retry + 1);
    }
    const text = await res.text();

    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  console.log("Parsing opensea...");
  const json = await res.json();
  const assets = json.assets;
  for (const asset of assets) {
    let { address } = asset.owner;
    if (address === zeroAddress) {
      continue;
    }

    toSnapshot.push(address);
  }

  if (assets.length === 30) {
    const newRange = [range[0] + 30, range[1]];
    const next = await fetchAssetsOfRange(contractAddress, newRange, 0);
    toSnapshot = toSnapshot.concat(next);
  }

  return toSnapshot;
};

const fetchCollectionAssets = async (collection, cursor, retry) => {
  let toSnapshot = [];

  let url = `${openseaAPIURL}?limit=50&order_direction=desc&collection=${collection}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": openseaAPIKey,
    },
  });
  console.log("Fetched opensea!");
  if (!res.ok) {
    if (res.status === 429 && retry < 3) {
      console.log("Too many requests, sleeping for a bit...");
      await sleep(5000 + retry * 1000);
      return fetchCollectionAssets(collection, cursor, retry + 1);
    }
    const text = await res.text();

    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  console.log("Parsing opensea...");
  const json = await res.json();
  const assets = json.assets;
  for (const asset of assets) {
    let { address } = asset.owner;
    if (address === zeroAddress) {
      continue;
    }

    toSnapshot.push(address);
  }

  if (json.next) {
    let next = await fetchCollectionAssets(collection, json.next, 0);
    toSnapshot = toSnapshot.concat(next);
  }

  return toSnapshot;
};

const fetchAlchemyOwners = async (address, tokenID) => {
  const url = `${alchemyAPIURL}/getOwnersForToken?contractAddress=${address}&tokenId=${tokenID}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${resp.statusText} ${text}`);
  }
  console.log("Fetched alchemy!");
  const json = await resp.json();
  return json.owners;
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const validate = (arr) => {
  return arr.filter((item) => {
    return item.length === 42;
  });
};
// lowercase every string in array
const lowercase = (arr) => {
  return arr.map((item) => item.toLowerCase());
};

// dedupe array
const dedupe = (arr) => {
  return [...new Set(arr)];
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => process.exit(0));
