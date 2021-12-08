### Testing Notes:
1. Deploy `ERC20Token` + `ERC20TokenFactory`: `tokens/scripts/deploy.ts`
    ```
    yarn script scripts/deploy.ts --network goerli
    ```
2. Add `ERC20Token`, `ERC20TokenFactory` addresses to `config/config.json`

3. `ERC20TokenFactory.deployERC20Token()`: `tokens/scripts/deployERC20Token.ts`
    ```
    yarn script scripts/deployERC20Token.ts --network goerli
    ```
4. Note *3 address

5. Deploy `FxERC20Token` - Goerli: `fx-portal/scripts/deployFxERC20Token.js`
    ```
    npx hardhat run scripts/deployFxERC20Token.js --network goerli
    ```
6. Deploy `FxERC20Token` - Mumbai: `fx-portal/scripts/deployFxERC20Token.js`
    ```
    npx hardhat run scripts/deployFxERC20Token.js --network mumbai
    ```
7. Add *5, *6 addresses to to `config/config.json`

8. Deploy `FxMintableERC20ChildTunnel` - Mumbai: `fx-portal/scripts/deployMintableERC20ChildTunnel.js`
    - _fxChild = config.testnet.fxChild.address
    - _childTokenTemplate = *6
    - _rootTokenTemplate = *5
    ```    
    npx hardhat run scripts/deployMintableERC20ChildTunnel.js --network mumbai
    ```
9. Add *8 address to `config/config.json`

10. Deploy `FxMintableERC20RootTunnel` + `setFxChildTunnel()` - Goerli: `fx-portal/scripts/deployMintableERC20RootTunnel.js`
    - _checkpointManager = config.testnet.checkpointManager.address
    - _fxRoot = config.testnet.checkpointManager.address;
    - _rootTokenTemplate = *5
    - _childTokenTemplate = *5
    ```
    npx hardhat run scripts/deployMintableERC20RootTunnel.js --network goerli
    ```    
11. Add *10 address to `config/config.json`

12. `FxMintableERC20ChildTunnel.setFxRootTunnel()` - Mumbai: `fx-portal/scripts/setFxRootTunnel.js`
    ```
    npx hardhat run scripts/setFxRootTunnel.js --network mumbai
    ```

13. `FxMintableERC20RootTunnel.deposit()` - Goerli: `fx-portal/scripts/deposit.js` - Change args inside the script
    ```
    npx hardhat run scripts/deposit.js --network goerli
    ```
14. Wait and confirm for tokens in *13 to be minted in the child chain
15. Note *14 childToken address
16. Confirm childToken address in the `FxMintableERC20RootTunnel.rootToChildTokens` mapping

17. `FxMintableERC20ChildTunnel.withdraw()` - Mumbai: `fx-portal/scripts/withdraw.js` - Change args inside the script
    ```
    npx hardhat run scripts/withdraw.js --network mumbai
    ```
18. Note *17 txn hash, block
19. Wait for *17 to be checkpointed:
    - `https://apis.matic.network/api/v1/mumbai/block-included/block-number`
    - `https://apis.matic.network/api/v1/matic/block-included/block-number`
20. Generate burnproof - Change args inside the script
    ```
    node scripts/burnproof.js
    ```
21. `FxMintableERC20RootTunnel.receiveMessage()` - Goerli: `fx-portal/scripts/receiveMessage.js` - Change args inside the script - burnproof from *20
    ```
    npx hardhat run scripts/receiveMessage.js --network goerli
    ```

22. `FxMintableERC20ChildTunnel.deployChildToken()` - Mumbai: `fx-portal/scripts/deployChildToken.js` - Change args inside the script as required
    ```
    npx hardhat run scripts/deployChildToken.js --network mumbai
    ```
23. Note *22 for root and child address
24. `FxMintableERC20ChildTunnel.withdraw()` - Mumbai: `fx-portal/scripts/withdraw.js` - Change args inside the script
    ```
    npx hardhat run scripts/withdraw.js --network mumbai
    ```
25. Note *24 txn hash, block
26. Wait for *24 to be checkpointed:
    - `https://apis.matic.network/api/v1/mumbai/block-included/block-number`
    - `https://apis.matic.network/api/v1/matic/block-included/block-number`
27. Generate burnproof - `fx-portal/scripts/burnproof.js` - Change args inside the script
    ```
    node scripts/burnproof.js
    ```
28. `FxMintableERC20RootTunnel.receiveMessage()` - Goerli: `fx-portal/scripts/receiveMessage.js` - Change args inside the script - burnproof from *20
    ```
    npx hardhat run scripts/receiveMessage.js --network goerli
    ```

29. `FxMintableERC20RootTunnel.deposit()` - Goerli: `fx-portal/scripts/deposit.js` - Change args inside the script
    ```
    npx hardhat run scripts/deposit.js --network goerli
    ```
30. Wait and confirm for tokens in *29 to be minted in the child chain

