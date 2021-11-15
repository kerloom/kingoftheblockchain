var KingOfTheBlockchain = artifacts.require('KingOfTheBlockchain');

module.exports = function (deployer) {
  deployer.deploy(
    KingOfTheBlockchain
  );
};
