async function main() {
  let mintTo = []

  console.log(`minting to ${mintTo.length} addresses`)
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.PREMIUM_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.mintToMany(mintTo, 5)
  // console.log(result.toNumber())
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}
