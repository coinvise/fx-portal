require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");

async function main() {
  let fxChild, fxERC20TokenChild, fxERC20TokenRoot;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

  if (network.chainId === 137) {
    // Polygon Mainnet
    fxChild = config.mainnet.fxChild.address;
    fxERC20TokenChild = config.polygon.fxERC20Token.address;
    fxERC20TokenRoot = config.ethereum.fxERC20Token.address;
  } else if (network.chainId === 80001) {
    // Mumbai Testnet
    fxChild = config.testnet.fxChild.address;
    fxERC20TokenChild = config.mumbai.fxERC20Token.address;
    fxERC20TokenRoot = config.goerli.fxERC20Token.address;
  } else {
    fxChild = process.env.FX_CHILD;
    fxERC20TokenChild = process.env.FX_ERC20_TOKEN_CHILD;
    fxERC20TokenRoot = process.env.FX_ERC20_TOKEN_ROOT;
  }

  const args = [fxChild, fxERC20TokenChild, fxERC20TokenRoot];

  const FxMintableERC20ChildTunnel = await hre.ethers.getContractFactory("FxMintableERC20ChildTunnel");
  const fxMintableERC20ChildTunnel = await FxMintableERC20ChildTunnel.deploy(...args);
  await fxMintableERC20ChildTunnel.deployTransaction.wait(5);
  console.log("FxMintableERC20ChildTunnel deployed to:", fxMintableERC20ChildTunnel.address);

  // Verify contract
  // await hre.run("verify:verify", {
  //   address: fxMintableERC20ChildTunnel.address,
  //   constructorArguments: args,
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
