// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract GalleryMemorabilia is ERC1155, Ownable {
    using Address for address payable;

    struct TokenType {
        uint256 price;
        uint256 usedSupply;
        uint256 maxSupply;
        bytes32 allowListMerkleRoot;
        string uri;
    }

    bool public canMint;

    mapping(uint256 => TokenType) _tokenTypes;
    mapping(address => mapping(uint256 => bool)) private _hasMinted;

    string public constant name = "Gallery Memorabilia";
    string public constant symbol = "GM";

    constructor() ERC1155("") {}

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setTokenType(
        uint256 _id,
        uint256 _price,
        uint256 _usedSupply,
        uint256 _maxSupply,
        bytes32 _allowListMerkleRoot,
        string memory _uri
    ) public onlyOwner {
        _tokenTypes[_id] = TokenType(
            _price,
            _usedSupply,
            _maxSupply,
            _allowListMerkleRoot,
            _uri
        );
    }

    function getUsedSupply(uint256 _id) public view returns (uint256) {
        return _tokenTypes[_id].usedSupply;
    }

    function getMaxSupply(uint256 _id) public view returns (uint256) {
        return _tokenTypes[_id].maxSupply;
    }

    function getPrice(uint256 _id) public view returns (uint256) {
        return _tokenTypes[_id].price;
    }

    function setAllowlistRoot(uint256 _id, bytes32 merkleRoot)
        external
        onlyOwner
    {
        _tokenTypes[_id].allowListMerkleRoot = merkleRoot;
    }

    function uri(uint256 id)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _tokenTypes[id].uri;
    }

    function mintToMany(uint256 id, address[] calldata _to) external onlyOwner {
        require(canMint, "Poster: minting is disabled");
        if (_tokenTypes[id].maxSupply > 0) {
            require(
                _to.length + _tokenTypes[id].usedSupply <
                    _tokenTypes[id].maxSupply,
                "Poster: max supply reached"
            );
        }
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            require(
                !_hasMinted[to][id] && balanceOf(to, id) == 0,
                "Poster: cannot own more than one of a General Card"
            );
            _tokenTypes[id].usedSupply++;
            _hasMinted[to][id] = true;
            _mint(to, id, 1, "");
        }
    }

    function mint(
        uint256 id,
        address to,
        bytes32[] calldata merkleProof
    ) external payable {
        require(canMint, "Poster: minting is disabled");
        if (_tokenTypes[id].maxSupply > 0) {
            require(
                _tokenTypes[id].usedSupply < _tokenTypes[id].maxSupply,
                "Poster: max supply reached"
            );
        }
        require(
            balanceOf(to, id) == 0 && !_hasMinted[to][id],
            "Poster: cannot mint while owning poster"
        );
        bool allowlisted = MerkleProof.verify(
            merkleProof,
            _tokenTypes[id].allowListMerkleRoot,
            keccak256(abi.encodePacked(msg.sender))
        );

        bool isAbleToMint = _tokenTypes[id].allowListMerkleRoot == bytes32(0) ||
            allowlisted;

        if (_tokenTypes[id].price > 0) {
            require(
                msg.value >= _tokenTypes[id].price || allowlisted,
                "General: incorrect price or not approved"
            );
        } else {
            require(
                msg.value == 0,
                "General: sent value for non-payable token ID"
            );
        }

        require(isAbleToMint, "General: not approved to mint");

        _tokenTypes[id].usedSupply++;
        _hasMinted[to][id] = true;
        _mint(to, id, 1, bytes(""));
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(address(this).balance >= amount, "General: not enough balance");
        if (amount == 0) {
            amount = address(this).balance;
        }
        if (to == address(0)) {
            to = payable(msg.sender);
        }
        to.sendValue(amount);
    }
}
