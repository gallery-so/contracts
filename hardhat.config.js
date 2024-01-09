require("dotenv").config()
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-truffle5")
require("hardhat-gas-reporter")

const {
  API_URL,
  PRIVATE_KEY,
  PUBLIC_KEY,
  TEST_URL,
  TEST_PRIVATE_KEY,
  TEST_PUBLIC_KEY,
  GAS_PRICE,
} = process.env

module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 300,
      },
    },
  },
  networks: {
    hardhat: {
      from: PUBLIC_KEY,
    },
    main: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      from: PUBLIC_KEY,
      // must be number type; .env gets read as string
      gasPrice: Number(GAS_PRICE) ? Number(GAS_PRICE) : 50000000000,
    },
    test: {
      url: TEST_URL,
      accounts: [`0x${TEST_PRIVATE_KEY}`],
      from: TEST_PUBLIC_KEY,
    },

    "base-mainnet": {
      url: "https://mainnet.base.org",
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: Number(GAS_PRICE) ? Number(GAS_PRICE) : 10000000000,
    },

    "base-goerli": {
      url: "https://goerli.base.org",
      accounts: [`0x${TEST_PRIVATE_KEY}`],
      from: TEST_PUBLIC_KEY,
      gasPrice: 1000000000,
    },
    "arb-mainnet": {
      url: "https://arb-mainnet.g.alchemy.com/v2/QNCdLbpuPIlw5waMnJos4eCwhrlMycDX",
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 200000000,
    },
  },
}
