const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const elements = []
  const tree = new MerkleTree(elements)

  const root = tree.getHexRoot()

  const result = await contract.createType(
    0,
    0,
    10000,
    root,
    "ipfs://QmVrnp71dStgCiradDrsGDj4oV2bMcyQwCQoPvkbe4au31"
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
