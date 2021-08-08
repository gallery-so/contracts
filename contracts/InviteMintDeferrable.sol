// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Redeemable.sol";
import "./MintPermissable.sol";

contract InviteMintDeferrable is
    Initializable,
    AccessControlUpgradeable,
    ERC721Upgradeable,
    Redeemable,
    MintPermissable
{
    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) public virtual initializer {
        __invite_init(name, symbol, baseTokenURI);
    }

    string private _baseTokenURI;

    function __invite_init(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) internal initializer {
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __ERC721_init_unchained(name, symbol);
        __invite_init_unchained(baseTokenURI);
    }

    function __invite_init_unchained(string memory baseTokenURI)
        internal
        initializer
    {
        _baseTokenURI = baseTokenURI;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function mint(address to, uint256 tokenId)
        public
        virtual
        mustHaveMintPermission(tokenId, to)
    {
        _mint(to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable) {
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
        override(AccessControlUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function allowMintPermit(address to, uint256 tokenId)
        public
        virtual
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        super.allowMintPermit(to, tokenId);
    }

    function allowMintPermitMany(address to, uint256[] memory tokenIds)
        public
        virtual
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        super.allowMintPermitMany(to, tokenIds);
    }

    function redeem(uint256 _tokenId) public virtual override {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "Invite: transfer caller is not owner nor approved"
        );
        super.redeem(_tokenId);
    }
}
