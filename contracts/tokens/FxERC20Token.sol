// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Token.sol";

/**
 * @dev ERC20 token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a pauser role that allows to stop all token transfers
 *
 * The account that deploys the contract will be granted pauser
 * roles, as well as the default admin role, which will let it grant pauser roles to other accounts.
 */
contract FxERC20Token is
  ERC20Token
{
  address internal _fxManager;
  address internal _connectedToken;

  /**
   * @dev Grants `DEFAULT_ADMIN_ROLE` and `PAUSER_ROLE` to the deployer
   * Mints initialSupply tokens to deployer
   */
  function initialize(
    address fxManager_,
    address connectedToken_,
    address _creator,
    string memory _name,
    string memory _symbol
  ) initializer public {
    require(_fxManager == address(0x0) && _connectedToken == address(0x0), "Token is already initialized");
    _fxManager = fxManager_;
    _connectedToken = connectedToken_;

    ERC20Token.initialize(_creator, _name, _symbol);
  }

  function mintByFxManager(address user, uint256 amount) public {
    require(msg.sender == _fxManager, "Invalid sender");
    _mint(user, amount);
  }

  function fxManager() public view returns (address) {
    return _fxManager;
  }

  function connectedToken() public view returns (address) {
    return _connectedToken;
  }
}
