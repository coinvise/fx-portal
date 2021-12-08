// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { FxBaseChildTunnel } from '../../tunnel/FxBaseChildTunnel.sol';
import { Create2 } from '../../lib/Create2.sol';
import { FxERC20Token, ERC20Token } from '../../tokens/FxERC20Token.sol';


/**
 * @title FxMintableERC20ChildTunnel
 * @notice Child tunnel contract that enables receiving ERC20 tokens bridged from root chain
 *         and withdrawing ERC20 tokens to root chain
 *         Also allows minting new tokens on child chain that can be bridged to root chain
 */
contract FxMintableERC20ChildTunnel is FxBaseChildTunnel, Create2 {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    bytes32 public constant MAP_TOKEN = keccak256("MAP_TOKEN");


    // event for token maping
    event TokenMapped(address indexed rootToken, address indexed childToken);
    // root to child token
    mapping(address => address) public rootToChildToken;
    // child token template
    address public childTokenTemplate;
    // root token tempalte code hash
    bytes32 public rootTokenTemplateCodeHash;

    /**
     * @param _fxChild FxChild contract address
     * @param _childTokenTemplate Child token template address on the child chain
     * @param _rootTokenTemplate Root token template address on the root chain
     */
    constructor(address _fxChild, address _childTokenTemplate, address _rootTokenTemplate) FxBaseChildTunnel(_fxChild) {
        childTokenTemplate = _childTokenTemplate;
        require(_isContract(_childTokenTemplate), "Token template is not contract");
        // compute root token template code hash
        rootTokenTemplateCodeHash = keccak256(minimalProxyCreationCode(_rootTokenTemplate));
    }

    // deploy child token with unique id
    /**
     * @notice Deploy a child token on child chain
     * @dev Deploys and initializes a minimal clone out of the childTokenTemplate
     *      Computes the root token create2 address
     *      Maps the root token to the child token
     *      Mints initialSupply amount of tokens to mintTo address
     * @param uniqueId unique integer to be used to generate salt for the clone
     * @param name name of the child token in child chain
     * @param symbol symbol of the child token in child chain
     * @param initialSupply number of tokens to be minted on initialize
     * @param mintTo address to mint the initial supply of the child token
     */
    function deployChildToken(uint256 uniqueId, string memory name, string memory symbol, uint256 initialSupply, address mintTo) public returns (address) {
        // deploy new child token using unique id
        bytes32 childSalt = keccak256(abi.encodePacked(uniqueId));
        address childToken = createClone(childSalt, childTokenTemplate);

        // compute root token address before deployment using create2
        bytes32 rootSalt = keccak256(abi.encodePacked(childToken));
        address rootToken = computedCreate2Address(rootSalt, rootTokenTemplateCodeHash, fxRootTunnel);

        // check if mapping is already there
        require(rootToChildToken[rootToken] == address(0x0), "FxMintableERC20ChildTunnel: ALREADY_MAPPED");
        rootToChildToken[rootToken] = childToken;
        emit TokenMapped(rootToken,childToken);
        
        // initialize child token with all parameters
        FxERC20Token(childToken).initialize(address(this), rootToken, msg.sender, name, symbol);
        // mint initial supply
        FxERC20Token(childToken).mintByFxManager(mintTo, initialSupply);
        
        return childToken;
    }

    /**
     * @notice Withdraw tokens from child chain to root chain
     * @dev Burns child tokens in the child chain to be withdrawn
     *      Prepares and sends message to the root tunnel contract with the token details and amount
     *      Burnproof is to be generated from the txn hash to be used to unlock/mint the tokens on root chain
     * @param childToken address of the child token to withdraw (bridge)
     * @param amount number of tokens to be withdrawn (bridged)
     */
    function withdraw(address childToken, uint256 amount) public {
        FxERC20Token childTokenContract = FxERC20Token(childToken);
        // child token contract will have root token
        address rootToken = childTokenContract.connectedToken();

        // validate root and child token mapping
        require(
            childToken != address(0x0) &&
            rootToken != address(0x0) &&
            childToken == rootToChildToken[rootToken],
            "FxERC20ChildTunnel: NO_MAPPED_TOKEN"
        );

        // withdraw tokens. should be approved prior
        childTokenContract.burnFrom(msg.sender, amount);
        
        // name, symbol
        ERC20Token rootTokenContract = ERC20Token(childToken);
        address creator = rootTokenContract.creator();
        string memory name = rootTokenContract.name();
        string memory symbol = rootTokenContract.symbol();
        bytes memory metaData = abi.encode(name, symbol);

        // send message to root regarding token burn
        _sendMessageToRoot(abi.encode(rootToken, childToken, creator, msg.sender, amount, metaData));
    }

    //
    // Internal functions
    //

    /**
     * @notice Processes message from root, called during checkpoint, while depositing from root chain
     * @dev Syncs deposit or maps token depending on the message received from root
     * @param data data passed in from the root tunnel contract
     */
    function _processMessageFromRoot(uint256 /* stateId */, address sender, bytes memory data)
        internal
        override
        validateSender(sender) {

        // decode incoming data
        (bytes32 syncType, bytes memory syncData) = abi.decode(data, (bytes32, bytes));

       
        if (syncType == DEPOSIT) {
            _syncDeposit(syncData);
        } else if (syncType == MAP_TOKEN) {
            _mapToken(syncData);
        } else {
            revert("FxERC20ChildTunnel: INVALID_SYNC_TYPE");
        }
    }

    /**
     * @notice Map a root token to child token
     * @dev Deploys and initialzes a minimal clone out of the childTokenTemplate
     *      Maps the root token to the child token
     * @param syncData data passed in from the root tunnel contract
     */
    function _mapToken(bytes memory syncData) internal returns (address) {
        (
            address rootToken,
            address creator,
            string memory name,
            string memory symbol
        ) = abi.decode(syncData, (address, address, string, string));

        // get root to child token
        address childToken = rootToChildToken[rootToken];

        // check if it's already mapped
        require(
            childToken == address(0x0),
            "FxERC20ChildTunnel: ALREADY_MAPPED"
        );

        // deploy new child token
        bytes32 salt = keccak256(abi.encodePacked(rootToken));
        childToken = createClone(salt, childTokenTemplate);
        FxERC20Token(childToken).initialize(
            address(this),
            rootToken,
            creator,
            name,
            symbol
        );

        // map the token
        rootToChildToken[rootToken] = childToken;
        emit TokenMapped(rootToken, childToken);

        // return new child token
        return childToken;
    }
    
    /**
     * @notice Sync a deposit from root tunnel contract
     * @dev Mints child token to mintTo
     *      Calls `onTokenTranfer` on `mintTo` if it's a contract
     * @param syncData data passed in from the root tunnel contract
     */
    function _syncDeposit(bytes memory syncData) internal {
        (address rootToken, address depositor, address mintTo, uint256 amount, bytes memory depositData) = abi.decode(syncData, (address, address, address, uint256, bytes));
        address childToken = rootToChildToken[rootToken];

        // deposit tokens
        FxERC20Token childTokenContract = FxERC20Token(childToken);
        childTokenContract.mintByFxManager(mintTo, amount);

        // call `onTokenTranfer` on `mintTo` with limit and ignore error
        if (_isContract(mintTo)) {
            uint256 txGas = 2000000;
            bool success = false;
            bytes memory data = abi.encodeWithSignature("onTokenTransfer(address,address,address,address,uint256,bytes)", rootToken, childToken, depositor, mintTo, amount, depositData);
            // solium-disable-next-line security/no-inline-assembly
            assembly {
                success := call(txGas, mintTo, 0, add(data, 0x20), mload(data), 0, 0)
            }
        }
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

