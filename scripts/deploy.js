async function main() {
  const Contract = await ethers.getContractFactory("Invite1155")
  const contract = await Contract.deploy(
    `ipfs://QmQzZPmcgjm7TQvqMJzxykhamHTLwd5K5WBriVDq94byFa/`,
    "Gallery Membership Cards",
    "GMC"
  )
  console.log("Contract deployed to address:", contract.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
