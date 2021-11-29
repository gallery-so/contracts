async function main() {
  let mintTo = ["0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15"]

  // mintTo = mintTo.filter(onlyUnique)

  // let uniqueAddresses = {}
  // for (let i = 0; i < mintTo.length; i++) {
  //   if (uniqueAddresses[mintTo[i]]) {
  //     mintTo.splice(i, 1)
  //     console.log(`${mintTo[i]} already exists`)
  //   }
  //   if (mintTo[i].includes(".eth")) {
  //     const address = await ethers.getDefaultProvider().resolveName(mintTo[i])
  //     console.log(`${mintTo[i]} resolved to ${address}`)
  //     uniqueAddresses[address.toLowerCase()] = true
  //   } else {
  //     uniqueAddresses[mintTo[i].toLowerCase()] = true
  //   }
  // }
  console.log(`minting to ${mintTo.length} addresses`)
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.TESTNET_CONTRACT_ADDRESS,
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
