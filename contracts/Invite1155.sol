// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155MixedFungible.sol";
import "./Redeemable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Based on Enjin implementation of the MixedFungibleMintable Token.
 * https://github.com/enjin/erc-1155
 * Adapted by Benny Conn
 */
contract Invite1155 is ERC1155MixedFungible, Redeemable {
    uint256 nonce;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public maxIndex;

    constructor(string memory baseTokenURI) ERC1155(baseTokenURI) {}

    modifier creatorOnly(uint256 _id) {
        require(
            creators[_id] == _msgSender(),
            "Invite1155: must be creator of type"
        );
        _;
    }

    // This function only creates the type.
    function create(bool _isNF) external returns (uint256 _type) {
        // Store the type in the upper 128 bits

        _type = ++nonce << 128;

        // Set a flag if this is an NFT.
        if (_isNF) {
            _type = _type | TYPE_NF_BIT;
        }

        // This will allow restricted access to creators.
        creators[_type] = _msgSender();

        // emit a Transfer event with Create semantic to help with discovery.
        emit TransferSingle(_msgSender(), address(0x0), address(0x0), _type, 0);
    }

    function mintNonFungible(uint256 _type, address[] calldata _to)
        external
        creatorOnly(_type)
    {
        require(isNonFungible(_type), "Invite1155: type is fungible");
        address sender = _msgSender();

        // Index are 1-based.
        uint256 index = maxIndex[_type] + 1;
        maxIndex[_type] += _to.length;

        for (uint256 i = 0; i < _to.length; ++i) {
            address dst = _to[i];
            uint256 id = _type | (index + i);

            nfOwners[id] = dst;

            emit TransferSingle(sender, address(0x0), dst, id, 1);

            _doSafeTransferAcceptanceCheck(sender, sender, dst, id, 1, "");
        }
    }

    function mintFungible(
        uint256 _id,
        address[] calldata _to,
        uint256[] calldata _quantities
    ) external creatorOnly(_id) {
        require(isFungible(_id));
        address sender = _msgSender();

        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 quantity = _quantities[i];

            // Grant the items to the caller
            balances[_id][to] += quantity;

            emit TransferSingle(sender, address(0x0), to, _id, quantity);

            _doSafeTransferAcceptanceCheck(
                sender,
                sender,
                to,
                _id,
                quantity,
                ""
            );
        }
    }

    function redeem(uint256 _id) public virtual override {
        require(
            ownerOf(_id) == _msgSender(),
            "Invite: token must be owned to be redeemed"
        );
        super.redeem(_id);
    }
}
