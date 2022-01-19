const { BigNumber } = require("@ethersproject/bignumber")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const elements = [
    "0x4Dd958cA0455BFb231770cD06898894b4c974671",
    "0x75634249C19b12eb98b933C9381876ef723Cf90A",
    "0x8A736ad88E54CEb59e67d07a8498ED08e5586FcF",
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
