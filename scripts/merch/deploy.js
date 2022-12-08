async function main() {
  const Contract = await ethers.getContractFactory("GalleryMerch");
  const contract = await Contract.deploy(
    "Gallery presents its first merch collection: “(OBJECTS)”\n\nThis is a collection of objects inspired by Gallery’s simple and refined design language.\n\nEach object exists in digital and physical form, enabling owners to express their membership in the Gallery community anywhere.\n\nEach NFT can be used to claim its physical counterpart during the redemption period, once per token. If you are purchasing a token on the secondary market with the intent of redeeming a physical object, be sure to double check that token’s metadata and confirm that it has not been redeemed yet."
  );
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
