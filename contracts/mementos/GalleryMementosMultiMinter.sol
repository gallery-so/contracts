// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract GalleryMementosMultiMinter is ERC1155, Ownable {
    using Address for address payable;

    struct TokenType {
        uint256 price;
        uint256 usedSupply;
        uint256 maxSupply;
        uint256 maxPerWallet;
        bytes32 allowListMerkleRoot;
        string uri;
    }

    bool public canMint;

    mapping(uint256 => TokenType) _tokenTypes;
    mapping(address => mapping(uint256 => uint256)) private _walletMints;

    string public constant name = "Gallery Mementos";
    string public constant symbol = "GM";

    constructor() ERC1155("") {}

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setTokenType(
        uint256 _id,
        uint256 _price,
        uint256 _maxSupply,
        uint256 _maxPerWallet,
        bytes32 _allowListMerkleRoot,
        string memory _uri
    ) public onlyOwner {
        _tokenTypes[_id] = TokenType(
            _price,
            _tokenTypes[_id].usedSupply,
            _maxSupply,
            _maxPerWallet,
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

    function getMaxMints(uint256 _id) public view returns (uint256) {
        return _tokenTypes[_id].maxPerWallet;
    }

    function getPrice(uint256 _id) public view returns (uint256) {
        return _tokenTypes[_id].price;
    }

    function uri(
        uint256 id
    ) public view virtual override returns (string memory) {
        return _tokenTypes[id].uri;
    }

    function mintToMany(
        uint256 id,
        address[] calldata _to,
        uint256[] calldata _quantities
    ) external onlyOwner {
        require(canMint, "Mementos: minting is disabled");
        require(_to.length == _quantities.length, "Mementos: length mismatch");
        require(bytes(_tokenTypes[id].uri).length > 0, "Mementos: no URI set");
        if (_tokenTypes[id].maxSupply > 0) {
            require(
                _to.length + _tokenTypes[id].usedSupply <
                    _tokenTypes[id].maxSupply,
                "Mementos: max supply reached"
            );
        }
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 amount = _quantities[i];
            if (_tokenTypes[id].maxPerWallet > 0) {
                require(
                    _walletMints[to][id] + amount <=
                        _tokenTypes[id].maxPerWallet,
                    "Mementos: max per wallet reached"
                );
            }
            _walletMints[to][id] += amount;
            _tokenTypes[id].usedSupply += amount;
            _mint(to, id, amount, "");
        }
    }

    function mint(
        uint256 id,
        address to,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external payable {
        require(canMint, "Mementos: minting is disabled");
        require(bytes(_tokenTypes[id].uri).length > 0, "Mementos: no URI set");
        if (_tokenTypes[id].maxSupply > 0) {
            require(
                _tokenTypes[id].usedSupply < _tokenTypes[id].maxSupply,
                "Mementos: max supply reached"
            );
        }

        bool allowlisted = MerkleProof.verify(
            merkleProof,
            _tokenTypes[id].allowListMerkleRoot,
            keccak256(abi.encodePacked(msg.sender))
        );

        bool isAbleToMint = _tokenTypes[id].allowListMerkleRoot == bytes32(0) ||
            allowlisted;

        if (_tokenTypes[id].price > 0) {
            require(
                msg.value >= _tokenTypes[id].price * amount || allowlisted,
                "Mementos: incorrect price or not approved"
            );
        } else {
            require(
                msg.value == 0,
                "Mementos: sent value for non-payable token ID"
            );
        }

        if (_tokenTypes[id].maxPerWallet > 0) {
            require(
                _walletMints[to][id] + amount <= _tokenTypes[id].maxPerWallet,
                "Mementos: max per wallet reached"
            );
        }

        require(isAbleToMint, "Mementos: not approved to mint");

        _walletMints[to][id] += amount;
        _tokenTypes[id].usedSupply += amount;
        _mint(to, id, amount, bytes(""));
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(
            address(this).balance >= amount,
            "Mementos: not enough balance"
        );
        if (amount == 0) {
            amount = address(this).balance;
        }
        if (to == address(0)) {
            to = payable(msg.sender);
        }
        to.sendValue(amount);
    }
}
