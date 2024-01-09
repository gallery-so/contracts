async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.PREMIUM_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.getTotalSupply(4)
  console.log(result.toNumber())
  const used = await contract.getUsedSupply(4)
  console.log(used.toNumber())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
