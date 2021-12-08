require("dotenv").config();

(async () => {
  const Matic = require("@maticnetwork/maticjs");

  const options = {
    network: "testnet",
    version: "mumbai",
    maticProvider: process.env.MATIC_PROVIDER,
    parentProvider: process.env.PARENT_PROVIDER,
  };
  const maticPoSClient = new Matic.MaticPOSClient(options);

  // Edit the burn txn hash before running script
  const burnTxHash = "";
  const MESSAGE_SENT_EVENT_SIG = "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";

  const payload = await maticPoSClient.posRootChainManager.exitManager.buildPayloadForExit(burnTxHash, MESSAGE_SENT_EVENT_SIG);

  console.log(payload);
})();
