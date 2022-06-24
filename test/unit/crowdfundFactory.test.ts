import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import { deployments, ethers } from "hardhat";
import { CrowdfundFactory } from "../../typechain-types";

describe("CrowdfundFactory Unit Tests", function () {
  let crowdfundFactory: CrowdfundFactory;
  let crowdfundFactoryContract: CrowdfundFactory;
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    accounts = await ethers.getSigners(); // could also do with getNamedAccounts
    deployer = accounts[0];
    creator = accounts[1];
    await deployments.fixture(["factory"]);
    crowdfundFactoryContract = await ethers.getContract("CrowdfundFactory");
    crowdfundFactory = crowdfundFactoryContract.connect(deployer);
  });

  describe("constructor", function () {
    it("intitiallizes the factory correctly", async () => {
      const owner = await crowdfundFactory.i_owner();
      assert.equal(owner, deployer.address);
    });
  });

  describe("create crowdfund", function () {
    it("generate deply address", async () => {
      crowdfundFactory = crowdfundFactoryContract.connect(creator);
      const tx = await crowdfundFactory.createCrowdfund();
      const receipt = await tx.wait(1);
      const crowdfunds = await crowdfundFactory.getCrowdfundDeployed();
      assert.equal(crowdfunds.length, 1);
    });
  });
});
