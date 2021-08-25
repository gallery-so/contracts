const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Invites", function () {
  describe("Invite1155", function () {
    let Invite
    let invite
    before(async function () {
      Invite = await ethers.getContractFactory("Invite1155")
      invite = await Invite.deploy("asdasda")
    })
    it("Creates a type and then mints 3 NFTs", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners()
      const { wait } = await invite.create(true)
      const { events } = await wait()
      const num = events[0].args[3]
      await invite.mintNonFungible(num, [
        owner.address,
        addr1.address,
        addr2.address,
      ])
      const amount = await invite.balanceOf(
        owner.address,
        ethers.BigNumber.from(num).add(1)
      )
      expect(amount).to.equal(1)
    })
  })
})

describe("Invite721", function () {
  let Invite
  let invite
  before(async function () {
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
})
