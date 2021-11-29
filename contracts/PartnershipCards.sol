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
import "hardhat/console.sol";

contract PartnershipCards is ERC1155, Ownable, ReentrancyGuard {
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
            "Partnership: type already defined"
        );
        require(
            _totalSupply > 0,
            "Partnership: must set an above zero total supply"
        );
        require(bytes(_uri).length > 0, "Partnership: must set a URI");
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

    function mint(
        address to,
        uint256 id,
        address whitelistedContract,
        uint256 whitelistedTokenID,
        uint256 whitelistedAmount,
        uint256 whitelistedContractType,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        require(canMint, "Invite: minting is disabled");
        require(
            _tokenTypes[id].usedSupply < _tokenTypes[id].totalSupply,
            "Partnership: total supply used up"
        );
        require(
            balanceOf(to, id) == 0 && !_hasMinted[to][id],
            "Partnership: cannot own more than one of an Invite"
        );
        if (_tokenTypes[id].price > 0) {
            require(
                msg.value >= _tokenTypes[id].price,
                "Partnership: incorrect price"
            );
        }

        bytes memory nodePreHash = abi.encode(
            whitelistedContract,
            whitelistedTokenID,
            whitelistedAmount,
            whitelistedContractType
        );
        bytes32 node = keccak256(nodePreHash);

        require(
            MerkleProof.verify(merkleProof, _tokenTypes[id].merkleRoot, node),
            "Partnership: invalid partnership"
        );
        if (whitelistedContractType == 0) {
            require(
                IERC721(whitelistedContract).ownerOf(whitelistedTokenID) ==
                    msg.sender,
                "Partnership: not whitelisted"
            );
        } else if (whitelistedContractType == 1) {
            require(
                IERC1155(whitelistedContract).balanceOf(
                    to,
                    whitelistedTokenID
                ) >= whitelistedAmount,
                "Partnership: not whitelisted"
            );
        } else if (whitelistedContractType == 2) {
            require(
                IERC20(whitelistedContract).balanceOf(to) >= whitelistedAmount,
                "Partnership: not whitelisted"
            );
        }
        _tokenTypes[id].usedSupply++;
        _hasMinted[to][id] = true;
        _mint(to, id, 1, bytes(""));
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(
            address(this).balance >= amount,
            "Partnership: not enough balance"
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
