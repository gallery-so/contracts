const { BigNumber } = require("@ethersproject/bignumber")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementosMultiMinter",
    process.env.BASE_MEMENTOS_MULTI_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  let minter = "0x9a3f9764B21adAF3C6fDf6f947e6D3340a3F8AC5"

  // const elements = ["0x456d569592f15af845d0dbe984c12bab8f430e31"];
  // const tree = new MerkleTree(elements);

  // const proof = tree.getHexProof(minter);
  // console.log(proof);
  const proof = []
  const result = await contract.mint(4, minter, proof)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
