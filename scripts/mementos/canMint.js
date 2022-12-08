async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.TESTNET_MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.canMint();
  console.log("Can Mint: ", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
