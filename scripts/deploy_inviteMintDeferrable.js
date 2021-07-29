// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat")

async function main() {
  const Contract = await ethers.getContractFactory("InvitemintDeferrable")
  console.log("Deploying Contract...")
  const contract = await upgrades.deployProxy(
    Contract,
    ["InviteMintDeferrable"],
    {
      initializer: "initialize",
    }
  )
  await contract.deployed()
  console.log("Contract deployed to:", contract.address)
}

main()
