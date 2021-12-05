// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Create2 } from "../../lib/Create2.sol";
import { FxERC20Token, ERC20Token } from "../../tokens/FxERC20Token.sol";
import { FxBaseRootTunnel } from "../../tunnel/FxBaseRootTunnel.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


/** 
 * @title FxMintableERC20RootTunnel
 */
contract FxMintableERC20RootTunnel is FxBaseRootTunnel, Create2 {
    using SafeERC20 for IERC20;

    // maybe DEPOSIT and MAP_TOKEN can be reduced to bytes4
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    bytes32 public constant MAP_TOKEN = keccak256("MAP_TOKEN");

    mapping(address => address) public rootToChildTokens;
    address public rootTokenTemplate;
    bytes32 public childTokenTemplateCodeHash;

     constructor(address _checkpointManager, address _fxRoot, address _rootTokenTemplate, address _childTokenTemplate) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
        rootTokenTemplate = _rootTokenTemplate;
        // compute child token template code hash
        childTokenTemplateCodeHash = keccak256(
            minimalProxyCreationCode(_childTokenTemplate)
        );
    }

    function mapToken(address rootToken) public {
        // check if token is already mapped
        require(
            rootToChildTokens[rootToken] == address(0x0),
            "FxERC20RootTunnel: ALREADY_MAPPED"
        );

        // name, symbol
        ERC20Token rootTokenContract = ERC20Token(rootToken);
        address creator = rootTokenContract.creator();
        string memory name = rootTokenContract.name();
        string memory symbol = rootTokenContract.symbol();

        // MAP_TOKEN, encode(rootToken, creator, name, symbol, mintTo)
        bytes memory message = abi.encode(
            MAP_TOKEN,
            abi.encode(rootToken, creator, name, symbol)
        );
        _sendMessageToChild(message);

        // compute child token address before deployment using create2
        bytes32 salt = keccak256(abi.encodePacked(rootToken));
        address childToken = computedCreate2Address(
            salt,
            childTokenTemplateCodeHash,
            fxChildTunnel
        );

        // add into mapped tokens
        rootToChildTokens[rootToken] = childToken;
    }

    function deposit(address rootToken, address mintTo, uint256 amount, bytes memory data) public  {
        // map token if not mapped
        if (rootToChildTokens[rootToken] == address(0x0)) {
            mapToken(rootToken);
        }

        // transfer from depositor to this contract
        IERC20(rootToken).safeTransferFrom(
            msg.sender,    // depositor
            address(this), // manager contract
            amount
        );

        // DEPOSIT, encode(rootToken, depositor, mintTo, amount, extra data)
        bytes memory message = abi.encode(DEPOSIT, abi.encode(rootToken, msg.sender, mintTo, amount, data));
        _sendMessageToChild(message);
    }

    // exit processor
    function _processMessageFromChild(bytes memory data) internal override {
        (address rootToken, address childToken, address creator, address mintTo, uint256 amount, bytes memory metaData) = abi.decode(data, (address, address, address, address, uint256, bytes));

        // if root token is not available, create it
        if (!_isContract(rootToken) && rootToChildTokens[rootToken] == address(0x0)) {
            (string memory name, string memory symbol) = abi.decode(metaData, (string, string));

            address _createdToken = _deployRootToken(childToken, creator, name, symbol);
            require(_createdToken == rootToken, "FxMintableERC20RootTunnel: ROOT_TOKEN_CREATION_MISMATCH");
        }

        // validate mapping for root to child
        require(rootToChildTokens[rootToken] == childToken, "FxERC20RootTunnel: INVALID_MAPPING_ON_EXIT");

        // check if current balance for token is less than amount,
        // mint remaining amount for this address
        FxERC20Token tokenObj = FxERC20Token(rootToken); 
        uint256 balanceOf = tokenObj.balanceOf(address(this));
        if (balanceOf < amount) {
            tokenObj.mintByFxManager(address(this), amount - balanceOf);
        }

        //approve token transfer
        tokenObj.approve(address(this), amount);
        
        // transfer from tokens
        IERC20(rootToken).safeTransferFrom(
            address(this),
            mintTo,
            amount
        );
    }
    
    function _deployRootToken(address childToken, address creator, string memory name, string memory symbol) internal returns (address) {
        // deploy new root token
        bytes32 salt = keccak256(abi.encodePacked(childToken));
        address rootToken = createClone(salt, rootTokenTemplate);
        FxERC20Token(rootToken).initialize(address(this), rootToken, creator, name, symbol);

        // add into mapped tokens
        rootToChildTokens[rootToken] = childToken;

        return rootToken;
    }

    // check if address is contract
    function _isContract(address _addr) private view returns (bool){
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}
