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

  const elements = [
    "0x90d93d25db5c0be4ca49c6bd54d0ba91bde5573a",
    "0x6c96da184a426d381e2fcc3bf22f50dd079340c0",
    "0xe3e5549daa5ea2c1d451f352c63b13cb3920366f",
  ];
  const tree = new MerkleTree(elements);

  const root = tree.getHexRoot();

  console.log(root);

  const result = await contract.setMerchType(
    2,
    0,
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
