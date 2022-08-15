// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721A.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract GalleryMerch is ERC721A, Ownable, EIP712 {
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
    mapping(address => uint256) private _transferNonces;

    constructor() ERC721A("Gallery Merch", "GM") EIP712("GalleryMerch", "0") {}

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

    function getPublicSupply(uint256 merchType) public view returns (uint256) {
        return _merchTypes[merchType].publicSupply;
    }

    function getReserveSupply(uint256 merchType) public view returns (uint256) {
        return _merchTypes[merchType].reserveSupply;
    }

    function getUsedPublicSupply(uint256 merchType)
        public
        view
        returns (uint256)
    {
        return _merchTypes[merchType].usedPublicSupply;
    }

    function getPrice(uint256 merchType) public view returns (uint256) {
        return _merchTypes[merchType].price;
    }

    function balanceOfType(uint256 merchType, address owner)
        public
        view
        returns (uint256)
    {
        return _merchOwners[merchType][owner];
    }

    function isAllowlistOnly(uint256 merchType) public view returns (bool) {
        return _merchTypes[merchType].allowlistMerkleRoot != 0;
    }

    function getUsedReserveSupply(uint256 merchType)
        public
        view
        returns (uint256)
    {
        return _merchTypes[merchType].usedReserveSupply;
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

    function getTransferNonce(address owner) public view returns (uint256) {
        return _transferNonces[owner];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(!_redeemed[tokenId], "Cannot transfer a redeemed token");
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(!_redeemed[tokenId], "Cannot transfer a redeemed token");
        super.safeTransferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(!_redeemed[tokenId], "Cannot transfer a redeemed token");
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    function approvedTransfer(
        address to,
        uint256 tokenId,
        bytes memory signature,
        uint256 deadline
    ) public virtual {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "ApprovedTransfer(address from,uint256 tokenId,uint256 nonce,uint256 deadline)"
                    ),
                    msg.sender,
                    tokenId,
                    _transferNonces[msg.sender],
                    deadline
                )
            )
        );

        address signer = ECDSA.recover(digest, signature);
        require(signer == to, "ApprovedTransfer: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");

        require(
            block.timestamp < deadline,
            "ApprovedTransfer: signed transaction expired"
        );
        _transferNonces[msg.sender]++;

        super.safeTransferFrom(msg.sender, to, tokenId);
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
