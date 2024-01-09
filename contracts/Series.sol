// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Series is ERC721, Ownable {
    mapping(uint256 => string) internal _tokenURIs;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public virtual {
        _mint(to, tokenId);
        _tokenURIs[tokenId] = uri;
    }

    function setURI(
        uint256 tokenId,
        string memory uri
    ) public virtual onlyOwner {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return _tokenURIs[tokenId];
    }
}
