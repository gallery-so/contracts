async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.setCanMint(false);
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
