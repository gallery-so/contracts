// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Invite1155 is ERC20, Ownable {
    enum TokenType {
        ERC721,
        ERC1155
    }
    struct ERC721Balance {
        TokenType tokenType;
        address tokenContract;
        uint256 balance;
        uint256 timeStaked;
    }

    uint256 private constant PERCENTAGE_GALLERY = 500;
    uint256 private constant PERCENTAGE_STAKEE = 500;

    // mapping of staker to list of erc721 balances for tokens at time of stake
    mapping(address => ERC721Balance[]) internal _erc721BalancesAtStake;

    mapping(address => mapping(address => uint256)) internal stakes;

    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {}

    function createStake(
        uint256 _stake,
        address _stakee,
        address[] calldata _contracts
    ) public {
        require(_stake > 0, "stake must be greater than 0");
        require(_stakee != address(0), "stakee must not be the zero address");
        for (uint256 i = 0; i < _contracts.length; i++) {
            require(
                ERC165Checker.supportsInterface(
                    _contracts[i],
                    type(IERC721).interfaceId
                ),
                "contract must support ERC721"
            );
            IERC721 token = IERC721(_contracts[i]);
            uint256 balance = token.balanceOf(_stakee);
            require(balance > 0, "stakee must have balance");
            _erc721BalancesAtStake[_stakee].push(
                ERC721Balance(
                    TokenType.ERC721,
                    _contracts[i],
                    balance,
                    block.timestamp
                )
            );
        }
        _burn(_msgSender(), _stake);
        stakes[_msgSender()][_stakee] += _stake;
    }

    function removeStake(address _stakee) public {
        uint256 currentStake = stakes[_msgSender()][_stakee];
        for (uint256 i = 0; i < _erc721BalancesAtStake[_stakee].length; i++) {
            ERC721Balance memory tokenBalance = _erc721BalancesAtStake[_stakee][
                i
            ];
            uint256 balanceAtStart = tokenBalance.balance;
            _erc721BalancesAtStake[_stakee][i] = _erc721BalancesAtStake[
                _stakee
            ][_erc721BalancesAtStake[_stakee].length - 1];
            _erc721BalancesAtStake[_stakee].pop();
            IERC721 token = IERC721(tokenBalance.tokenContract);
            uint256 balance = token.balanceOf(_stakee);
            if (balanceAtStart >= balance) {
                currentStake +=
                    currentStake *
                    ((block.timestamp / tokenBalance.timeStaked) /
                        (balanceAtStart / balance));
            } else {
                currentStake -=
                    currentStake *
                    ((block.timestamp / tokenBalance.timeStaked) /
                        (balance / balanceAtStart));
            }
        }
        uint256 fees = (currentStake / PERCENTAGE_STAKEE) +
            (currentStake / PERCENTAGE_GALLERY);
        _mint(_msgSender(), currentStake - fees);
        _mint(owner(), (currentStake / PERCENTAGE_GALLERY));
        _mint(_stakee, (currentStake / PERCENTAGE_STAKEE));
        stakes[_msgSender()][_stakee] = 0;
    }

    function stakeOf(address _stakeholder, address _stakee)
        public
        view
        returns (uint256)
    {
        return stakes[_stakeholder][_stakee];
    }

    function isStakeholder(address _address, address _stakee)
        public
        view
        returns (bool)
    {
        return stakes[_address][_stakee] > 0;
    }
}
