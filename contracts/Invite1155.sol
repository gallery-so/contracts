// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Timers.sol";

/**
 * @dev Based on Enjin implementation of the MixedFungibleMintable Token.
 * https://github.com/enjin/erc-1155
 * Adapted by Benny Conn
 */
contract Invite1155 is ERC1155, Ownable {
    using Timers for Timers.Timestamp;

    Timers.Timestamp mintTimer = Timers.Timestamp(0);

    constructor(string memory baseTokenURI, uint64 deadline)
        ERC1155(baseTokenURI)
    {
        mintTimer.setDeadline(deadline);
    }

    mapping(uint256 => mapping(address => uint256)) private _mintApproved;

    function mintToMany(
        uint256 _id,
        address[] calldata _to,
        uint256[] calldata _quantities
    ) external onlyOwner {
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 quantity = _quantities[i];
            _mint(to, _id, quantity, "");
        }
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external {
        require(
            _mintApproved[id][msg.sender] >= amount,
            "Invite: not approved to mint"
        );
        require(mintTimer.isExpired(), "Invite: minting not open");
        _mint(to, id, amount, bytes(""));
    }

    function setMintApproval(
        address spender,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        _mintApproved[id][spender] = amount;
    }
}
