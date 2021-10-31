// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20PresetMinterPauser} from "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract ERC20Token is ERC20PresetMinterPauser {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supplyCap,
        address minter
    ) ERC20PresetMinterPauser(name, symbol) {
        _mint(minter, supplyCap);
    }
}
