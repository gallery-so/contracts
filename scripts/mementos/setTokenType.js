const { ethers } = require("hardhat")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementosMultiMinter",
    process.env.BASE_MEMENTOS_MULTI_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  // const elements = []

  // const tree = new MerkleTree(elements)

  // const root = tree.getHexRoot()
  // console.log(root)

  const result = await contract.setTokenType(
    0,
    ethers.utils.parseEther("0.000777"),
    1000000000,
    0,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "ipfs://QmVKfCRT2jVfX9HTbNWXJFRwne7mDctdmJsHifgM4pzLSH"
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
