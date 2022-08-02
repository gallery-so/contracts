const fetch = require("node-fetch");
const fs = require("fs");
const { MerkleTree } = require("./helpers/merkleTree");

const openseaAPIKey = process.env.OPENSEA_API_KEY;
const openseaAPIURL = "https://api.opensea.io/api/v1/assets";
const zeroAddress = "0x0000000000000000000000000000000000000000";
const contractaddresses = [];

const toCheckOverlapAddresses = [""];

const manualAdd = [];

const main = async () => {
  let toSnapshot = [];
  for (const address of contractaddresses) {
    console.log(`Fetching assets for ${address}`);
    let snapshot = await fetchAssets(address, 0, 0, {});
    toSnapshot.push(...snapshot);
  }

  toSnapshot = toSnapshot.concat(manualAdd).map((x) => x.toLowerCase());
  toSnapshot = [...new Set(toSnapshot)];

  console.log(`Found ${toSnapshot.length} assets`);

  const result = {};

  const tree = new MerkleTree(toSnapshot);
  const root = tree.getHexRoot();
  result["root"] = root;
  const proofs = {};
  const allowlist = {};
  for (let i = 0; i < toSnapshot.length; i++) {
    const p = tree.getHexProof(toSnapshot[i]);
    proofs[toSnapshot[i]] = p;

    allowlist[toSnapshot[i]] = 1;
  }
  result["proofs"] = proofs;
  result["allowlist"] = allowlist;

  if (toCheckOverlapAddresses.length > 0) {
    let overlapAssets = [];
    for (const address of toCheckOverlapAddresses) {
      const assets = await fetchAssetsWithAsset(address, 0, 0, {});
      overlapAssets.push(...assets);
    }
    console.log(`Found ${overlapAssets.length} assets in overlap check`);
    const overlap = {};
    for (const asset of overlapAssets) {
      const { address } = asset.owner;
      if (allowlist[address]) {
        if (!overlap[address]) {
          overlap[address] = [asset.name];
        } else {
          overlap[address].push(asset.name);
        }
      }
    }
    console.log(`Found ${overlap.length} overlapping assets`);
    result["overlap"] = overlap;
  }

  fs.writeFileSync("snapshot.json", JSON.stringify(result));
  console.log("Done!");
};

const fetchAssets = async (contractAddress, cursor, retry, seen) => {
  let toSnapshot = [];

  if (seen === null || seen === undefined) {
    seen = {};
  }

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
      await sleep(5000 + retry * 1000);
      return fetchAssets(contractAddress, cursor, retry + 1, seen);
    }
    const text = await res.text();

    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  console.log("Parsing opensea...");
  const json = await res.json();
  const assets = json.assets;

  let stop = false;
  for (const asset of assets) {
    if (asset.id in seen) {
      stop = true;
      break;
    }
    let { address } = asset.owner;
    if (address === zeroAddress) {
      continue;
    }
    toSnapshot.push(address);
    seen[asset.id] = true;
  }

  if (!stop) {
    console.log("Fetching next page...");
    let next = await fetchAssets(contractAddress, json.next, 0, seen);
    toSnapshot = toSnapshot.concat(next);
  }

  console.log(`Found ${toSnapshot.length} assets, deduping now...`);

  return toSnapshot;
};

const fetchAssetsWithAsset = async (contractAddress, cursor, retry, seen) => {
  let toSnapshot = [];

  if (seen === null || seen === undefined) {
    seen = {};
  }

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
      await sleep(5000 + retry * 1000);
      return fetchAssetsWithAsset(contractAddress, cursor, retry + 1, seen);
    }
    const text = await res.text();

    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  console.log("Parsing opensea...");
  const json = await res.json();
  const assets = json.assets;

  let stop = false;
  for (const asset of assets) {
    if (asset.id in seen) {
      stop = true;
      break;
    }
    let { address } = asset.owner;
    if (address === zeroAddress) {
      continue;
    }
    toSnapshot.push(asset);
    seen[asset.id] = true;
  }

  if (!stop) {
    console.log("Fetching next page...");
    let next = await fetchAssetsWithAsset(contractAddress, json.next, 0, seen);
    toSnapshot = toSnapshot.concat(next);
  }

  console.log(`Found ${toSnapshot.length} assets, deduping now...`);

  return toSnapshot;
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// function that returns the overlap of two arrays
function arrayOverlap(arr1, arr2) {
  return arr1.filter((x) => arr2.includes(x));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => process.exit(0));
