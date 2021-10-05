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
    // using Timers for Timers.Timestamp;

    // Timers.Timestamp mintTimer = Timers.Timestamp(0);

    constructor(string memory baseTokenURI) ERC1155(baseTokenURI) {
        // mintTimer.setDeadline(deadline);
    }

    mapping(uint256 => mapping(address => uint256)) private _mintApprovals;

    function mintToMany(
        address[] calldata _to,
        uint256[] calldata _quantities,
        uint256 _id
    ) external onlyOwner {
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 quantity = _quantities[i];
            _mint(to, _id, quantity, "");
        }
    }

    function mint(
        address to,
        uint256 amount,
        uint256 id
    ) external {
        require(
            _mintApprovals[id][msg.sender] >= amount,
            "Invite: not approved to mint"
        );
        // require(mintTimer.isExpired(), "Invite: minting not open");
        _mint(to, id, amount, bytes(""));
    }

    function setMintApproval(
        address spender,
        uint256 amount,
        uint256 id
    ) external onlyOwner {
        _mintApprovals[id][spender] = amount;
    }

    function setMintApprovals(
        address[] calldata spender,
        uint256[] calldata amounts,
        uint256 id
    ) external onlyOwner {
        require(
            spender.length == amounts.length,
            "Invite: spender and amounts arrays must be the same length"
        );
        for (uint256 i = 0; i < spender.length; ++i) {
            _mintApprovals[id][spender[i]] = amounts[i];
        }
    }

    function getMintApproval(address spender, uint256 id)
        external
        view
        returns (uint256)
    {
        return _mintApprovals[id][spender];
    }
}
