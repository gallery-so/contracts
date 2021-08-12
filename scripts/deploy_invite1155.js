const { ethers, upgrades } = require("hardhat")

async function main() {
  const Contract = await ethers.getContractFactory("Invite1155")
  console.log("Deploying Contract...")
  const contract = await upgrades.deployProxy(
    Contract,
    ["https://api.gallery.so/glry/v1/metadata"],
    {
      initializer: "initialize",
    }
  )
  await contract.deployed()
  console.log("Contract deployed to:", contract.address)
}

main()
