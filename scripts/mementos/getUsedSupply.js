async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMementos",
    process.env.TESTNET_MEMENTOS_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.getUsedSupply(0);
  console.log("Used: ", result.toNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
