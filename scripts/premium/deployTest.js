async function main() {
  const Contract = await ethers.getContractFactory("TestNFT")
  const contract = await Contract.deploy("TestNFT", "TNFT")
  console.log("Contract deployed to address:", contract.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
