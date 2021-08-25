// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./Redeemable.sol";
import "hardhat/console.sol";

contract Invite721 is AccessControl, ERC721, Redeemable {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function mint(address to, uint256 tokenId)
        public
        virtual
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _mint(to, tokenId);
    }

    function mintBatch(address[] memory tos, uint256[] memory tokenIds)
        public
        virtual
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(tos.length == tokenIds.length);
        for (uint256 i = 0; i < tos.length; i++) {
            _mint(tos[i], tokenIds[i]);
        }
        console.log(tos.length, "tokens minted");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(
            isRedeemed(tokenId) || !_exists(tokenId),
            "Invite: Token must be redeemed before transfer"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function redeem(uint256 _tokenId) public virtual override {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "Invite: transfer caller is not owner nor approved"
        );
        super.redeem(_tokenId);
    }
}
