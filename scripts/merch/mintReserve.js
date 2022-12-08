const shirts = [];
const hats = [];
const cards = [
  "0x1bc2F1C19f1dEab303Aab3927a4937f12F523A72",
  "saradu.eth",
  "patrickxrivera.eth",
  "meral.eth",
];
const redeemed = true;

async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );

  const to = shirts.concat(hats).concat(cards);
  const merchTypes = shirts
    .map(() => 0)
    .concat(hats.map(() => 1))
    .concat(cards.map(() => 2));
  const amounts = Array(to.length).fill(1);

  const result = await contract.mintReserve(to, merchTypes, amounts, redeemed);
  console.log("Tx: ", result.hash);
  // console.log(result.toNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
