const { MerkleTree } = require("../helpers/merkleTree");
const fs = require("fs");

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMemorabilia",
    process.env.TESTNET_MEMORABILIA_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const elements = JSON.parse(fs.readFileSync("snapshot.json"));

  console.log(`Len: ${elements.length}`);

  const tree = new MerkleTree(elements);

  const root = tree.getHexRoot();
  const result = await contract.setAllowlistRoot(0, root);
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
