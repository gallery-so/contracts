const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Invite1155", function () {
  let Invite
  let invite
  let TestNFT
  let testNFT
  beforeEach(async function () {
    Invite = await ethers.getContractFactory("Invite1155")
    invite = await Invite.deploy("asdasd", "AS")

    TestNFT = await ethers.getContractFactory("TestNFT")
    testNFT = await TestNFT.deploy("TestNFT", "TST")
    invite.createType(0, "URI 0", 0, 100)
    invite.createType(1, "URI 1", 0, 100)
    invite.createType(2, "URI 2", 0, 100)
    invite.createType(3, "URI 3", 0, 1)
    invite.createType(4, "URI 4", 0, 100)
    invite.createType(5, "URI 5", 0, 100)
    invite.createType(
      6,
      "URI 6",
      ethers.BigNumber.from("100000000000000000"),
      500
    )
    invite.createType(7, "URI 7", 0, 500)
    invite.setWhitelistCheck("ERC721", testNFT.address, 7)
    invite.createType(8, "URI 8", 0, 500)
    invite.setCanMint(true)
  })

  it("Mints 3 invites for token ID 0", async function () {
    const signers = await ethers.getSigners()
    let addrs = [signers[0].address, signers[1].address, signers[2].address]
    await invite.mintToMany(addrs, 0)
    const amount = await invite.balanceOf(signers[0].address, 0)
    expect(amount).to.equal(1)
  })

  it("Fails to mint 2 invites of the same type to the same address", async function () {
    const signers = await ethers.getSigners()

    let addrs = [signers[0].address, signers[0].address]
    await expect(invite.mintToMany(addrs, 0)).to.be.revertedWith(
      "Invite: cannot own more than one of an Invite"
    )
  })
  it("Fails to mint 2 invites because total supply is 1", async function () {
    const signers = await ethers.getSigners()

    let addrs = [signers[0].address, signers[1].address]
    await expect(invite.mintToMany(addrs, 3)).to.be.revertedWith(
      "Invite: total supply used up"
    )
  })
  it("Fails to mint because was sent invite", async function () {
    const signers = await ethers.getSigners()

    let addrs = [signers[0].address, signers[1].address]
    await invite.mintToMany(addrs, 0)
    await invite
      .connect(signers[0])
      .safeTransferFrom(
        signers[0].address,
        signers[2].address,
        0,
        1,
        ethers.utils.toUtf8Bytes("")
      )
    await expect(invite.mintToMany([signers[2].address], 0)).to.be.revertedWith(
      "Invite: cannot own more than one of an Invite"
    )
  })
  it("Fails to withdraw because no balance", async function () {
    const [signer] = await ethers.getSigners()
    await expect(invite.withdraw(100, signer.address)).to.be.revertedWith(
      "Invite: not enough balance"
    )
  })
  it("Fails to setCanMint because not owner", async function () {
    const [_, next] = await ethers.getSigners()
    await expect(invite.connect(next).setCanMint(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    )
  })
  it("Fails to setMintApproval because not owner", async function () {
    const [signer, next] = await ethers.getSigners()
    await expect(
      invite.connect(next).setMintApproval(signer.address, true, 0)
    ).to.be.revertedWith("Ownable: caller is not the owner")
  })
  it("Fails to mintToMany because not owner", async function () {
    const [signer, next] = await ethers.getSigners()
    await expect(
      invite.connect(next).mintToMany([signer.address], 0)
    ).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("Approved address fails to mint token by sending price to non-priced token", async function () {
    const [signer] = await ethers.getSigners()
    await invite.setMintApproval(signer.address, true, 0)
    await expect(
      invite.mint(signer.address, 0, {
        from: signer.address,
        value: ethers.utils.parseEther("0.1"),
      })
    ).to.be.revertedWith("Invite: sent value for non-payable token ID")
  })

  describe("Priced Token", async function () {
    it("Mints 1 token ID with price of .1 ETH", async function () {
      const [signer] = await ethers.getSigners()

      await invite.mint(signer.address, 6, {
        from: signer.address,
        value: ethers.utils.parseEther("0.1"),
      })
      const amount = await invite.balanceOf(signer.address, 6)
      expect(amount).to.equal(1)
    })

    it("Mints 1 token ID with price of .1 ETH but sends extra ETH", async function () {
      const [signer] = await ethers.getSigners()

      await invite.mint(signer.address, 6, {
        from: signer.address,
        value: ethers.utils.parseEther("0.2"),
      })
      const amount = await invite.balanceOf(signer.address, 6)
      expect(amount).to.equal(1)
    })

    it("Fails to mint 1 token ID with incorrect price", async function () {
      const [signer] = await ethers.getSigners()

      await expect(
        invite.mint(signer.address, 6, {
          from: signer.address,
          value: ethers.utils.parseEther("0.01"),
        })
      ).to.be.revertedWith(
        "Invite: not whitelisted and msg.value is not correct price"
      )
    })
    it("Fails to mint 1 token ID with correct price but minting disabled", async function () {
      const [signer] = await ethers.getSigners()
      await invite.setCanMint(false)
      await expect(
        invite.mint(signer.address, 6, {
          from: signer.address,
          value: ethers.utils.parseEther("0.1"),
        })
      ).to.be.revertedWith("Invite: minting is disabled")
    })
    it("Fails to mint one token with no price set", async function () {
      const [signer] = await ethers.getSigners()
      await expect(
        invite.mint(signer.address, 6, {
          from: signer.address,
        })
      ).to.be.revertedWith(
        "Invite: not whitelisted and msg.value is not correct price"
      )
    })

    it("Bypasses price by being whitelisted", async function () {
      const [signer] = await ethers.getSigners()

      await invite.setMintApproval(signer.address, true, 6)

      await invite.mint(signer.address, 6, {
        from: signer.address,
      })
      const amount = await invite.balanceOf(signer.address, 6)
      expect(amount).to.equal(1)
    })
    it("Successfully withdraws ETH from purchased tokens", async function () {
      const [signer, taker] = await ethers.getSigners()
      const curBal = await ethers.provider.getBalance(signer.address)
      await invite.mint(signer.address, 6, {
        from: signer.address,
        value: ethers.utils.parseEther("0.1"),
      })
      const amount = await invite.balanceOf(signer.address, 6)
      expect(amount).to.equal(1)
      await invite.withdraw(0, taker.address)
      const newBal = await ethers.provider.getBalance(taker.address)
      expect(newBal.sub(curBal).gte(ethers.utils.parseEther("0.1"))).to.be.true
    })
    it("Unsuccessfully withdraws ETH from purchased tokens because not owner", async function () {
      const [signer, taker] = await ethers.getSigners()
      await invite.mint(signer.address, 6, {
        from: signer.address,
        value: ethers.utils.parseEther("0.1"),
      })
      const amount = await invite.balanceOf(signer.address, 6)
      expect(amount).to.equal(1)
      await expect(
        invite.connect(taker).withdraw(0, taker.address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Token Whitelisted Token", async function () {
    it("Mints one token for address with whitelisted token", async function () {
      const [signer] = await ethers.getSigners()
      await testNFT.mint(signer.address, 0)

      await invite.mint(signer.address, 7, {
        from: signer.address,
      })
      const amount = await invite.balanceOf(signer.address, 7)
      expect(amount).to.equal(1)
    })

    it("Fails to mints one token for address without whitelisted token", async function () {
      const [signer] = await ethers.getSigners()
      await expect(
        invite.mint(signer.address, 7, {
          from: signer.address,
        })
      ).to.be.revertedWith("Invite: not approved to mint")
    })

    it("Bypasses token whitelist by being directly approved", async function () {
      const [signer] = await ethers.getSigners()
      invite.setMintApproval(signer.address, true, 7)
      await invite.mint(signer.address, 7, {
        from: signer.address,
      })
      const amount = await invite.balanceOf(signer.address, 7)
      expect(amount).to.equal(1)
    })
  })
})
