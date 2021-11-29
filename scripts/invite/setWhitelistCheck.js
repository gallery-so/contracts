async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.TESTNET_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.setWhitelistCheck(
    "ERC721",
    process.env.TEST_CONTRACT_ADDRESS,
    7
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
