import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, network } from "hardhat";
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
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    creator = accounts[1];
    await deployments.fixture(["factory"]);
    crowdfundFactoryContract = await ethers.getContract("CrowdfundFactory");
    crowdfundFactory = crowdfundFactoryContract.connect(creator);
    const tx = await crowdfundFactory.createCrowdfund();
    await tx.wait(1);
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
      const latestBlock = await ethers.provider.getBlock("latest");
      const startTime = latestBlock.timestamp + 5;
      const endTime = startTime + 10000;
      const tx = await crowdfund.launchCampign(
        "Creative project",
        GOAL,
        MINIMUM_CONTRIBUTION,
        startTime,
        endTime
      );
      await tx.wait(1);
      const campaign = await crowdfund.getCampaignAtIndex(1);
      assert.equal(campaign.description, "Creative project");
    });

    it("revert new campaign start at < now", async () => {
      const latestBlock = await ethers.provider.getBlock("latest");
      const startTime = latestBlock.timestamp - 5;
      const endTime = startTime + 10000;
      await expect(
        crowdfund.launchCampign(
          "Creative project",
          GOAL,
          MINIMUM_CONTRIBUTION,
          startTime,
          endTime
        )
      ).to.be.revertedWith("CrowdFund__TimeFailing");
    });

    it("revert new campaign end at < start at", async () => {
      const latestBlock = await ethers.provider.getBlock("latest");
      const startTime = latestBlock.timestamp + 5;
      const endTime = startTime - 10;
      await expect(
        crowdfund.launchCampign(
          "Creative project",
          GOAL,
          MINIMUM_CONTRIBUTION,
          startTime,
          endTime
        )
      ).to.be.revertedWith("CrowdFund__TimeFailing");
    });

    it("revert new campaign end at > max duration", async () => {
      const latestBlock = await ethers.provider.getBlock("latest");
      const startTime = latestBlock.timestamp + 5;
      const endTime = startTime + (1000 * 60 * 60 * 24 * 121) / 1000;
      await expect(
        crowdfund.launchCampign(
          "Creative project",
          GOAL,
          MINIMUM_CONTRIBUTION,
          startTime,
          endTime
        )
      ).to.be.revertedWith("CrowdFund__TimeFailing");
    });
  });

  describe("Campaign", function () {
    let startTime: number;
    let endTime: number;
    beforeEach(async () => {
      const latestBlock = await ethers.provider.getBlock("latest");
      startTime = latestBlock.timestamp + 5;
      endTime = startTime + 10000;
      const tx = await crowdfund.launchCampign(
        "Creative project",
        GOAL,
        MINIMUM_CONTRIBUTION,
        startTime,
        endTime
      );
      await tx.wait(1);
    });

    describe("pledge", function () {
      it("revert minimum contribution", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(
          crowdfundPledge.pledge(1, {
            value: BigNumber.from("10"),
          })
        ).to.be.revertedWith("CrowdFund__MinimumContribution");
      });

      it("revert not started", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await expect(
          crowdfundPledge.pledge(1, {
            value: BigNumber.from("10000"),
          })
        ).to.be.revertedWith("CrowdFund__TimeFailing");
      });

      it("revert ended", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 121]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(
          crowdfundPledge.pledge(1, {
            value: BigNumber.from("1000"),
          })
        ).to.be.revertedWith("CrowdFund__TimeFailing");
      });

      it("valid contribution", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(
          crowdfundPledge.pledge(1, {
            value: BigNumber.from("1000000000000000000"),
          })
        ).to.emit(crowdfund, "Pledge");
      });
    });

    describe("claim", function () {
      it("revert claim if not creator claimed", async () => {
        const crowdfundClaim = crowdfundContract.connect(accounts[4]);
        await expect(crowdfundClaim.claim(1)).to.be.revertedWith(
          "CrowdFund__NotCreator"
        );
      });

      it("valid creator claim", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await network.provider.send("evm_increaseTime", [endTime + 1]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(crowdfund.claim(1)).to.emit(crowdfund, "Claim");
      });

      it("revert claim if was claimed", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await network.provider.send("evm_increaseTime", [endTime + 1]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await crowdfund.claim(1);
        await expect(crowdfund.claim(1)).to.be.revertedWith(
          "CrowdFund__HasClaimed"
        );
      });

      it("revert claim not goal", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("300"),
        });
        await tx.wait(1);
        await network.provider.send("evm_increaseTime", [endTime + 1]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(crowdfund.claim(1)).to.be.revertedWith(
          "CrowdFund__NotGoal"
        );
      });

      it("revert claim not ended", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await expect(crowdfund.claim(1)).to.be.revertedWith(
          "CrowdFund__TimeFailing"
        );
      });
    });

    describe("Cancel", () => {
      it("revert if not creator cancel", async () => {
        const crowdfundCancel = crowdfundContract.connect(accounts[4]);
        await expect(crowdfundCancel.cancel(1)).to.be.revertedWith(
          "CrowdFund__NotCreator"
        );
      });

      it("revert if started", async () => {
        await network.provider.send("evm_increaseTime", [startTime + 10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(crowdfund.cancel(1)).to.be.revertedWith(
          "CrowdFund__TimeFailing"
        );
      });

      it("valid cancelation", async () => {
        await expect(crowdfund.cancel(1)).to.emit(crowdfund, "Cancel");
      });
    });

    describe("unpledge", () => {
      it("revevert time fail ended", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await network.provider.send("evm_increaseTime", [endTime + 1]);
        await network.provider.request({ method: "evm_mine", params: [] });
        await expect(
          crowdfundPledge.unpledge(1, BigNumber.from("3000000000000000000"))
        ).to.be.revertedWith("CrowdFund__TimeFailing");
      });

      it("revert amount", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("30000"),
        });
        await tx.wait(1);
        await expect(
          crowdfundPledge.unpledge(1, BigNumber.from("40000"))
        ).to.be.revertedWith("CrowdFund__AmountFail");
      });

      it("unpleged ok", async () => {
        const crowdfundPledge = crowdfundContract.connect(accounts[2]);
        await network.provider.send("evm_increaseTime", [10]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const tx = await crowdfundPledge.pledge(1, {
          value: BigNumber.from("3000000000000000000"),
        });
        await tx.wait(1);
        await expect(
          crowdfundPledge.unpledge(1, BigNumber.from("3000000000000000000"))
        ).to.emit(crowdfund, "Unpledge");
      });
    });

    describe("refund", () => {});
  });
});
