async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.createType(
    3,
    "ipfs://QmQJTSwa69xkCDnVuM3P3NpVXyWu5ReArPTFzjkcfArttD",
    0,
    323
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
