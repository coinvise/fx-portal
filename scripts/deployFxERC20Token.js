const hre = require("hardhat");
const ethers = hre.ethers;

const deployFxERC20TokenLogic = async () => {
  const FxERC20Token = await ethers.getContractFactory("FxERC20Token");
  const FxERC20TokenLogic = await FxERC20Token.deploy();
  console.log("FxERC20Token logic address: ", FxERC20TokenLogic.address);

  await FxERC20TokenLogic.deployTransaction.wait(5);

  console.log("FxERC20Token Logic deployed");

  // await hre.run("verify:verify", {
  //   address: FxERC20TokenLogic.address,
  //   constructorArguments: [],
  // });

  return FxERC20TokenLogic.address;
};

const main = async () => {
  const [owner] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

  await deployFxERC20TokenLogic();
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
