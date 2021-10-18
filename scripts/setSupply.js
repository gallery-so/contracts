async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  let result = await contract.setTotalSupply(0, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(1, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(2, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(3, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(4, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(5, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(6, 100)
  console.log("Tx: ", result.hash)
  result = await contract.setTotalSupply(7, 100)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
