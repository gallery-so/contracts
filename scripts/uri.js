async function main() {
  const contract = await ethers.getContractAt(
    "IERC1155MetadataURI",
    "0x495f947276749Ce646f68AC8c248420045cb7b5e",
    await ethers.getSigner()
  )
  const result = await contract.uri(
    "0x7E59DDE2EE81595574DDD55C98300B81467A3618000000000000480000000001"
  )
  console.log(result)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
