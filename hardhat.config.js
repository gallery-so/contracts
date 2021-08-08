require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@openzeppelin/hardhat-upgrades")
const { API_URL, PRIVATE_KEY, PUBLIC_KEY } = process.env
module.exports = {
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "ropsten",
  networks: {
    hardhat: {
      from: PUBLIC_KEY,
    },
    ropsten: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      from: PUBLIC_KEY,
    },
  },
}
