// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "./ERC1155MixedFungible.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Redeemable.sol";

/**
 * @dev Based on Enjin implementation of the MixedFungibleMintable Token.
 * https://github.com/enjin/erc-1155
 * Adapted by Benny Conn
 */
contract Invite1155 is Initializable, ERC1155MixedFungible, Redeemable {
    uint256 nonce;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public maxIndex;

    modifier creatorOnly(uint256 _id) {
        require(creators[_id] == msg.sender);
        _;
    }

    // This function only creates the type.
    function create(bool _isNF) external returns (uint256 _type) {
        // Store the type in the upper 128 bits
        _type = (++nonce << 128);

        // Set a flag if this is an NFI.
        if (_isNF) _type = _type | TYPE_NF_BIT;

        // This will allow restricted access to creators.
        creators[_type] = msg.sender;

        // emit a Transfer event with Create semantic to help with discovery.
        emit TransferSingle(msg.sender, address(0x0), address(0x0), _type, 0);
    }

    function initialize(string memory baseTokenURI) public virtual initializer {
        __invite_init(baseTokenURI);
    }

    function __invite_init(string memory baseTokenURI) internal initializer {
        __ERC165_init_unchained();
        __ERC1155_init_unchained(baseTokenURI);
        __Context_init_unchained();
        __invite_init_unchained();
    }

    function __invite_init_unchained() internal initializer {}

    function mintNonFungible(uint256 _type, address[] calldata _to)
        external
        creatorOnly(_type)
    {
        require(isNonFungible(_type));

        // Index are 1-based.
        uint256 index = maxIndex[_type] + 1;
        maxIndex[_type] += _to.length;

        for (uint256 i = 0; i < _to.length; ++i) {
            address dst = _to[i];
            uint256 id = _type | (index + i);

            nfOwners[id] = dst;

            emit TransferSingle(msg.sender, address(0x0), dst, id, 1);

            _doSafeTransferAcceptanceCheck(
                msg.sender,
                msg.sender,
                dst,
                id,
                1,
                ""
            );
        }
    }

    function mintFungible(
        uint256 _id,
        address[] calldata _to,
        uint256[] calldata _quantities
    ) external creatorOnly(_id) {
        require(isFungible(_id));

        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 quantity = _quantities[i];

            // Grant the items to the caller
            balances[_id][to] += quantity;

            emit TransferSingle(msg.sender, address(0x0), to, _id, quantity);

            _doSafeTransferAcceptanceCheck(
                msg.sender,
                msg.sender,
                to,
                _id,
                quantity,
                ""
            );
        }
    }

    function redeem(uint256 _id) public virtual override {
        require(isNonFungible(_id), "Invite: token must be NF to be redeemed");
        super.redeem(_id);
    }
}
