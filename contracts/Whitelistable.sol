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
        ERC1155,
        ERC20
    }

    struct WhitelistCheck {
        Specification specification;
        address tokenAddress;
        uint256 tokenID;
    }

    WhitelistCheck private whitelistCheck;

    function setWhitelistCheck(
        string memory specification,
        address tokenAddress,
        uint256 tokenID
    ) public virtual {
        require(tokenAddress.isContract(), "Token address must be a contract");
        whitelistCheck.specification = specificationByValue(specification);
        whitelistCheck.tokenAddress = tokenAddress;
        whitelistCheck.tokenID = tokenID;
    }

    function isWhitelisted(address wallet) internal view returns (bool) {
        if (whitelistCheck.specification == Specification.ERC721) {
            IERC721 tokenContract = IERC721(whitelistCheck.tokenAddress);
            return tokenContract.balanceOf(wallet) > 0;
        } else if (whitelistCheck.specification == Specification.ERC1155) {
            IERC1155 tokenContract = IERC1155(whitelistCheck.tokenAddress);
            return tokenContract.balanceOf(wallet, whitelistCheck.tokenID) > 0;
        } else if (whitelistCheck.specification == Specification.ERC20) {
            IERC20 tokenContract = IERC20(whitelistCheck.tokenAddress);
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
        } else if (value.equal("ERC1155") || value.equal("ERC-1155")) {
            return Specification.ERC1155;
        } else if (value.equal("ERC20") || value.equal("ERC-20")) {
            return Specification.ERC20;
        } else {
            revert("Unknown specification");
        }
    }
}
