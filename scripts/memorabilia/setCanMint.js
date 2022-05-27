async function main() {
  const contract = await ethers.getContractAt(
    "GalleryMemorabilia",
    process.env.TESTNET_MEMORABILIA_CONTRACT_ADDRESS,
    await ethers.getSigner()
  );
  const result = await contract.setCanMint(true);
  console.log("Tx: ", result.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
