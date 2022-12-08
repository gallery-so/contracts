const { MerkleTree } = require("../helpers/merkleTree");

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.TESTNET_MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const elements = [];

  const tree = new MerkleTree(elements);

  const root = tree.getHexRoot();

  const result = await contract.setTokenType(
    1,
    0,
    0,
    0,
    root,
    "ipfs://QmZa6Xj8TUMHXMVGZrhJ8wyaj5jNBWXtpb6jV4ABJ5mX1P"
  );
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
