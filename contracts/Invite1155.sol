// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155.sol";
import "./Whitelistable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Invite1155 is ERC1155, Ownable, Whitelistable, ReentrancyGuard {
    using Strings for uint256;
    using Address for address payable;

    constructor(string memory _name, string memory _symbol) ERC1155("") {
        name = _name;
        symbol = _symbol;
    }

    struct TokenType {
        string uri;
        uint256 price;
        uint256 usedSupply;
        uint256 totalSupply;
    }

    mapping(uint256 => TokenType) _tokenTypes;
    mapping(uint256 => mapping(address => bool)) private _mintApprovals;
    mapping(address => mapping(uint256 => bool)) private _hasMinted;

    bool private canMint;

    string public name;
    string public symbol;

    function createType(
        uint256 _id,
        string memory _uri,
        uint256 _price,
        uint256 _totalSupply
    ) public onlyOwner {
        require(
            _tokenTypes[_id].totalSupply == 0,
            "Invite: type already defined"
        );
        require(
            _totalSupply > 0,
            "Invite: must set an above zero total supply"
        );
        require(bytes(_uri).length > 0, "Invite: must set a URI");
        TokenType memory tokenType;
        tokenType.uri = _uri;
        tokenType.price = _price;
        tokenType.usedSupply = 0;
        tokenType.totalSupply = _totalSupply;
        _tokenTypes[_id] = tokenType;
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

    function getUsedSupply(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].usedSupply;
    }

    function getTotalSupply(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].totalSupply;
    }

    function getPrice(uint256 id) public view returns (uint256) {
        return _tokenTypes[id].price;
    }

    function mintToMany(address[] calldata _to, uint256 _id)
        external
        onlyOwner
    {
        require(
            _tokenTypes[_id].usedSupply + _to.length <
                _tokenTypes[_id].totalSupply,
            "Invite: total supply used up"
        );
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            require(
                !_hasMinted[to][_id] && balanceOf(to, _id) == 0,
                "Invite: cannot own more than one of an Invite"
            );
            _tokenTypes[_id].usedSupply++;
            _hasMinted[to][_id] = true;
            _mint(to, _id, 1, "");
        }
    }

    function mint(address to, uint256 id) external payable nonReentrant {
        require(canMint, "Invite: minting is disabled");
        require(
            _tokenTypes[id].usedSupply + 1 < _tokenTypes[id].totalSupply,
            "Invite: total supply used up"
        );
        require(
            balanceOf(to, id) == 0 && !_hasMinted[to][id],
            "Invite: cannot own more than one of an Invite"
        );
        if (_tokenTypes[id].price > 0) {
            require(
                msg.value >= _tokenTypes[id].price ||
                    (_mintApprovals[id][to] || isWhitelisted(to, id)),
                "Invite: not whitelisted and msg.value is not correct price"
            );
        } else {
            require(
                _mintApprovals[id][to] || isWhitelisted(to, id),
                "Invite: not approved to mint"
            );
            require(
                msg.value == 0,
                "Invite: sent value for non-payable token ID"
            );
        }
        _mintApprovals[id][to] = false;
        _tokenTypes[id].usedSupply++;
        _hasMinted[to][id] = true;
        _mint(to, id, 1, bytes(""));
    }

    function setMintApproval(
        address spender,
        bool value,
        uint256 id
    ) external onlyOwner {
        _mintApprovals[id][spender] = value;
    }

    function setMintApprovals(
        address[] calldata spenders,
        bool[] calldata values,
        uint256 id
    ) external onlyOwner {
        require(
            spenders.length == values.length,
            "Invite: spender and amounts arrays must be the same length"
        );
        for (uint256 i = 0; i < spenders.length; ++i) {
            _mintApprovals[id][spenders[i]] = values[i];
        }
    }

    function isMintApproved(address spender, uint256 id)
        external
        view
        returns (bool)
    {
        return _mintApprovals[id][spender];
    }

    function canMintToken(address minter, uint256 id)
        external
        view
        returns (bool)
    {
        return
            _tokenTypes[id].price > 0 ||
            _mintApprovals[id][minter] ||
            isWhitelisted(minter, id);
    }

    function setWhitelistCheck(
        string memory specification,
        address tokenAddress,
        uint256 _id
    ) public virtual override onlyOwner {
        super.setWhitelistCheck(specification, tokenAddress, _id);
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(address(this).balance >= amount, "Invite: not enough balance");
        if (amount == 0) {
            amount = address(this).balance;
        }
        if (to == address(0)) {
            to = payable(msg.sender);
        }
        to.sendValue(amount);
    }
}
