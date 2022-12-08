async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.isRedeemed(87);
  console.log("Redeemed: ", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
