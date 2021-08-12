// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Redeemable.sol";

contract Invite1155 is
    Initializable,
    AccessControlUpgradeable,
    ERC1155Upgradeable,
    Redeemable
{
    function initialize(string memory baseTokenURI) public virtual initializer {
        __invite_init(baseTokenURI);
    }

    function __invite_init(string memory baseTokenURI) internal initializer {
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __ERC1155_init_unchained(baseTokenURI);
        __Context_init_unchained();
        __invite_init_unchained();
    }

    function __invite_init_unchained() internal initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, tokenId, amount, abi.encodePacked(msg.sender));
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _mintBatch(to, ids, amounts, abi.encodePacked(msg.sender));
    }

    function mintToMany(
        address[] memory tos,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            tos.length == ids.length && tos.length == amounts.length,
            "Invite: Mismatched array sizes"
        );
        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], ids[i], amounts[i], abi.encodePacked(msg.sender));
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155Upgradeable) {
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                isRedeemed(ids[i]) || from == address(0),
                "Invite: Token not redeemed"
            );
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function redeem(uint256 _tokenId) public virtual override {
        require(
            balanceOf(msg.sender, _tokenId) > 0,
            "Invite: transfer caller is not owner nor approved"
        );
        super.redeem(_tokenId);
    }
}
