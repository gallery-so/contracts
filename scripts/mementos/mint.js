const { BigNumber } = require("@ethersproject/bignumber");
const { MerkleTree } = require("../helpers/merkleTree");

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.TESTNET_MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  let minter = "0x456d569592f15af845d0dbe984c12bab8f430e31";

  // const elements = ["0x456d569592f15af845d0dbe984c12bab8f430e31"];
  // const tree = new MerkleTree(elements);

  // const proof = tree.getHexProof(minter);
  // console.log(proof);
  const proof = [];
  const result = await contract.mint(0, minter, proof);
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
