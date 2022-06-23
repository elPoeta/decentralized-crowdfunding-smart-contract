// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Crowdfund.sol";

contract CrowdfundFactory {
    Crowdfund[] private s_crowdfundsDeployed;
    address[] private s_crowdfundAddressesDeployed;
    address public immutable i_owner;
    event crowdfundCreated(address crowdfundAddress);

    constructor() {
        i_owner = msg.sender;
    }

    function createCrowdfund() external {
        Crowdfund crowdfund = new Crowdfund(i_owner);
        s_crowdfundAddressesDeployed.push(address(crowdfund));
        s_crowdfundsDeployed.push(crowdfund);
        emit crowdfundCreated(address(crowdfund));
    }

    function getCrowdfundDeployed() external view returns (Crowdfund[] memory) {
        return s_crowdfundsDeployed;
    }

    function getAddressesDeployed() external view returns (address[] memory) {
        return s_crowdfundAddressesDeployed;
    }
}
