// SPDX-License-Identifier: MIT
pragma solidity > 0.8.7;

contract KingOfTheBlockchain {
    struct KingMessage {
        string message;
        uint bid;
        uint timestamp;
        address bidder;
        string uri;
    }

    address private owner;
    uint public maxBid = 0;
    uint private nextBidIndex = 0;
    mapping (address => uint) public bidsIndex;
    // mapping (uint => KingMessage) public bids;
    // mapping (uint => address) public charities;
    KingMessage[] public bids;
    address[] public charities;

    uint CHARITY_CUT = 51; // THis is percentage

    event NewBid(address bidder, uint bid, uint timestamp);
    event LogWithdrawal(uint amount, address indexed recipient);

    modifier restricted() {
        require(
        msg.sender == owner,
        "This function is restricted to the contract's owner"
        );
        _;
    }

    constructor () {
        owner = msg.sender;
    }

    function addCharity(address charity) external restricted {
        charities.push(charity);
    }

    function getCharities() external view returns (address[] memory) {
        return charities;
    }

    // get bids with pagination
    function getBids(uint page, uint length) external view returns (KingMessage[] memory) {
        require(bids.length / length >= page, "Page for length does not exist");
        KingMessage[] memory results = new KingMessage[](length);
        for(uint i = 0; i < length; i++) {
            uint index = page * length + i;
            if(index >= bids.length)
                break;
            results[i] = bids[bids.length - index - 1];
        }
        return results;
    }

    function getTopBids() external view returns (KingMessage[] memory) {
        uint len = bids.length;
        KingMessage[] memory topBids = new KingMessage[](3);
        if(len > 0) topBids[0] = bids[len - 1];
        if (len > 1) topBids[1] = bids[len - 2];
        if (len > 2) topBids[2] = bids[len - 3];
        return topBids;
    }

    function makeBid(string memory message, string memory uri, uint charityId) public payable {
        // require(msg.value >= msg.sender.balance, "Sorry! You don't have enough ether to bid");
        require(msg.value > maxBid, "Bid too low");
        require(charityId < charities.length, "Charity does not exist");
        maxBid = msg.value;
        KingMessage memory newBid = KingMessage(message, msg.value, block.timestamp, msg.sender, uri);
        payable(charities[charityId]).transfer(msg.value * CHARITY_CUT / 100);
        payable(owner).transfer(msg.value * (100 - CHARITY_CUT) / 100);
        bids.push(newBid);
        nextBidIndex++;
        emit NewBid(msg.sender, msg.value, block.timestamp);
    }

    // Withrdraw money out of the contract just in case
    function withdraw(uint amount, address payable recipient) external restricted {
        require(msg.sender == owner, "Only the owner of this wallet can withdraw.");
        require(address(this).balance >= amount, "Not enough funds.");
        emit LogWithdrawal(amount, recipient);
        recipient.transfer(amount);
    }
}
