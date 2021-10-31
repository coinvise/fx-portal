require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");

async function main() {
  let fxRoot, checkpointManager, fxERC20, fxERC20ChildTunnel;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(
    `Owner [${owner.address}] Balance:`,
    ethers.utils.formatEther(await owner.getBalance()).toString()
  );

  if (network.chainId === 1) {
    // Ethereum Mainnet
    fxRoot = config.mainnet.fxRoot.address;
    checkpointManager = config.mainnet.checkpointManager.address;
    fxERC20 = config.mainnet.fxERC20.address;
    fxERC20ChildTunnel = config.mainnet.fxERC20ChildTunnel.address;
  } else if (network.chainId === 5) {
    // Goerli Testnet
    fxRoot = config.testnet.fxRoot.address;
    checkpointManager = config.testnet.checkpointManager.address;
    fxERC20 = config.testnet.fxERC20.address;
    fxERC20ChildTunnel = config.testnet.fxERC20ChildTunnel.address;
  } else {
    fxRoot = process.env.FX_ROOT;
    checkpointManager = process.env.CHECKPOINT_MANAGER;
    fxERC20 = process.env.FX_ERC20;
    fxERC20ChildTunnel = process.env.FX_CHILD_TUNNEL;
  }

  const args = [checkpointManager, fxRoot, fxERC20];

  const ERC20 = await hre.ethers.getContractFactory("FxERC20RootTunnel");
  const erc20 = await ERC20.deploy(...args);
  console.log(erc20.deployTransaction);
  await erc20.deployTransaction.wait(5);
  console.log("ERC20RootTunnel deployed to:", erc20.address);

  await hre.run("verify:verify", {
    address: erc20.address,
    constructorArguments: args,
  });

  const setERC20Child = await erc20.setFxChildTunnel(fxERC20ChildTunnel);
  console.log(setERC20Child);
  await setERC20Child.wait();
  console.log("ERC20ChildTunnel set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
