const { MerkleTree } = require("../helpers/merkleTree");

/*
        uint256 id,
        uint256 price,
        uint256 maxPerWallet,
        uint256 maxPublicSupply,
        uint256 maxReserveSupply,
        bytes32 allowListMerkleRoot,
        string calldata uri,
        string calldata redeemedURI
*/
async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const elements = [];
  const tree = new MerkleTree(elements);

  const root = tree.getHexRoot();

  console.log(root);

  const result = await contract.setMerchType(
    2,
    ethers.utils.parseEther("0.08"),
    3,
    450,
    50,
    root,
    // ethers.constants.HashZero,
    "ipfs://QmSPdA9Gg8xAdVxWvUyGkdFKQ8YMVYnGjYcr3cGMcBH1ae",
    "ipfs://QmSPdA9Gg8xAdVxWvUyGkdFKQ8YMVYnGjYcr3cGMcBH1ae"
  );
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
