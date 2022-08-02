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
    process.env.TESTNET_MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const elements = ["0x456d569592f15af845d0dbe984c12bab8f430e31"];
  const tree = new MerkleTree(elements);

  const root = tree.getHexRoot();

  console.log(root);
  console.log(tree.getHexProof("0x456d569592f15af845d0dbe984c12bab8f430e31"));

  const result = await contract.setMerchType(
    0,
    ethers.utils.parseEther("0.1"),
    3,
    450,
    50,
    root,
    "ipfs://Qmc75Sbtw9CpQ6ngyXe8Uzoc4gBn66hH58B8i2dVGUiERg",
    "ipfs://Qmc75Sbtw9CpQ6ngyXe8Uzoc4gBn66hH58B8i2dVGUiERg"
  );
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
