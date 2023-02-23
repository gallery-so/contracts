async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.uri(2)
  console.log(result)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
