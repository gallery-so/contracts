require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
const {
  API_URL,
  PRIVATE_KEY,
  PUBLIC_KEY,
  COIN_MARKET_CAP,
  TEST_URL,
  TEST_PRIVATE_KEY,
  TEST_PUBLIC_KEY,
  GAS_PRICE,
} = process.env;
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
      gasPrice: GAS_PRICE ?? 50000000000,
    },
    test: {
      url: TEST_URL,
      accounts: [`0x${TEST_PRIVATE_KEY}`],
      from: TEST_PUBLIC_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 100,
    coinmarketcap: COIN_MARKET_CAP,
  },
};
