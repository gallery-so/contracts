async function main() {
  const mintTo = [
    "0x456d569592f15Af845D0dbe984C12BAB8F430e31",
    "0x9a3f9764B21adAF3C6fDf6f947e6D3340a3F8AC5",
    "0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15",
  ]
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.mintToMany(mintTo, 8)
  console.log("Tx Hash", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
