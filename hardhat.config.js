require("dotenv").config()
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
const { API_URL, PRIVATE_KEY, PUBLIC_KEY, COIN_MARKET_CAP } = process.env
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
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
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 100,
    coinmarketcap: COIN_MARKET_CAP,
  },
}
