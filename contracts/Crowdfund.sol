// SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;

error Crowdfund__NotOwner();
error Crowdfund__InsufficientContribution(uint256 sent, uint256 required);
error Crowdfund__NotAproved();
error Crowdfund__HasComplete();
error CrowdFund__TransferFailed();

contract Crowdfund {
    event LaunchCampign(
        uint256 id,
        address indexed creator,
        string description,
        uint256 goal,
        uint256 minimumContribution,
        uint32 startAt,
        uint32 endAt
    );
    event Pledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Claim(uint256 id);
    event Cancel(uint256 id);
    event Unpledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Refund(uint256 id, address indexed caller, uint256 amount);

    struct Campaign {
        address creator;
        string description;
        uint256 goal;
        uint256 pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
        uint256 minimumContribution;
    }

    address private immutable i_owner;
    uint256 private s_campaignCount;
    mapping(uint256 => Campaign) private s_campaigns;
    mapping(uint256 => mapping(address => uint256)) private s_pledgedAmount;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Crowdfund__NotOwner();
        _;
    }

    constructor(address _owner) {
        i_owner = _owner;
    }

    function launchCampign(
        string memory _description,
        uint256 _goal,
        uint256 _minimumContribution,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");
        s_campaignCount++;
        s_campaigns[s_campaignCount] = Campaign({
            creator: msg.sender,
            description: _description,
            pledged: 0,
            goal: _goal,
            minimumContribution: _minimumContribution,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });
        emit LaunchCampign(
            s_campaignCount,
            msg.sender,
            _description,
            _goal,
            _minimumContribution,
            _startAt,
            _endAt
        );
    }

    function pledge(uint256 _id) public payable {
        Campaign storage campaign = s_campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");
        require(
            msg.value >= campaign.minimumContribution,
            "send more contribution"
        );

        campaign.pledged += msg.value;
        s_pledgedAmount[_id][msg.sender] += msg.value;

        emit Pledge(_id, msg.sender, msg.value);
    }

    function claim(uint256 _id) public {
        Campaign storage campaign = s_campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        uint256 commission = campaign.goal / 100;

        address payable creator = payable(campaign.creator);

        (bool comissionSuccess, ) = payable(i_owner).call{value: commission}(
            ""
        );
        (bool success, ) = creator.call{value: (campaign.pledged - commission)}(
            ""
        );
        if (!success || !comissionSuccess) {
            revert CrowdFund__TransferFailed();
        }
        campaign.claimed = true;
        emit Claim(_id);
    }

    function cancel(uint256 _id) public {
        Campaign memory campaign = s_campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete s_campaigns[_id];
        emit Cancel(_id);
    }

    function unpledge(uint256 _id, uint256 _amount) public {
        Campaign storage campaign = s_campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged -= _amount;
        s_pledgedAmount[_id][msg.sender] -= _amount;
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        if (!success) {
            revert CrowdFund__TransferFailed();
        }

        emit Unpledge(_id, msg.sender, _amount);
    }

    function refund(uint256 _id) public {
        Campaign memory campaign = s_campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint256 bal = s_pledgedAmount[_id][msg.sender];
        s_pledgedAmount[_id][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: bal}("");
        if (!success) {
            revert CrowdFund__TransferFailed();
        }
        emit Refund(_id, msg.sender, bal);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getCampignsCount() public view returns (uint256) {
        return s_campaignCount;
    }

    function getCampaignAtIndex(uint256 index)
        public
        view
        returns (Campaign memory)
    {
        return s_campaigns[index];
    }

    function getMyPledgedAmount(uint256 index) public view returns (uint256) {
        return s_pledgedAmount[index][msg.sender];
    }
}
