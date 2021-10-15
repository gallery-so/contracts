async function main() {
  const whitelist = [
    "0x456d569592f15Af845D0dbe984C12BAB8F430e31",
    "0x9a3f9764B21adAF3C6fDf6f947e6D3340a3F8AC5",
    "0xcb1b78568d0Ef81585f074b0Dfd6B743959070D9",
    "0x70D04384b5c3a466EC4D8CFB8213Efc31C6a9D15",
    "0x27B0f73721DA882fAAe00B6e43512BD9eC74ECFA",
    "0xBb3F043290841B97b9C92F6Bc001a020D4B33255",
  ]
  const contract = await ethers.getContractAt(
    "Invite1155",
    process.env.CONTRACT_ADDRESS,
    await ethers.getSigner()
  )
  const result = await contract.setMintApprovals(
    whitelist,
    [true, true, true, true, true, true],
    1
  )
  console.log("Tx Hash", result.hash)

  result.wait()

  const approved = await contract.getMintApproval(
    "0x456d569592f15Af845D0dbe984C12BAB8F430e31",
    1
  )
  console.log("Success:", approved == 1)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
