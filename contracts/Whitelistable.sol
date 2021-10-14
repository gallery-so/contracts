// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./StringUtils.sol";

contract Whitelistable {
    using Address for address;
    using StringUtils for string;

    enum Specification {
        ERC721,
        ERC20
    }

    struct WhitelistCheck {
        Specification specification;
        address tokenAddress;
    }
    mapping(uint256 => WhitelistCheck) private whitelist;

    function setWhitelistCheck(
        string memory specification,
        address tokenAddress,
        uint256 _id
    ) public virtual {
        require(tokenAddress.isContract(), "Token address must be a contract");
        whitelist[_id].specification = specificationByValue(specification);
        whitelist[_id].tokenAddress = tokenAddress;
    }

    function isWhitelisted(address wallet, uint256 _id)
        internal
        view
        returns (bool)
    {
        if (whitelist[_id].specification == Specification.ERC721) {
            IERC721 tokenContract = IERC721(whitelist[_id].tokenAddress);
            return tokenContract.balanceOf(wallet) > 0;
        } else if (whitelist[_id].specification == Specification.ERC20) {
            IERC20 tokenContract = IERC20(whitelist[_id].tokenAddress);
            return tokenContract.balanceOf(wallet) > 0;
        } else {
            revert("Not possible to get here");
        }
    }

    function specificationByValue(string memory value)
        private
        pure
        returns (Specification)
    {
        if (value.equal("ERC721") || value.equal("ERC-721")) {
            return Specification.ERC721;
        } else if (value.equal("ERC20") || value.equal("ERC-20")) {
            return Specification.ERC20;
        } else {
            revert("Unknown specification");
        }
    }
}
