require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(
    `Owner [${owner.address}] Balance:`,
    ethers.utils.formatEther(await owner.getBalance()).toString()
  );

  const supplyInBigNumber = hre.ethers.BigNumber.from(1e7).mul(
    ethers.BigNumber.from(10).pow(18)
  );

  const args = ["Bri", "BRI", supplyInBigNumber, owner.address];

  const ERC20Factory = await hre.ethers.getContractFactory("ERC20Token");
  const erc20Deployed = await ERC20Factory.deploy(...args);

  await erc20Deployed.deployTransaction.wait(5);
  console.log("ERC20Token deployed to:", erc20Deployed.address);

  await hre.run("verify:verify", {
    address: erc20Deployed.address,
    constructorArguments: args,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
