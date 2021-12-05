require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");
const ethers = hre.ethers;
const { parseEther } = require("@ethersproject/units");

async function main() {
  let fxMintableERC20ChildTunnel;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Using contracts with the account:", owner.address);
  console.log(
    `Owner [${owner.address}] Balance:`,
    ethers.utils.formatEther(await owner.getBalance()).toString()
  );

  if (network.chainId === 137) {
    // Polygon Mainnet
    fxMintableERC20ChildTunnel = config.polygon.fxMintableERC20ChildTunnel.address;
  } else if (network.chainId === 80001) {
    // Mumbai Testnet
    fxMintableERC20ChildTunnel = config.mumbai.fxMintableERC20ChildTunnel.address;
  } else {
    fxMintableERC20ChildTunnel = process.env.FX_MINTABLE_CHILD_TUNNEL;
  }

  const FxMintableERC20ChildTunnel = await hre.ethers.getContractAt(
    "FxMintableERC20ChildTunnel",
    fxMintableERC20ChildTunnel
  );

  // Edit following args before running script
  const uniqueId = +new Date();
  const name = "";
  const symbol = "";
  const initialSupply = parseEther("");
  const minter = owner.address;
  const args = [uniqueId, name, symbol, initialSupply, minter]

  // Deploy Child Token
  const deployChildToken = await FxMintableERC20ChildTunnel.deployChildToken(...args);
  await deployChildToken.wait();
  console.log("Deployed child token. Check txn logs for root and child token addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
