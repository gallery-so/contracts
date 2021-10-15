async function main() {
  const Contract = await ethers.getContractFactory("Invite1155")
  const contract = await Contract.deploy(
    `ipfs://QmQFzJPZMFU6SPYLhSL4HSnjEc7FCocaf5tW2GtZAv2Hy2/`,
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
