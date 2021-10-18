// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155.sol";
import "./Whitelistable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Invite1155 is ERC1155, Ownable, Whitelistable {
    using Strings for uint256;
    using Address for address payable;

    constructor(
        string memory tokenURI,
        string memory _name,
        string memory _symbol
    ) ERC1155(tokenURI) {
        name = _name;
        symbol = _symbol;
    }

    mapping(uint256 => mapping(address => bool)) private _mintApprovals;
    mapping(uint256 => uint256) private _tokenSupply;
    mapping(uint256 => uint256) private _usedSupply;
    mapping(uint256 => uint256) private _prices;

    bool private canMint;

    string public name;
    string public symbol;

    function uri(uint256 it)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory id = it.toString();
        return strConcat(super.uri(it), id, ".json");
    }

    function setCanMint(bool _canMint) public onlyOwner {
        canMint = _canMint;
    }

    function setPrice(uint256 id, uint256 price) public onlyOwner {
        require(price > 0);
        _prices[id] = price;
    }

    function setTotalSupply(uint256 id, uint256 supply) public onlyOwner {
        require(supply > 0, "Supply must be greater than 0");
        require(_tokenSupply[id] == 0, "Total supply already set");
        _tokenSupply[id] = supply;
    }

    function getUsedSupply(uint256 id) public view returns (uint256) {
        return _usedSupply[id];
    }

    function getTotalSupply(uint256 id) public view returns (uint256) {
        return _tokenSupply[id];
    }

    function mintToMany(address[] calldata _to, uint256 _id)
        external
        onlyOwner
    {
        require(_usedSupply[_id] + _to.length < _tokenSupply[_id]);
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            require(
                balanceOf(to, _id) == 0,
                "Invite: cannot own more than one of an Invite"
            );
            _usedSupply[_id]++;
            _mint(to, _id, 1, "");
        }
    }

    function mint(address to, uint256 id) external payable {
        require(canMint, "Minting is disabled");
        require(_usedSupply[id] + 1 < _tokenSupply[id]);
        require(
            balanceOf(to, id) == 0,
            "Invite: cannot own more than one of an Invite"
        );
        if (_prices[id] > 0) {
            require(
                msg.value >= _prices[id] ||
                    (_mintApprovals[id][_msgSender()] ||
                        isWhitelisted(_msgSender(), id)),
                "Invite: not whitelisted and msg.value is not correct price"
            );
        } else {
            require(
                _mintApprovals[id][_msgSender()] ||
                    isWhitelisted(_msgSender(), id),
                "Invite: not approved to mint"
            );
        }
        _mintApprovals[id][_msgSender()] = false;
        _usedSupply[id]++;
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
        address[] calldata spender,
        bool[] calldata values,
        uint256 id
    ) external onlyOwner {
        require(
            spender.length == values.length,
            "Invite: spender and amounts arrays must be the same length"
        );
        for (uint256 i = 0; i < spender.length; ++i) {
            _mintApprovals[id][spender[i]] = values[i];
        }
    }

    function isMintApproved(address spender, uint256 id)
        external
        view
        returns (bool)
    {
        return _mintApprovals[id][spender];
    }

    function setWhitelistCheck(
        string memory specification,
        address tokenAddress,
        uint256 _id
    ) public virtual override onlyOwner {
        super.setWhitelistCheck(specification, tokenAddress, _id);
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        if (amount == 0) {
            amount = address(this).balance;
        }
        if (to == address(0)) {
            to = payable(msg.sender);
        }
        to.sendValue(amount);
    }

    function strConcat(
        string memory _a,
        string memory _b,
        string memory _c,
        string memory _d,
        string memory _e
    ) internal pure returns (string memory) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(
            _ba.length + _bb.length + _bc.length + _bd.length + _be.length
        );
        bytes memory babcde = bytes(abcde);
        uint256 k = 0;
        for (uint256 i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (uint256 i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (uint256 i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (uint256 i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (uint256 i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(
        string memory _a,
        string memory _b,
        string memory _c
    ) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }
}
