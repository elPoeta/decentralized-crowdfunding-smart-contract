// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Crowdfunding.sol";

contract CrowdfundingFactory {
    Crowdfunding[] private s_crowdfundingsDeployed;
    address[] private s_crowdfundingAddressesDeployed;
    event crowdfundingCreated(address crowdfundingAddress, uint256 data);

    function createCrowdfunding(uint256 _minimumContribution) external {
        Crowdfunding crowdfunding = new Crowdfunding(
            msg.sender,
            _minimumContribution
        );
        s_crowdfundingAddressesDeployed.push(address(crowdfunding));
        s_crowdfundingsDeployed.push(crowdfunding);
        emit crowdfundingCreated(address(crowdfunding), _minimumContribution);
    }

    function getCrowdfundingDeployed()
        external
        view
        returns (Crowdfunding[] memory)
    {
        return s_crowdfundingsDeployed;
    }

    function getAddressesDeployed() external view returns (address[] memory) {
        return s_crowdfundingAddressesDeployed;
    }
}
