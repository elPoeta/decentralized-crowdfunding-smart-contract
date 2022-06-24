import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers } from "hardhat";
import { Crowdfund, CrowdfundFactory } from "../../typechain-types";

describe("Crowdfund Unit Tests", function () {
  let crowdfundFactory: CrowdfundFactory;
  let crowdfundFactoryContract: CrowdfundFactory;
  let crowdfund: Crowdfund;
  let crowdfundContract: Crowdfund;
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let accounts: SignerWithAddress[];
  let deployedAddress: string;
  const MINIMUM_CONTRIBUTION: BigNumber = BigNumber.from("100");
  const GOAL: BigNumber = BigNumber.from("2000000000000000000");

  beforeEach(async () => {
    accounts = await ethers.getSigners(); // could also do with getNamedAccounts
    deployer = accounts[0];
    creator = accounts[1];
    await deployments.fixture(["factory"]);
    crowdfundFactoryContract = await ethers.getContract("CrowdfundFactory");
    crowdfundFactory = crowdfundFactoryContract.connect(creator);
    const tx = await crowdfundFactory.createCrowdfund();
    const receipt = await tx.wait(1);
    const crowdfunds = await crowdfundFactory.getCrowdfundDeployed();
    deployedAddress = crowdfunds[0];
    crowdfundContract = await ethers.getContractAt(
      "Crowdfund",
      deployedAddress
    );
    crowdfund = await crowdfundContract.connect(creator);
  });

  describe("constructor", function () {
    it("intitiallizes the crowdfund correctly", async () => {
      const owner = await crowdfund.getOwner();
      assert.equal(owner, deployer.address);
    });
  });

  describe("launch campaign", function () {
    it("new campaign", async () => {
      const startTime = Math.round(Date.now() / 1000) + 5000;
      const endTime = startTime + 10000;
      const tx = await crowdfund.launchCampign(
        "Creative project",
        GOAL,
        MINIMUM_CONTRIBUTION,
        startTime,
        endTime
      );
      const receipt = await tx.wait(1);
      const campaign = await crowdfund.getCampaignAtIndex(1);
      assert.equal(campaign.description, "Creative project");
    });
  });

  describe("launch campaign", function () {
    beforeEach(async () => {
      const startTime = Math.round(Date.now() / 1000) + 1;
      const endTime = startTime + 1;
      const tx = await crowdfund.launchCampign(
        "Creative project",
        GOAL,
        MINIMUM_CONTRIBUTION,
        startTime,
        endTime
      );
      const receipt = await tx.wait(1);
    });

    describe("pledge", function () {
      it("valid contribution", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await expect(
          crowdfundPledge.pledge(1, {
            value: BigNumber.from("1000000000000000000"),
          })
        ).to.emit(crowdfund, "Pledge");
      });
    });

    describe("claim", function () {
      it("claim contributions", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await expect(crowdfund.claim(1)).to.emit(crowdfund, "Claim");
      });
    });
  });
});
