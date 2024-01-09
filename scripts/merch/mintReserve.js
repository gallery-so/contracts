const shirts = ["fraserstanley.eth", "mikevp.eth"]
const hats = ["fraserstanley.eth", "l444u.eth"]
const cards = ["fraserstanley.eth", "l444u.eth"]
const redeemed = true

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  const to = shirts.concat(hats).concat(cards)
  const merchTypes = shirts
    .map(() => 0)
    .concat(hats.map(() => 1))
    .concat(cards.map(() => 2))
  const amounts = Array(to.length).fill(1)

  const result = await contract.mintReserve(to, merchTypes, amounts, redeemed)
  console.log("Tx: ", result.hash)
  // console.log(result.toNumber())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
