const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require("../scripts/helpers/merkleTree.js")

describe("General", function () {
  let General
  let general
  let tree
  let proof
  let incorrectProof
  beforeEach(async function () {
    const [signer1, signer2] = await ethers.getSigners()
    General = await ethers.getContractFactory("GeneralCards")
    general = await General.deploy("asdasd", "AS")

    const elements = [signer1.address, signer2.address]
    tree = new MerkleTree(elements)

    proof = tree.getHexProof(signer1.address)
    incorrectProof = tree.getHexProof(signer2.address)

    general.createType(0, 0, 100, "URI 0")
    general.createType(1, 0, 1, "URI 1")
    general.createType(
      2,
      ethers.BigNumber.from("100000000000000000"),
      100,
      "URI 2"
    )

    general.setMintApprovals(0, tree.getHexRoot())
    general.setMintApprovals(1, tree.getHexRoot())
    general.setMintApprovals(2, tree.getHexRoot())

    general.setCanMint(true)
  })

  it("Should mint a token", async function () {
    const [john] = await ethers.getSigners()
    const resultMint = await general.connect(john).mint(john.address, 0, proof)
    await resultMint.wait()
    expect(await general.balanceOf(john.address, 0)).to.equal(1)
  })

  it("Fails to mint because wrong merkle proof", async function () {
    const [john] = await ethers.getSigners()

    await expect(
      general.connect(john).mint(john.address, 0, incorrectProof)
    ).to.be.revertedWith("General: not approved to mint")
  })

  it("Fails to mint 2 general cards of the same type to the same address", async function () {
    const signers = await ethers.getSigners()

    const resultMint = await general
      .connect(signers[0])
      .mint(signers[0].address, 0, proof)
    await resultMint.wait()

    let addrs = [signers[0].address, signers[0].address]
    await expect(general.mintToMany(addrs, 0)).to.be.revertedWith(
      "General: cannot own more than one of a General Card"
    )
  })
  it("Fails to mint 2 general cards because total supply is 1", async function () {
    const signers = await ethers.getSigners()

    let addrs = [signers[0].address, signers[1].address]
    await expect(general.mintToMany(addrs, 1)).to.be.revertedWith(
      "General: total supply used up"
    )
  })
  it("Fails to mint because was sent general card", async function () {
    const signers = await ethers.getSigners()

    let addrs = [signers[0].address, signers[1].address]
    await general.mintToMany(addrs, 0)
    await general
      .connect(signers[0])
      .safeTransferFrom(
        signers[0].address,
        signers[2].address,
        0,
        1,
        ethers.utils.toUtf8Bytes("")
      )
    await expect(
      general.mintToMany([signers[2].address], 0)
    ).to.be.revertedWith("General: cannot own more than one of a General Card")
  })
  it("Fails to withdraw because no balance", async function () {
    const [signer] = await ethers.getSigners()
    await expect(general.withdraw(100, signer.address)).to.be.revertedWith(
      "General: not enough balance"
    )
  })
  it("Fails to setCanMint because not owner", async function () {
    const [_, next] = await ethers.getSigners()
    await expect(general.connect(next).setCanMint(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    )
  })
  it("Fails to setMintApproval because not owner", async function () {
    const [_, next] = await ethers.getSigners()
    await expect(
      general.connect(next).setMintApprovals(0, tree.getHexRoot())
    ).to.be.revertedWith("Ownable: caller is not the owner")
  })
  it("Fails to mintToMany because not owner", async function () {
    const [signer, next] = await ethers.getSigners()
    await expect(
      general.connect(next).mintToMany([signer.address], 0)
    ).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("Approved address fails to mint token by sending price to non-priced token", async function () {
    const [signer] = await ethers.getSigners()

    await expect(
      general.mint(signer.address, 0, proof, {
        from: signer.address,
        value: ethers.utils.parseEther("0.1"),
      })
    ).to.be.revertedWith("General: sent value for non-payable token ID")
  })

  describe("Priced Token", async function () {
    it("Mints 1 token ID with price of .1 ETH", async function () {
      const [signer] = await ethers.getSigners()

      const resultMint = await general
        .connect(signer)
        .mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.1"),
        })
      await resultMint.wait()
      expect(await general.balanceOf(signer.address, 2)).to.equal(1)
    })

    it("Mints 1 token ID with price of .1 ETH but sends extra ETH", async function () {
      const [signer] = await ethers.getSigners()

      const resultMint = await general
        .connect(signer)
        .mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.2"),
        })
      await resultMint.wait()
      const amount = await general.balanceOf(signer.address, 2)
      expect(amount).to.equal(1)
    })

    it("Fails to mint 1 token ID with incorrect price", async function () {
      const [signer] = await ethers.getSigners()

      await expect(
        general.mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.01"),
        })
      ).to.be.revertedWith("General: incorrect price or not approved")
    })
    it("Fails to mint 1 token ID with correct price but minting disabled", async function () {
      const [signer] = await ethers.getSigners()
      await general.setCanMint(false)

      await expect(
        general.mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.1"),
        })
      ).to.be.revertedWith("General: minting is disabled")
    })
    it("Fails to mint one token with no price set", async function () {
      const [signer] = await ethers.getSigners()

      await expect(
        general.mint(signer.address, 2, incorrectProof)
      ).to.be.revertedWith("General: incorrect price or not approved")
    })

    it("Bypasses price by being whitelisted", async function () {
      const [signer] = await ethers.getSigners()

      const resultMint = await general
        .connect(signer)
        .mint(signer.address, 2, proof)
      await resultMint.wait()
      expect(await general.balanceOf(signer.address, 2)).to.equal(1)
    })
    it("Successfully withdraws ETH from purchased tokens", async function () {
      const [signer, taker] = await ethers.getSigners()
      const curBal = await ethers.provider.getBalance(taker.address)

      const resultMint = await general
        .connect(signer)
        .mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.1"),
        })
      await resultMint.wait()
      const amount = await general.balanceOf(signer.address, 2)
      expect(amount).to.equal(1)
      await general.withdraw(0, taker.address)
      const newBal = await ethers.provider.getBalance(taker.address)
      expect(newBal.sub(curBal).gte(ethers.utils.parseEther("0.1"))).to.be.true
    })
    it("Unsuccessfully withdraws ETH from purchased tokens because not owner", async function () {
      const [signer, taker] = await ethers.getSigners()

      const resultMint = await general
        .connect(signer)
        .mint(signer.address, 2, incorrectProof, {
          value: ethers.utils.parseEther("0.1"),
        })
      await resultMint.wait()
      const amount = await general.balanceOf(signer.address, 2)
      expect(amount).to.equal(1)
      await expect(
        general.connect(taker).withdraw(0, taker.address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })
})
