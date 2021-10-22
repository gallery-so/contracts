async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.createType(
    4,
    "ipfs://Qmcz935fqEUd9XJCWEqckGsqTZQGJ6KrcRUyxPUhRWbhjz",
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
