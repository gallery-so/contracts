async function main() {
  const mintTo = []
  const contract = await ethers.getContractAt(
    "TestNFT",
    process.env.TEST_PREMIUM_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  let i = 0
  for (const to of mintTo) {
    const tx = await contract.mint(to, i)
    console.log("Tx: ", tx.hash)
    i++
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
