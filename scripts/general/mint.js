const { BigNumber } = require("@ethersproject/bignumber")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  let minter = ""

  const elements = [
    /* addresses that are whitelisted */
  ]
  const tree = new MerkleTree(elements)

  const proof = tree.getHexProof(minter)
  console.log(proof)
  const result = await contract.mint(minter, 0, proof)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
