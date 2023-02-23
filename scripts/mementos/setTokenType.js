const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const elements = []

  const tree = new MerkleTree(elements)

  const root = tree.getHexRoot()

  const result = await contract.setTokenType(
    2,
    0,
    0,
    0,
    root,
    "ipfs://QmR1348ThxmcgvkBuVsnZzLVXmMPg3SdZdhyq2B4wwjjv7"
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
