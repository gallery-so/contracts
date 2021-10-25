async function main() {
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.TESTNET_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const result = await contract.setPrice(
    6,
    ethers.BigNumber.from("200000000000000000")
  )
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
