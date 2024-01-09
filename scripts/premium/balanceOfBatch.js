async function main() {
  const addresses = []
  const ids = []
  for (let i = 0; i < addresses.length; i++) {
    ids.push(8)
  }
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.PREMIUM_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.balanceOfBatch(addresses, ids)
  let totalHave = 0
  for (let i = 0; i < result.length; i++) {
    if (result[i].toString() !== "0") {
      totalHave++
    }
  }
  console.log(totalHave)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
