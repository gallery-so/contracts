// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IMarketplace.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Marketplace is IMarketplace, ReentrancyGuard {
    using Address for address payable;

    mapping(address => mapping(uint256 => Listing)) private listings;
    mapping(address => mapping(uint256 => Auction)) private auctions;
    mapping(address => mapping(uint256 => Offer[])) private offers;

    IERC20 private constant wethContract =
        IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    uint256 private constant minAuctionTime = 1 hours;

    function makeOffer(
        uint256 value,
        uint256 amount,
        uint256 tokenID,
        address tokenContract
    ) external override nonReentrant {
        require(
            value > 0 && amount > 0,
            "Marketplace: invalid offer amount or price"
        );
        require(
            wethContract.allowance(msg.sender, address(this)) > amount,
            "Marketplace: Not enough WETH approved for offer"
        );
        uint256 len = offers[tokenContract][tokenID].length;
        if (len > 0) {
            require(
                offers[tokenContract][tokenID][len - 1].value < value,
                "Marketplace: Cannot place lower offer than previous offer"
            );
        }
        Auction memory auction = auctions[tokenContract][tokenID];
        require(
            auction.amount == 0 || auction.amount == amount,
            "Marketplace: wrong amount for purchase at auction"
        );
        require(
            auction.end == 0 || auction.end > block.timestamp,
            "Marketplace: auction ended"
        );
        require(
            auction.startingBid == 0 || auction.startingBid < value,
            "Marketplace: bid too low for auction"
        );
        if (amount == listings[tokenContract][tokenID].amount) {
            require(
                listings[tokenContract][tokenID].price > value,
                "Marketplace: purchase instead of offer"
            );
        }
        offers[tokenContract][tokenID].push(Offer(value, amount, msg.sender));
    }

    function recallOffer(uint256 tokenID, address tokenContract)
        external
        override
    {
        require(
            auctions[tokenContract][tokenID].end == 0 ||
                auctions[tokenContract][tokenID].end > block.timestamp,
            "Marketplace: auction ended"
        );
        for (uint256 i = 0; i < offers[tokenContract][tokenID].length; i++) {
            if (offers[tokenContract][tokenID][i].bidder == msg.sender) {
                delete offers[tokenContract][tokenID][i];
            }
        }
    }

    function acceptCurrentOffer(uint256 tokenID, address tokenContract)
        external
        override
        nonReentrant
    {
        require(
            auctions[tokenContract][tokenID].end == 0,
            "Marketplace: auction in progress"
        );

        uint256 len = offers[tokenContract][tokenID].length;
        require(len > 0, "Marketplace: no offers");
        Offer memory curOffer = offers[tokenContract][tokenID][len - 1];
        require(curOffer.amount > 0 && curOffer.bidder != address(0));
        transferToken(
            tokenID,
            tokenContract,
            curOffer.amount,
            msg.sender,
            curOffer.bidder
        );

        wethContract.transferFrom(curOffer.bidder, msg.sender, curOffer.value);
    }

    function listToken(
        uint256 tokenID,
        address tokenContract,
        uint256 price,
        uint256 amount
    ) external override {
        require(
            auctions[tokenContract][tokenID].end == 0,
            "Marketplace: auction in progress"
        );

        requireControlToken(tokenID, tokenContract, amount);

        listings[tokenContract][tokenID].price = price;
        listings[tokenContract][tokenID].amount = amount;
    }

    function purchaseToken(uint256 tokenID, address tokenContract)
        external
        payable
        override
        nonReentrant
    {
        Listing memory listing = listings[tokenContract][tokenID];
        require(listing.amount > 0, "Marketplace: no listing");
        require(
            msg.value == listings[tokenContract][tokenID].price,
            "Marketplace: wrong price"
        );
        address payable seller = payable(
            listings[tokenContract][tokenID].seller
        );

        transferToken(
            tokenID,
            tokenContract,
            listing.amount,
            listing.seller,
            msg.sender
        );

        seller.sendValue(msg.value);
    }

    function startAuction(
        uint256 tokenID,
        address tokenContract,
        uint256 end,
        uint256 startingBid,
        uint256 amount
    ) external override {
        require(
            listings[tokenContract][tokenID].amount == 0,
            "Marketplace: listed already"
        );
        require(
            end - minAuctionTime > block.timestamp,
            "Marketplace: auction too short"
        );
        requireControlToken(tokenID, tokenContract, amount);
        auctions[tokenContract][tokenID] = Auction(
            end,
            amount,
            msg.sender,
            startingBid
        );
    }

    function endAuction(uint256 tokenID, address tokenContract)
        external
        override
        nonReentrant
    {
        Auction memory auction = auctions[tokenContract][tokenID];
        require(auction.end < block.timestamp, "Marketplace: auction ended");
        uint256 len = offers[tokenContract][tokenID].length;
        require(len > 0, "Marketplace: no offers");
        Offer memory curOffer = offers[tokenContract][tokenID][len - 1];
        transferToken(
            tokenID,
            tokenContract,
            auction.amount,
            auction.seller,
            curOffer.bidder
        );
        wethContract.transferFrom(
            curOffer.bidder,
            auction.seller,
            curOffer.value
        );
    }

    function requireControlToken(
        uint256 tokenID,
        address tokenContract,
        uint256 amount
    ) private view {
        IERC165 erc165 = IERC165(tokenContract);

        if (erc165.supportsInterface(type(IERC721).interfaceId)) {
            require(amount == 1, "Marketplace: can only list one of an NFT");
            IERC721 token = IERC721(tokenContract);
            require(
                token.ownerOf(tokenID) == msg.sender,
                "Marketplace: not owner"
            );
            require(
                token.isApprovedForAll(msg.sender, address(this)),
                "Marketplace: not approved"
            );
        } else if (erc165.supportsInterface(type(IERC1155).interfaceId)) {
            IERC1155 token = IERC1155(tokenContract);
            require(
                token.balanceOf(msg.sender, tokenID) >= amount,
                "Marketplace: not enough tokens"
            );
            require(
                token.isApprovedForAll(msg.sender, address(this)),
                "Marketplace: not approved"
            );
        } else {
            revert("Marketplace: unsupported token type");
        }
    }

    function transferToken(
        uint256 tokenID,
        address tokenContract,
        uint256 amount,
        address from,
        address to
    ) private {
        IERC165 erc165 = IERC165(tokenContract);

        if (erc165.supportsInterface(type(IERC721).interfaceId)) {
            IERC721 token = IERC721(tokenContract);
            token.safeTransferFrom(from, to, tokenID);
        } else if (erc165.supportsInterface(type(IERC1155).interfaceId)) {
            IERC1155 token = IERC1155(tokenContract);
            token.safeTransferFrom(
                from,
                to,
                tokenID,
                amount,
                abi.encodePacked("")
            );
        } else {
            revert("Marketplace: unsupported token type");
        }
    }
}
