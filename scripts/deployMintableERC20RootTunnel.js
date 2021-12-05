require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");

async function main() {
  let fxRoot, checkpointManager, fxERC20TokenRoot, fxERC20TokenChild, fxMintableERC20ChildTunnel;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

  if (network.chainId === 1) {
    // Ethereum Mainnet
    fxRoot = config.mainnet.fxRoot.address;
    checkpointManager = config.mainnet.checkpointManager.address;
    fxERC20TokenRoot = config.ethereum.fxERC20Token.address;
    fxERC20TokenChild = config.polygon.fxERC20Token.address;
    fxMintableERC20ChildTunnel = config.polygon.fxMintableERC20ChildTunnel.address;
  } else if (network.chainId === 5) {
    // Goerli Testnet
    fxRoot = config.testnet.fxRoot.address;
    checkpointManager = config.testnet.checkpointManager.address;
    fxERC20TokenRoot = config.goerli.fxERC20Token.address;
    fxERC20TokenChild = config.mumbai.fxERC20Token.address;
    fxMintableERC20ChildTunnel = config.mumbai.fxMintableERC20ChildTunnel.address;
  } else {
    fxRoot = process.env.FX_ROOT;
    checkpointManager = process.env.CHECKPOINT_MANAGER;
    fxERC20TokenRoot = process.env.FX_ERC20_TOKEN_ROOT;
    fxERC20TokenChild = process.env.FX_ERC20_TOKEN_CHILD;
    fxMintableERC20ChildTunnel = process.env.FX_MINTABLE_CHILD_TUNNEL;
  }

  const args = [checkpointManager, fxRoot, fxERC20TokenRoot, fxERC20TokenChild];

  const FxMintableERC20RootTunnel = await hre.ethers.getContractFactory("FxMintableERC20RootTunnel");
  const fxMintableERC20RootTunnel = await FxMintableERC20RootTunnel.deploy(...args);
  await fxMintableERC20RootTunnel.deployTransaction.wait(5);
  console.log("FxMintableERC20RootTunnel deployed to:", fxMintableERC20RootTunnel.address);

  // await hre.run("verify:verify", {
  //   address: fxMintableERC20RootTunnel.address,
  //   constructorArguments: args,
  // });

  // setFxChildTunnel()
  const setFxChildTunnel = await fxMintableERC20RootTunnel.setFxChildTunnel(fxMintableERC20ChildTunnel);
  await setFxChildTunnel.wait(5);
  console.log("FxChildTunnel set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
