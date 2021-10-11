async function main() {
  const Contract = await ethers.getContractFactory("Invite1155")
  const contract = await Contract.deploy(
    `ipfs://QmWQvHZL47DnN34AcK3ppXH1sdXAQhudevy1xk5cmTYAYW/`,
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
