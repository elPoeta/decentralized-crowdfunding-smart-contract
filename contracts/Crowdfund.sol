// SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;

error Crowdfund__InsufficientContribution(uint256 sent, uint256 required);
error Crowdfund__NotAproved();
error Crowdfund__HasComplete();

contract Crowdfund {
    struct Request {
        string description;
        uint256 amount;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
    }

    address private immutable i_manager;
    uint256 private s_minimumContribution;
    mapping(address => bool) private s_approvers;
    Request[] private s_requests;
    mapping(uint256 => bool) private s_approvals;
    uint256 private s_approvalsCount;

    modifier onlyOwner() {
        require(msg.sender == i_manager);
        _;
    }

    constructor(address _manager, uint256 _minimumContribution) {
        i_manager = _manager;
        s_minimumContribution = _minimumContribution;
    }

    function contibute() public payable {
        if (msg.value < s_minimumContribution)
            revert Crowdfund__InsufficientContribution({
                sent: msg.value,
                required: s_minimumContribution
            });
        s_approvers[msg.sender] = true;
        s_approvalsCount++;
    }

    function createRequest(
        string memory description,
        uint256 amount,
        address payable recipient
    ) public onlyOwner {
        s_requests.push(
            Request({
                description: description,
                amount: amount,
                recipient: recipient,
                complete: false,
                approvalCount: 0
            })
        );
        s_approvals[s_requests.length] = false;
    }

    function approveRequest(uint256 index) public {
        Request storage request = s_requests[index];
        if (!s_approvers[msg.sender]) revert Crowdfund__NotAproved();
        if (s_approvals[index]) revert Crowdfund__NotAproved();
        request.approvalCount++;
    }

    function endRequest(uint256 index) public onlyOwner {
        Request storage request = s_requests[index];
        require(request.approvalCount > (s_approvalsCount / 2));
        if (request.complete) revert Crowdfund__HasComplete();
        request.recipient.transfer(request.amount);
        request.complete = true;
    }

    function getManager() public view returns (address) {
        return i_manager;
    }

    function getMinimumContribution() public view returns (uint256) {
        return s_minimumContribution;
    }

    function geApprovalsCount() public view returns (uint256) {
        return s_approvalsCount;
    }

    function getRequestAtIndex(uint256 index)
        public
        view
        returns (Request memory)
    {
        return s_requests[index];
    }

    function getApprovalsAtIndex(uint256 index) public view returns (bool) {
        return s_approvals[index];
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
