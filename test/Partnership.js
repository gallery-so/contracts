const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require("./helpers/merkleTree.js")

describe("Partnership", function () {
  let Partnership
  let partnership
  let TestNFT
  let testNFT
  let testNFT2
  let merkleProof
  let tree
  beforeEach(async function () {
    Partnership = await ethers.getContractFactory("PartnershipCards")
    partnership = await Partnership.deploy("asdasd", "AS")
    TestNFT = await ethers.getContractFactory("TestNFT")
    testNFT = await TestNFT.deploy("TestNFT", "TST")
    testNFT2 = await TestNFT.deploy("TestNFT2", "TST2")

    const abi1 = web3.eth.abi.encodeParameters(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [testNFT.address, 0, 0, 1, 0]
    )

    const abi2 = web3.eth.abi.encodeParameters(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [testNFT2.address, 0, 5, 0, 1]
    )

    const elements = [abi1, abi2]
    tree = new MerkleTree(elements)

    const root = tree.getHexRoot()
    merkleProof = tree.getHexProof(elements[0])

    partnership.createType(0, 0, 100, root, "URI 0")

    partnership.setCanMint(true)
  })

  it("ensures root is correct", async function () {
    const root = await partnership.getMerkleRoot(0)
    expect(root).to.equal(tree.getHexRoot())
  })

  it("should mint a token", async function () {
    const [john] = await ethers.getSigners()
    const resultTestMint = await testNFT.mint(john.address, 0)
    await resultTestMint.wait()
    const encoded = web3.eth.abi.encodeParameters(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [testNFT.address, 0, 0, 1, 0]
    )

    const resultMint = await partnership
      .connect(john)
      .mint(john.address, 0, 0, encoded, merkleProof)
    await resultMint.wait()
    expect(await partnership.balanceOf(john.address, 0)).to.equal(1)
  })
})
