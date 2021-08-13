// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract Redeemable {
    event Redeem(address indexed redeemer, uint256 indexed tokenID);

    mapping(uint256 => address) private _redeemed;

    function isRedeemed(uint256 _tokenID) public view returns (bool) {
        return _redeemed[_tokenID] != address(0);
    }

    function isRedeemedBy(uint256 tokenID, address redeemer)
        public
        view
        returns (bool)
    {
        return _redeemed[tokenID] == redeemer;
    }

    function redeem(uint256 _tokenID) public virtual {
        require(_redeemed[_tokenID] == address(0));
        _redeemed[_tokenID] = msg.sender;
        emit Redeem(msg.sender, _tokenID);
    }
}
