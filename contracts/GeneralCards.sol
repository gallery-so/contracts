// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "hardhat/console.sol";

contract GeneralCards is
    ERC1155,
    IERC721Receiver,
    IERC1155Receiver,
    Ownable,
    ReentrancyGuard
{
    using Strings for uint256;
    using Address for address payable;

    struct TokenType {
        uint256 price;
        uint256 usedSupply;
        uint256 totalSupply;
        bytes32 merkleRoot;
        string uri;
    }

    bool private canMint;

    mapping(uint256 => TokenType) _tokenTypes;
    mapping(uint256 => bytes32) private _mintApprovals;
    mapping(address => mapping(uint256 => bool)) private _hasMinted;

    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol) ERC1155("") {
        name = _name;
        symbol = _symbol;
    }

    function createType(
        uint256 _id,
        uint256 _price,
        uint256 _totalSupply,
        bytes32 _merkleRoot,
        string memory _uri
    ) public onlyOwner {
        require(
            _tokenTypes[_id].totalSupply == 0,
            "General: type already defined"
        );
        require(
            _totalSupply > 0,
            "General: must set an above zero total supply"
        );
        require(bytes(_uri).length > 0, "General: must set a URI");
        _tokenTypes[_id] = TokenType(
            _price,
            0,
            _totalSupply,
            _merkleRoot,
            _uri
        );
    }

    function uri(uint256 it)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _tokenTypes[it].uri;
    }

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setPrice(uint256 id, uint256 price) public onlyOwner {
        _tokenTypes[id].price = price;
    }

    function setMerkleRoot(uint256 id, bytes32 merkleRoot) public onlyOwner {
        _tokenTypes[id].merkleRoot = merkleRoot;
    }

    function getUsedSupply(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].usedSupply;
    }

    function getTotalSupply(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].totalSupply;
    }

    function getPrice(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].price;
    }

    function getMerkleRoot(uint256 id) public view returns (bytes32) {
        return _tokenTypes[id].merkleRoot;
    }

    function mintToMany(address[] calldata _to, uint256 _id)
        external
        onlyOwner
    {
        require(
            _tokenTypes[_id].usedSupply + _to.length <
                _tokenTypes[_id].totalSupply,
            "General: total supply used up"
        );
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            require(
                !_hasMinted[to][_id] && balanceOf(to, _id) == 0,
                "General: cannot own more than one of a General Card"
            );
            _tokenTypes[_id].usedSupply++;
            _hasMinted[to][_id] = true;
            _mint(to, _id, 1, "");
        }
    }

    function mint(
        address to,
        uint256 id,
        uint256 whitelistedTokenID,
        bytes calldata encodedData,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        require(canMint, "General: minting is disabled");
        require(
            _tokenTypes[id].usedSupply < _tokenTypes[id].totalSupply,
            "General: total supply used up"
        );
        require(
            balanceOf(to, id) == 0 && !_hasMinted[to][id],
            "General: cannot own more than one of a General Card"
        );

        bool isAbleToMint = MerkleProof.verify(
            merkleProof,
            _mintApprovals[id],
            keccak256(abi.encodePacked(to))
        );

        if (_tokenTypes[id].price > 0) {
            require(
                msg.value >= _tokenTypes[id].price || isAbleToMint,
                "General: incorrect price or not approved"
            );
        } else {
            require(
                msg.value == 0,
                "General: sent value for non-payable token ID"
            );
        }

        if (!isAbleToMint) {
            require(
                MerkleProof.verify(
                    merkleProof,
                    _tokenTypes[id].merkleRoot,
                    keccak256(encodedData)
                ),
                "General: invalid card data"
            );

            (
                address whitelistedContract,
                uint256 whitelistedTokenIDsStart,
                uint256 whitelistedTokenIDsEnd,
                uint256 whitelistedAmount,
                uint256 whitelistType
            ) = abi.decode(
                    encodedData,
                    (address, uint256, uint256, uint256, uint256)
                );

            if (whitelistType == 1 || whitelistType == 2) {
                require(
                    whitelistedTokenID <= whitelistedTokenIDsEnd &&
                        whitelistedTokenID >= whitelistedTokenIDsStart,
                    "General: token ID out of range"
                );
            }

            if (whitelistType == 0) {
                require(
                    IERC721(whitelistedContract).balanceOf(to) >=
                        whitelistedAmount,
                    "General: not whitelisted"
                );
            } else if (whitelistType == 1) {
                require(
                    IERC721(whitelistedContract).ownerOf(whitelistedTokenID) ==
                        to,
                    "General: not whitelisted"
                );
            } else if (whitelistType == 2) {
                require(
                    IERC1155(whitelistedContract).balanceOf(
                        to,
                        whitelistedTokenID
                    ) >= whitelistedAmount,
                    "General: not whitelisted"
                );
            } else if (whitelistType == 3) {
                require(
                    IERC20(whitelistedContract).balanceOf(to) >=
                        whitelistedAmount,
                    "General: not whitelisted"
                );
            }
            isAbleToMint = true;
        }

        require(isAbleToMint, "General: not approved to mint");

        _tokenTypes[id].usedSupply++;
        _hasMinted[to][id] = true;
        _mint(to, id, 1, bytes(""));
    }

    function setMintApprovals(uint256 id, bytes32 merkleRoot)
        external
        onlyOwner
    {
        _mintApprovals[id] = merkleRoot;
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

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC721Receiver(this).onERC721Received.selector;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC1155Receiver(this).onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC1155Receiver(this).onERC1155BatchReceived.selector;
    }
}
