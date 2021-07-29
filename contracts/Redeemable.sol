// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Redeemable {
    mapping(uint256 => bool) private _redeemedTokens;
    mapping(uint256 => address) private _redeemables;

    modifier mustNotBeRedeemed(uint256 tokenId) {
        require(!_redeemedTokens[tokenId]);
        _;
    }

    modifier mustBeRedeemed(uint256 tokenId) {
        require(_redeemedTokens[tokenId]);
        _;
    }

    function isRedeemed(uint256 _tokenId) public view returns (bool) {
        return _redeemedTokens[_tokenId];
    }

    function redeem(uint256 _tokenId) public {
        require(_redeemables[_tokenId] == msg.sender);
        require(!_redeemedTokens[_tokenId]);
        _redeemedTokens[_tokenId] = true;
    }
}
