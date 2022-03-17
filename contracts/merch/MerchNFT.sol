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
        string uri;
        string redeemedURI;
    }

    bool private canMint;

    uint256 public maxPerWallet = 5;

    bytes32 private _allowlistMerkleRoot;

    mapping(uint256 => bool) private _redeemed;

    mapping(uint256 => MerchType) private _merchTypes;
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
        string calldata uri,
        string calldata redeemedURI
    ) public onlyOwner {
        _merchTypes[id] = MerchType(price, 0, maxSupply, uri, redeemedURI);
    }

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setMaxPerWallet(uint256 _maxPerWallet) public onlyOwner {
        maxPerWallet = _maxPerWallet;
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
        uint256[] memory merchTypes,
        bytes32[] calldata merkleProof
    ) external payable {
        require(canMint, "Merch: minting is disabled");
        require(
            _numberMinted(to) + merchTypes.length < maxPerWallet ||
                maxPerWallet == 0,
            "Merch: already owns max per wallet"
        );

        require(
            _allowlistMerkleRoot == bytes32(0) ||
                MerkleProof.verify(
                    merkleProof,
                    _allowlistMerkleRoot,
                    keccak256(abi.encodePacked(msg.sender))
                ),
            "Merch: not allowlisted"
        );

        uint256 totalPrice = 0;
        for (uint256 i = 0; i < merchTypes.length; i++) {
            uint256 mt = merchTypes[i];
            require(
                _merchTypes[mt].usedSupply < _merchTypes[mt].maxSupply,
                "Merch: max supply reached"
            );
            totalPrice += _merchTypes[mt].price;
            _merchTypes[mt].usedSupply++;
            _tokenIDToMerchType[_currentIndex + i] = mt;
        }

        require(msg.value >= totalPrice, "Merch: incorrect price");

        _mint(to, merchTypes.length, "", true);
    }

    function redeem(uint256[] calldata tokenIDs) external {
        for (uint256 i = 0; i < tokenIDs.length; i++) {
            require(
                _redeemed[tokenIDs[i]] == false,
                "Merch: token already redeemed"
            );
            require(ownerOf(tokenIDs[i]) == msg.sender, "Merch: not owner");
            _redeemed[tokenIDs[i]] = true;
        }
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
