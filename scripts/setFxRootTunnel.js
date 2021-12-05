require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");

async function main() {
  let fxMintableERC20ChildTunnel, fxMintableERC20RootTunnel;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Using contracts with the account:", owner.address);
  console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

  if (network.chainId === 137) {
    // Polygon Mainnet
    fxMintableERC20ChildTunnel = config.polygon.fxMintableERC20ChildTunnel.address;
    fxMintableERC20RootTunnel = config.ethereum.fxMintableERC20RootTunnel.address;
  } else if (network.chainId === 80001) {
    // Mumbai Testnet
    fxMintableERC20ChildTunnel = config.mumbai.fxMintableERC20ChildTunnel.address;
    fxMintableERC20RootTunnel = config.goerli.fxMintableERC20RootTunnel.address;
  } else {
    fxMintableERC20ChildTunnel = process.env.FX_MINTABLE_CHILD_TUNNEL;
    fxMintableERC20RootTunnel = process.env.FX_MINTABLE_ROOT_TUNNEL;
  }

  const FxMintableERC20ChildTunnel = await hre.ethers.getContractAt("FxMintableERC20ChildTunnel", fxMintableERC20ChildTunnel);

  const setFxRootTunnel = await FxMintableERC20ChildTunnel.setFxRootTunnel(fxMintableERC20RootTunnel);
  await setFxRootTunnel.wait(5);
  console.log("FxRootTunnel set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
