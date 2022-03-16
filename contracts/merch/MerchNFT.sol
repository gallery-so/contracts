// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721A.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerchNFTs is ERC721A, Ownable {
    using Address for address payable;

    struct MerchType {
        uint256 price;
        uint256 usedSupply;
        uint256 maxSupply;
        uint256 maxPerWallet;
        string uri;
        string redeemedURI;
    }

    bool private canMint;

    bytes32 private _allowlistMerkleRoot;

    mapping(uint256 => bool) private _redeemed;

    mapping(uint256 => MerchType) private _merchTypes;
    mapping(address => uint256) private _merchOwners;
    mapping(uint256 => uint256) private _tokenIDToMerchType;

    constructor() ERC721A("Gallery Merch NFTs", "GMS") {}

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (_redeemed[tokenId]) {
            return _merchTypes[_tokenIDToMerchType[tokenId]].redeemedURI;
        } else {
            return _merchTypes[_tokenIDToMerchType[tokenId]].uri;
        }
    }

    function setMerchType(
        uint256 id,
        uint256 price,
        uint256 maxSupply,
        uint256 maxPerWallet,
        string calldata uri,
        string calldata redeemedURI
    ) public onlyOwner {
        _merchTypes[id] = MerchType(
            price,
            0,
            maxSupply,
            maxPerWallet,
            uri,
            redeemedURI
        );
    }

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setPrice(uint256 merchType, uint256 price) public onlyOwner {
        _merchTypes[merchType].price = price;
    }

    function setAllowlist(bytes32 merkleRoot) external onlyOwner {
        _allowlistMerkleRoot = merkleRoot;
    }

    function setMaxSupply(uint256 merchType, uint256 supply) public onlyOwner {
        _merchTypes[merchType].maxSupply = supply;
    }

    function mint(
        address to,
        uint256 merchType,
        bytes32[] calldata merkleProof
    ) external payable {
        require(canMint, "Merch: minting is disabled");
        require(
            _merchTypes[merchType].usedSupply <
                _merchTypes[merchType].maxSupply,
            "Merch: total supply used up"
        );
        require(
            _merchOwners[to] < _merchTypes[merchType].maxPerWallet ||
                _merchTypes[merchType].maxPerWallet == 0,
            "Merch: already owns max per wallet"
        );

        bool allowlisted = MerkleProof.verify(
            merkleProof,
            _allowlistMerkleRoot,
            keccak256(abi.encodePacked(msg.sender, merchType))
        );

        bool isAbleToMint = _allowlistMerkleRoot == bytes32(0) || allowlisted;

        if (_merchTypes[merchType].price > 0) {
            require(
                msg.value >= _merchTypes[merchType].price,
                "Merch: incorrect price or not approved"
            );
            isAbleToMint = true;
        } else {
            require(msg.value == 0, "Merch: sent value for non-payable merch");
        }

        require(isAbleToMint, "Merch: not approved to mint");

        _merchTypes[merchType].usedSupply++;
        _merchOwners[to]++;
        _tokenIDToMerchType[_currentIndex] = merchType;
        _mint(to, 1, "", true);
    }

    function redeem(uint256 tokenID) external {
        require(_redeemed[tokenID] == false, "Merch: token already redeemed");
        _redeemed[tokenID] = true;
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(address(this).balance >= amount, "Merch: not enough balance");
        if (amount == 0) {
            amount = address(this).balance;
        }
        if (to == address(0)) {
            to = payable(msg.sender);
        }
        to.sendValue(amount);
    }
}
