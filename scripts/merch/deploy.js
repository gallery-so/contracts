async function main() {
  const Contract = await ethers.getContractFactory("GalleryMerch");
  const contract = await Contract.deploy();
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
