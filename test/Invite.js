const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Invites", function () {
  describe("Invite1155", function () {
    let Invite
    let invite
    beforeEach(async function () {
      Invite = await ethers.getContractFactory("Invite1155")
      invite = await Invite.deploy("asdasda")
    })
    it("Creates a type and then mints 500 NFTs", async function () {
      const signers = await ethers.getSigners()
      const { wait } = await invite.create(true)
      const { events } = await wait()
      const num = events[0].args[3]
      let addrs = []
      for (let i = 0; i < 500; i++) {
        addrs.push(signers[i % 20].address)
      }
      await invite.mintNonFungible(num, addrs)
      const amount = await invite.balanceOf(
        signers[0].address,
        ethers.BigNumber.from(num).add(1)
      )
      expect(amount).to.equal(1)
    })
    it("Creates a type and then mints 500 SFTs", async function () {
      const signers = await ethers.getSigners()
      const { wait } = await invite.create(false)
      const { events } = await wait()
      const num = events[0].args[3]
      let addrs = []
      let amounts = []
      for (let i = 0; i < 500; i++) {
        addrs.push(signers[i % 20].address)
        amounts.push(i)
      }
      await invite.mintFungible(num, addrs, amounts)
      const amount = await invite.balanceOf(signers[0].address, num)
      expect(amount).to.equal(6000)
    })
  })
})

describe("Invite721", function () {
  let Invite
  let invite
  beforeEach(async function () {
    Invite = await ethers.getContractFactory("Invite721")
    invite = await Invite.deploy("asdasda", "asdasd", "dasd")
  })

  it("Mints a single NFT", async function () {
    const [owner] = await ethers.getSigners()
    await invite.mint(owner.address, 1)
    const addr = await invite.ownerOf(1)
    console.log(addr)
    expect(addr).to.equal(owner.address)
  })

  it("Mints many NFTS", async function () {
    const signers = await ethers.getSigners()
    let addrs = []
    let ids = []
    for (let i = 0; i < 500; i++) {
      addrs.push(signers[i % 20].address)
      ids.push(i)
    }
    await invite.mintBatch(addrs, ids)
  })
})
