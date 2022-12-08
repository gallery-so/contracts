const { MerkleTree } = require("../helpers/merkleTree");

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const elements = ["0x456d569592f15af845d0dbe984c12bab8f430e32"];
  const tree = new MerkleTree(elements);

  const proof = tree.getHexProof("0x456d569592f15af845d0dbe984c12bab8f430e32");

  const result = await contract.mint(
    "0x456d569592f15af845d0dbe984c12bab8f430e31",
    0,
    1,
    proof,
    { value: ethers.utils.parseEther("0.1") }
  );
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
