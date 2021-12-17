const { BigNumber } = require("@ethersproject/bignumber")
const { MerkleTree } = require("../helpers/merkleTree")

async function main() {
  const contract = await ethers.getContractAt(
    "GeneralCards",
    process.env.TESTNET_GENERAL_CONTRACT_ADDRESS,
    await ethers.getSigner()
  )

  /*

    This ABI encoded data is a whitelist type that should already be stored in the merkle tree that
    the merkle root of the token ID being minted is pointing to.

    Parameters encoded as:
    1. Whitelisted Contract Address
    2. Whitelisted beginning token IDs (start of acceptable token ID range)
    3. Whitelisted ending token IDs (end of acceptable token ID range)
    4. Whitelisted required amount of tokens
    5. Whitelist type
    
    Whitelist type:
    0 - Check to ensure that the calling address has enough tokens of any token ID for the whitelisted amount
    with an ERC-721 contract address. This check disregards token ID ranges.
    1 - Check to ensure that the calling address is the owner of a specific token ID that is whithin the token ID range
    for an ERC-721 contract address. This check disregards the whitelisted amount.
    2 - Check to ensure that the calling address has enough of a specific token ID that is whithin the token ID range
    for the whitelisted amount for an ERC-1155 contract address.
    3 - Check to ensure that the calling address has enough of an ERC-20 token for the whitelisted amount.
    This check disregards the token ID range and specified token ID.
    4 - Will transfer the specified ERC-721 token that's ID is within the whitelisted range from the calling address 
    to the receiving address that is predefined in the contract. This check disregards the whitelisted amount.
    5 - Will transfer the whitelisted amount of the specified ERC-1155 token(s) that's ID is within the whitelisted range 
    from the calling address to the receiving address that is predefined in the contract.
    6 - Will transfer the whitelisted amount of the specified ERC-20 token from the calling address 
    to the receiving address that is predefined in the contract.
  */
  const abi = web3.eth.abi.encodeParameters(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [process.env.TEST_CONTRACT_ADDRESS, 0, 0, 1, 0]
  )

  console.log(abi)

  const abi2 = web3.eth.abi.encodeParameters(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [process.env.TEST_CONTRACT_ADDRESS, 0, 10, 1, 1]
  )

  console.log(abi2)

  const elements = [abi, abi2]
  const tree = new MerkleTree(elements)

  const proof = tree.getHexProof(abi)
  console.log(proof)
  const result = await contract.mint(signer.address, 0, 0, abi, proof)
  console.log("Tx: ", result.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
