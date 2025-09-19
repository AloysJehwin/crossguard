require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "somnia-testnet": {
      url: "https://dream-rpc.somnia.network/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 50312, // Somnia testnet chain ID
      gasPrice: 50000000000, // 50 gwei - increased for Somnia
    },
    hardhat: {
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      "somnia-testnet": "dummy-api-key" // Update when Somnia explorer API is available
    },
    customChains: [
      {
        network: "somnia-testnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network"
        }
      }
    ]
  }
};