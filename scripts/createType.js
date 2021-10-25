async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.createType(
    8,
    "ipfs://QmTZGPjyzSd9gUr6qR2vpHcn319smbBJKvcu6QVCpgJUz8",
    0,
    150
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
