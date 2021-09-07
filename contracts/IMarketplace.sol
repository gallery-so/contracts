// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMarketplace {
    event Sale(
        uint256 indexed id,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event AuctionStart(
        uint256 indexed id,
        address indexed seller,
        uint256 startingBid
    );

    struct Offer {
        uint256 value;
        uint256 amount;
        address bidder;
    }
    struct Listing {
        uint256 price;
        uint256 amount;
        address seller;
    }

    struct Auction {
        uint256 end;
        uint256 amount;
        address seller;
        uint256 startingBid;
    }

    function makeOffer(
        uint256 value,
        uint256 amount,
        uint256 tokenID,
        address tokenContract
    ) external;

    function recallOffer(uint256 tokenID, address tokenContract) external;

    function acceptCurrentOffer(uint256 tokenID, address tokenContract)
        external;

    function listToken(
        uint256 tokenID,
        address tokenContract,
        uint256 price,
        uint256 amount
    ) external;

    function purchaseToken(uint256 tokenID, address tokenContract)
        external
        payable;

    function startAuction(
        uint256 tokenID,
        address tokenContract,
        uint256 end,
        uint256 startingBid,
        uint256 amount
    ) external;

    function endAuction(uint256 tokenID, address tokenContract) external;
}
