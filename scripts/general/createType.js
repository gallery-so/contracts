const { BigNumber } = require("@ethersproject/bignumber")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const result = await contract.createType(0, 0, 500, "test uri")
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
