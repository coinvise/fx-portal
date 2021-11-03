require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");

async function main() {
  let fxChild, erc20Token;

  const network = await hre.ethers.provider.getNetwork();

  if (network.chainId === 137) {
    // Polygon Mainnet
    fxChild = config.mainnet.fxChild.address;
    erc20Token = config.mainnet.fxERC20.address;
  } else if (network.chainId === 80001) {
    // Mumbai Testnet
    fxChild = config.testnet.fxChild.address;
    erc20Token = config.testnet.fxERC20.address;
  } else {
    fxChild = process.env.FX_CHILD;
    erc20Token = process.env.FX_ERC20;
  }

  const args = [fxChild, erc20Token];

  const ERC20 = await hre.ethers.getContractFactory("FxERC20ChildTunnel");
  const erc20 = await ERC20.deploy(...args);
  await erc20.deployTransaction.wait(5);
  console.log("ERC20ChildTunnel deployed to:", erc20.address);

  // Verify contract
  await hre.run("verify:verify", {
    address: erc20.address,
    constructorArguments: args,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
