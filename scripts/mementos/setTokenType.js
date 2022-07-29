const { MerkleTree } = require("../helpers/merkleTree");

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  // const elements = ["0x456d569592f15af845d0dbe984c12bab8f430e31"];
  // const tree = new MerkleTree(elements);

  // const root = tree.getHexRoot();

  const result = await contract.setTokenType(
    0,
    0,
    0,
    0,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
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
