// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Redeemable {
    mapping(uint256 => address) private _redeemed;

    modifier mustNotBeRedeemed(uint256 tokenId) {
        require(_redeemed[tokenId] == address(0));
        _;
    }

    modifier mustBeRedeemed(uint256 tokenId) {
        require(_redeemed[tokenId] != address(0));
        _;
    }

    modifier mustBeRedeemedBy(uint256 tokenId, address by) {
        require(_redeemed[tokenId] == by);
        _;
    }

    function isRedeemed(uint256 _tokenId) public view returns (bool) {
        return _redeemed[_tokenId] != address(0);
    }

    function isRedeemedBy(uint256 tokenId, address redeemer)
        public
        view
        returns (bool)
    {
        return _redeemed[tokenId] == redeemer;
    }

    function redeem(uint256 _tokenId) public virtual {
        require(_redeemed[_tokenId] == address(0));
        _redeemed[_tokenId] = msg.sender;
    }
}