#### Test Txns:
1. Deploy `ERC20Token`: [0x1a42b87d08dd6d13d1d687c467402cc7d3422508e0d8851c1e66188ddec87816](https://goerli.etherscan.io/tx/0x1a42b87d08dd6d13d1d687c467402cc7d3422508e0d8851c1e66188ddec87816)
2. Deploy `ERC20TokenFactory`: [0x6C1e58f8aFA70Eefe425130b053c2E48752CED14](https://goerli.etherscan.io/tx/0x5bd43fa9c611a7b54cb1fa928edd8252ffddab8fc0a47f97de4e3e0b5c563ff1)
3. `ERC20TokenFactory.deployERC20Token()`: [0x5ad10350ef6c9bfb31d2fea720e3364ca3830fde7fcb00f239e86fa1bf9264ce](https://goerli.etherscan.io/tx/0x5ad10350ef6c9bfb31d2fea720e3364ca3830fde7fcb00f239e86fa1bf9264ce)
    ERC20Token clone address: `0xcCbF75Afa16a6dF55f3a509077862C3Dd9DacA5e`
4. Deploy `FxERC20Token` - Goerli: [0x5e5c178ee561e1444d6799bb099d39617e98aa7a7ee1336b75a148c96cf7ee00](https://goerli.etherscan.io/tx/0x5e5c178ee561e1444d6799bb099d39617e98aa7a7ee1336b75a148c96cf7ee00)
5. Deploy `FxERC20Token` - Mumbai: [0xe7282829043d1a160f404526b35d99ed26fca524eed34d1fee124a6e4b69af16](https://mumbai.polygonscan.com/tx/0xe7282829043d1a160f404526b35d99ed26fca524eed34d1fee124a6e4b69af16)
6. Deploy `FxMintableERC20ChildTunnel`: [0xab95db62d4f6a79440a86c5817f16ee0fa23092374a42b4cdf211abe1ed9f5f7](https://mumbai.polygonscan.com/tx/0xab95db62d4f6a79440a86c5817f16ee0fa23092374a42b4cdf211abe1ed9f5f7)
7. Deploy `FxMintableERC20RootTunnel`: [0x8095adcd8a024d05a4623c30feeb48172940b9c60c54282d6495e3e3982b2d4d](https://goerli.etherscan.io/tx/0x8095adcd8a024d05a4623c30feeb48172940b9c60c54282d6495e3e3982b2d4d)
8. `FxMintableERC20RootTunnel.setFxChildTunnel()`: [0x9a94fa9461f63cbd64df5940de3c24837fd270b98a84144314c575465944d399](https://goerli.etherscan.io/tx/0x9a94fa9461f63cbd64df5940de3c24837fd270b98a84144314c575465944d399)
9. `FxMintableERC20ChildTunnel.setFxRootTunnel()`: [0x6c4212e3d6e4188c253511f83fe20b0898b62cfb75517725fe6468eaf8caa362](https://mumbai.polygonscan.com/tx/0x6c4212e3d6e4188c253511f83fe20b0898b62cfb75517725fe6468eaf8caa362)
10. `FxMintableERC20RootTunnel.deposit()` - `0xcCbF75Afa16a6dF55f3a509077862C3Dd9DacA5e`: [0x5129a5b56bbd90e8bef5a8ee84c180117c72615b46a839bc931573717c8b6720](https://goerli.etherscan.io/tx/0x5129a5b56bbd90e8bef5a8ee84c180117c72615b46a839bc931573717c8b6720)
    - Child token address - `0x843d60c59261dfcb1937a6fc328c6ce1a13460c3`
11. `FxMintableERC20ChildTunnel.withdraw()` - `0x843d60c59261dfcb1937a6fc328c6ce1a13460c3`: [0x761fd5eedb2d93b5f600d89a7ce877a55215d37c4e30e8f0ff1c81062adc2d38](https://mumbai.polygonscan.com/tx/0x761fd5eedb2d93b5f600d89a7ce877a55215d37c4e30e8f0ff1c81062adc2d38)
    - Block `22271687`
    - `https://apis.matic.network/api/v1/mumbai/block-included/22271687`
12. `FxMintableERC20RootTunnel.receiveMessage()`: [0x40b5fc3682719ed6f502c458d4ed7aef8a3e94b0e2802a3e01df280a442d57d6](https://goerli.etherscan.io/tx/0x40b5fc3682719ed6f502c458d4ed7aef8a3e94b0e2802a3e01df280a442d57d6)
13. `FxMintableERC20ChildTunnel.deployChildToken()`: [0xe018e5d3726b7192bf36c2158c1f6461bc0444c6993dd689dc5f978bcf597317](https://mumbai.polygonscan.com/tx/0xe018e5d3726b7192bf36c2158c1f6461bc0444c6993dd689dc5f978bcf597317)
    - Root Token - `0xb9a2d1bfae7cb18b6a796fd3fe84b7c98d145d70`
    - Child Token - `0x6bf7f7b054136f018e40b947c75b22178641cc9f`
14. `FxMintableERC20ChildTunnel.withdraw()`: [0x41ec5e7c583b393ab60623e58ef9f2d9a88c949d70553fc67b0e87321630f665](https://mumbai.polygonscan.com/tx/0x41ec5e7c583b393ab60623e58ef9f2d9a88c949d70553fc67b0e87321630f665)
    - Block `22271811`
    - `https://apis.matic.network/api/v1/mumbai/block-included/22271811`
15. `FxMintableERC20RootTunnel.receiveMessage()`: [0xea66095c80c12fb776bfe75fbf279df37404cf4b5b000aef81fd593c84a56c11](https://goerli.etherscan.io/tx/0xea66095c80c12fb776bfe75fbf279df37404cf4b5b000aef81fd593c84a56c11)
16. `FxMintableERC20RootTunnel.deposit()`: [0x872a2c3bb580d31900bb5b17d0a781eed7f7828ffdef44e2405ad4b4d074bfb6](https://goerli.etherscan.io/tx/0x872a2c3bb580d31900bb5b17d0a781eed7f7828ffdef44e2405ad4b4d074bfb6)