async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementosMultiMinter",
    process.env.BASE_MEMENTOS_MULTI_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.getMaxSupply(0)
  console.log("Max: ", result.toNumber())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
