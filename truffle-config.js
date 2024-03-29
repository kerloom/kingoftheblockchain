require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(process.env.WALLET_KEY, process.env.NODE_URI);
      },
      network_id: 3
    },
    bsc: {
      provider: function () {
        return new HDWalletProvider(process.env.WALLET_KEY,  'https://bsc-dataseed.binance.org');
      },
      network_id: 56
    },
    bsc_test: {
      provider: function () {
        return new HDWalletProvider(process.env.WALLET_KEY,  'https://data-seed-prebsc-1-s1.binance.org:8545');
      },
      network_id: 97
    },
    develop: {
      port: 8545
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.7",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
};
