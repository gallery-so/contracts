// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155.sol";
import "./Whitelistable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Invite1155 is ERC1155, Ownable, Whitelistable {
    using Strings for uint256;

    constructor(
        string memory tokenURI,
        string memory _name,
        string memory _symbol
    ) ERC1155(tokenURI) {
        name = _name;
        symbol = _symbol;
    }

    mapping(uint256 => mapping(address => uint256)) private _mintApprovals;

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

    function mintToMany(
        address[] calldata _to,
        uint256[] calldata _quantities,
        uint256 _id
    ) external onlyOwner {
        for (uint256 i = 0; i < _to.length; ++i) {
            address to = _to[i];
            uint256 quantity = _quantities[i];
            _mint(to, _id, quantity, "");
        }
    }

    function mint(
        address to,
        uint256 amount,
        uint256 id
    ) external {
        require(canMint, "Minting is disabled");
        require(
            _mintApprovals[id][_msgSender()] >= amount ||
                isWhitelisted(_msgSender()),
            "Invite: not approved to mint"
        );
        _mint(to, id, amount, bytes(""));
    }

    function setMintApproval(
        address spender,
        uint256 amount,
        uint256 id
    ) external onlyOwner {
        _mintApprovals[id][spender] = amount;
    }

    function setMintApprovals(
        address[] calldata spender,
        uint256[] calldata amounts,
        uint256 id
    ) external onlyOwner {
        require(
            spender.length == amounts.length,
            "Invite: spender and amounts arrays must be the same length"
        );
        for (uint256 i = 0; i < spender.length; ++i) {
            _mintApprovals[id][spender[i]] = amounts[i];
        }
    }

    function getMintApproval(address spender, uint256 id)
        external
        view
        returns (uint256)
    {
        return _mintApprovals[id][spender];
    }

    function setWhitelistCheck(
        string memory specification,
        address tokenAddress
    ) public virtual override onlyOwner {
        super.setWhitelistCheck(specification, tokenAddress);
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
        string memory _c,
        string memory _d
    ) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(
        string memory _a,
        string memory _b,
        string memory _c
    ) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(string memory _a, string memory _b)
        internal
        pure
        returns (string memory)
    {
        return strConcat(_a, _b, "", "", "");
    }
}
