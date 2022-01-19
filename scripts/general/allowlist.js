const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const elements = [
    /* whitelisted addresses */
  ]
  const tree = new MerkleTree(elements)

  const root = tree.getHexRoot()
  const result = await contract.setMintApprovals(0, root)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
