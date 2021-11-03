require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

let accounts = [];

if (process.env.PRIVATE_KEY) {
  accounts = [`0x${process.env.PRIVATE_KEY}`, ...accounts];
}

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999,
      },
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC || "https://main-light.eth.linkpool.io",
      chainId: 1,
      accounts,
    },
    goerli: {
      url:
        process.env.GOERLI_RPC ||
        "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      accounts,
    },
    polygon: {
      url:
        process.env.POLYGON_RPC ||
        "https://polygon-mainnet.infura.io/v3/aa079d178e3c44bb8dd492c3f99bee77",
      chainId: 137,
      accounts,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
