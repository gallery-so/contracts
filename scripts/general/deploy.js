async function main() {
  const Contract = await ethers.getContractFactory("GeneralCards")
  const contract = await Contract.deploy(
    "Gallery General Membership Cards",
    "GGMC",
    "0x8914496dC01Efcc49a2FA340331Fb90969B6F1d2"
  )
  console.log("Contract deployed to address:", contract.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
