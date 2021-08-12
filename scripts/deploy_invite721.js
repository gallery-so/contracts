const { ethers, upgrades } = require("hardhat")

async function main() {
  const Contract = await ethers.getContractFactory("Invite721")
  console.log("Deploying Contract...")
  const contract = await upgrades.deployProxy(
    Contract,
    ["Invite", "GINV", "https://api.gallery.so/glry/v1/metadata"],
    {
      initializer: "initialize",
    }
  )
  await contract.deployed()
  console.log("Contract deployed to:", contract.address)
}

main()
