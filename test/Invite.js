const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Invites", function () {
  describe("Invite1155", function () {
    let Invite
    let invite
    beforeEach(async function () {
      Invite = await ethers.getContractFactory("Invite1155")
      invite = await Invite.deploy("asdasda", "asdasd", "AS")
    })

    it("Creates a type and then mints 500 SFTs", async function () {
      const signers = await ethers.getSigners()

      let addrs = []
      let amounts = []
      for (let i = 0; i < 500; i++) {
        addrs.push(signers[i % 20].address)
        amounts.push(i)
      }
      await invite.mintToMany(addrs, 1)
      const amount = await invite.balanceOf(signers[0].address, 1)
      expect(amount).to.equal(6000)
    })
  })
})
