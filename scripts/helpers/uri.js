async function main() {
  const contract = await ethers.getContractAt(
    "ERC721A",
    process.env.HELPER_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.tokenURI("380786771184713729")
  console.log(result)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
