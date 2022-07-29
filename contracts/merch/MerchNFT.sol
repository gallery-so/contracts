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
        uint256 maxPerWallet;
        uint256 usedPublicSupply;
        uint256 publicSupply;
        uint256 usedReserveSupply;
        uint256 reserveSupply;
        bytes32 allowlistMerkleRoot;
        string uri;
        string redeemedURI;
    }

    bool private canMint;

    mapping(uint256 => bool) private _redeemed;

    mapping(uint256 => MerchType) private _merchTypes;
    mapping(uint256 => mapping(address => uint256)) private _merchOwners;
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
        uint256 maxPerWallet,
        uint256 maxPublicSupply,
        uint256 maxReserveSupply,
        bytes32 allowListMerkleRoot,
        string calldata uri,
        string calldata redeemedURI
    ) public onlyOwner {
        _merchTypes[id] = MerchType(
            price,
            maxPerWallet,
            _merchTypes[id].usedPublicSupply,
            maxPublicSupply,
            _merchTypes[id].usedReserveSupply,
            maxReserveSupply,
            allowListMerkleRoot,
            uri,
            redeemedURI
        );
    }

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setMaxPerWallet(uint256 merchType, uint256 _maxPerWallet)
        public
        onlyOwner
    {
        _merchTypes[merchType].maxPerWallet = _maxPerWallet;
    }

    function setPrice(uint256 merchType, uint256 price) public onlyOwner {
        _merchTypes[merchType].price = price;
    }

    function setAllowlist(uint256 merchType, bytes32 merkleRoot)
        external
        onlyOwner
    {
        _merchTypes[merchType].allowlistMerkleRoot = merkleRoot;
    }

    function setPublicSupply(uint256 merchType, uint256 supply)
        public
        onlyOwner
    {
        _merchTypes[merchType].publicSupply = supply;
    }

    function setReserveSupply(uint256 merchType, uint256 supply)
        public
        onlyOwner
    {
        _merchTypes[merchType].reserveSupply = supply;
    }

    function mint(
        address to,
        uint256 merchType,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external payable {
        require(canMint, "Merch: minting is disabled");

        require(
            _merchTypes[merchType].allowlistMerkleRoot == bytes32(0) ||
                MerkleProof.verify(
                    merkleProof,
                    _merchTypes[merchType].allowlistMerkleRoot,
                    keccak256(abi.encodePacked(msg.sender))
                ),
            "Merch: not allowlisted"
        );

        require(
            _merchOwners[merchType][to] + amount <=
                _merchTypes[merchType].maxPerWallet ||
                _merchTypes[merchType].maxPerWallet == 0,
            "Merch: already owns max per wallet"
        );
        require(
            _merchTypes[merchType].usedPublicSupply + amount <=
                _merchTypes[merchType].publicSupply,
            "Merch: max supply reached"
        );

        _merchOwners[merchType][to] += amount;
        _merchTypes[merchType].usedPublicSupply += amount;
        for (uint256 i = 0; i < amount; i++) {
            _tokenIDToMerchType[_currentIndex + i] = merchType;
        }

        require(
            msg.value == _merchTypes[merchType].price * amount,
            "Merch: incorrect price"
        );

        _mint(to, amount, "", true);
    }

    function mintReserve(
        address[] calldata to,
        uint256[] calldata merchType,
        uint256[] calldata amount
    ) external payable onlyOwner {
        require(
            to.length == merchType.length && to.length == amount.length,
            "Merch: invalid parameters"
        );

        for (uint256 i = 0; i < to.length; i++) {
            require(
                _merchOwners[merchType[i]][to[i]] + amount[i] <=
                    _merchTypes[merchType[i]].maxPerWallet ||
                    _merchTypes[merchType[i]].maxPerWallet == 0,
                "Merch: already owns max per wallet"
            );
            require(
                _merchTypes[merchType[i]].usedReserveSupply + amount[i] <=
                    _merchTypes[merchType[i]].reserveSupply,
                "Merch: max supply reached"
            );
            _merchOwners[merchType[i]][to[i]] += amount[i];
            _merchTypes[merchType[i]].usedReserveSupply += amount[i];
            for (uint256 j = 0; j < amount[i]; j++) {
                _tokenIDToMerchType[_currentIndex + j] = merchType[i];
            }

            _mint(to[i], amount[i], "", true);
        }
    }

    function redeem(uint256[] calldata tokenIDs) external {
        for (uint256 i = 0; i < tokenIDs.length; i++) {
            require(ownerOf(tokenIDs[i]) == msg.sender, "Merch: not owner");
            _redeemed[tokenIDs[i]] = true;
        }
    }

    function redeemAdmin(uint256[] calldata tokenIDs) external onlyOwner {
        for (uint256 i = 0; i < tokenIDs.length; i++) {
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
