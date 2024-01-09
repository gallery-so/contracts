async function main() {
  const contract = await ethers.getContractAt(
    "Series",
    process.env.SERIES_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  let minter = "0x9a3f9764B21adAF3C6fDf6f947e6D3340a3F8AC5"

  const result = await contract.mint(
    minter,
    4,
    "ipfs://QmebHLGavJvupB4vsxkDmqeGLTdHZUbqWXXWykjjpJCmVm"
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
