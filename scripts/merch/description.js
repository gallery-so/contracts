async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMerch",
    process.env.MERCH_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.description();
  console.log("Description: ", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
