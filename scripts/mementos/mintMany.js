async function main() {
  let mintTo = ["groovi.eth"]

  console.log(`minting to ${mintTo.length} addresses`)
  const contract = await ethers.getContractAt(
    "GalleryMementosMultiMinter",
    process.env.BASE_MEMENTOS_MULTI_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.mintToMany(2, mintTo)
  // console.log(result.toNumber())
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
