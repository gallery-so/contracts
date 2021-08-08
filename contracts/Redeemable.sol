// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Redeemable {
    mapping(uint256 => address) private _redeemed;

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
