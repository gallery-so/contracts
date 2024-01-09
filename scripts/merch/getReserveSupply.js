async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.getReserveSupply(2)
  console.log("Redeemed: ", result.toNumber())

  const nextResult = await contract.getUsedReserveSupply(2)
  console.log("Used: ", nextResult.toNumber())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
