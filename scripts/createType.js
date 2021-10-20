async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.createType(
    8,
    "ipfs://Qmeihcf7sCbS5C4bbyHxuE8CUNdM8ouFYHbk8M7zdTPUsA",
    0,
    100
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
