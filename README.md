# NFTs Gallery

### The official repository of the smart contracts and deployment/upgrade scripts for official Gallery NFTs.


*Before doing anything, make sure you have node/npm/yarn installed and have initialized dependencies.*


## Snapshotting and Allowlisting

1. Ensure you have the most recent snapshot in a file called `snapshot/snapshot-old.json` and your `.env` file is complete. You can find the old snapshot [here](https://storage.cloud.google.com/gallery-prod-325303.appspot.com/snapshot.json) and you can use `.env.sample` to create a good `.env` file.

2. Fill out `snapshot/to-snapshot.json` with the new contracts/collections you want to snapshot as well as any manual addresses. Use the following format for each field:

```json
{
	 // to snapshot an entire ERC-721 collection using opensea
	 "erc721addresses": [ "erc721contractAddress1", "erc721contractAddress2", ...],
	 // if you want a specific range of token IDs from an ERC721
	 "erc721TokenIDRanges": { "erc721contractAddress3": [0, 100], "erc721contractAddress4": [900, 10040] },
	 // snapshot an opensea collection, great for art blocks collections because they are separated into collections on opensea but not in the contract.
	 // the collection name is the last part of the URL on a collection page. e.g. https://opensea.io/collection/chromie-squiggle-by-snowfro -> "chromie-squiggle-by-snowfro"
	 "openseaCollectionNames": ["collection-name-1", "collection-name-2", ...],
	 // the owners of a single token ID in an ERC-1155 contract. For example, the Gallery Membership Card Tiers.
	 // all ERC-1155 contracts should be here, opensea cannot handle ERC-1155 contracts
	 // note: when a number is too long, javascript complains. Just surround it in quotes
	 "erc1155AddressTokenIDs": {"erc1155contractAddress1": 5, "erc1155contractAddress2": "10003920003940"},
	 // any addresses to manually include
	 "manualInclude": ["address1", "address2", ...]
}
```

3. Run the command:

```bash
node snapshot/snapshot.js
```

4. Ensure the `GAS_PRICE` value in your `.env` (in wei) is at least 10 gwei above the current gas price. Use [this website](https://eth-converter.com/) to convert from wei to gwei and use [this website](https://etherscan.io/gastracker) to see the current gas prices in gwei.
5. Run the command:

```bash
npx hardhat run --network main snapshot/allowlist.js
```

6. With your gallery account running in a chrome window, go to [this website](https://console.cloud.google.com/storage/browser/gallery-prod-325303.appspot.com;tab=objects?project=gallery-prod-325303&supportedpurview=project&prefix=&forceOnObjectsSortingFiltering=false) and click `Upload Files`. Upload the new `snapshot.json` file that was just generated in the `snapshot` folder of this repo and make sure to overwrite it if it already exists.

Done!
