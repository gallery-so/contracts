async function main() {
  const whitelist = []
  const whitelistValues = whitelist.map(() => true)
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.PREMIUM_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.setMintApprovals(whitelist, whitelistValues, 5)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
