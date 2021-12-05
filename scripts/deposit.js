require("dotenv").config();
const config = require("../config/config.json");
const hre = require("hardhat");
const ethers = hre.ethers;
const { parseEther } = require("@ethersproject/units");

async function main() {
  let fxMintableERC20RootTunnel;

  const network = await hre.ethers.provider.getNetwork();

  const [owner] = await hre.ethers.getSigners();

  console.log("Using contracts with the account:", owner.address);
  console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

  if (network.chainId === 1) {
    // Ethereum Mainnet
    fxMintableERC20RootTunnel = config.ethereum.fxMintableERC20RootTunnel.address;
  } else if (network.chainId === 5) {
    // Goerli Testnet
    fxMintableERC20RootTunnel = config.goerli.fxMintableERC20RootTunnel.address;
  } else {
    fxMintableERC20RootTunnel = process.env.FX_MINTABLE_ROOT_TUNNEL;
  }

  const FxMintableERC20RootTunnel = await hre.ethers.getContractAt("FxMintableERC20RootTunnel", fxMintableERC20RootTunnel);

  // Edit following args before running script
  const rootToken = "";
  const user = owner.address;
  const amount = parseEther("");
  const data = ethers.constants.HashZero;
  const args = [rootToken, user, amount, data];

  // Approve tokens
  const ERC20Token = await hre.ethers.getContractAt("ERC20Token", rootToken);
  await ERC20Token.approve(fxMintableERC20RootTunnel, amount);

  // Deposit
  const deposit = await FxMintableERC20RootTunnel.deposit(...args, {
    gasLimit: 250000,
  });
  await deposit.wait(5);
  console.log("Deposited tokens to FxMintableERC20RootTunnel. Check child chain txn for child token address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
