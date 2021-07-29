// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MintPermissable {
    // mapping of token ids to the address of the address that can mint them
    mapping(uint256 => address) private _canMint;
    // mapping of token ids to the address that can grant minting rights
    mapping(uint256 => address) private _accessGranters;

    modifier mustHaveMintPermission(uint256 tokenId, address to) {
        require(_canMint[tokenId] == to);
        _;
    }
    modifier mustHaveMintPermitPermission(uint256 tokenId, address to) {
        require(_accessGranters[tokenId] == to);
        _;
    }

    function grantMintPermission(address to, uint256 tokenId)
        public
        virtual
        mustHaveMintPermitPermission(tokenId, to)
    {
        require(_accessGranters[tokenId] == msg.sender);
        _canMint[tokenId] = to;
    }

    function allowMintPermit(address to, uint256 tokenId) public virtual {
        _accessGranters[tokenId] = to;
    }

    function allowMintPermitMany(address to, uint256[] memory tokenIds)
        public
        virtual
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _accessGranters[tokenIds[i]] = to;
        }
    }
}
