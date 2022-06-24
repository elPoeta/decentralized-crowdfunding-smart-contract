import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFactory: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Local network detected! Deploying factory...", deployer);
  await deploy("CrowdfundFactory", {
    from: deployer,
    log: true,
    args: [],
  });
  log("CrowdfundFactory Deployed!");
  log("----------------------------------");
  log(
    "You are deploying to a local network, you'll need a local network running to interact"
  );
  log(
    "Please run `yarn hardhat console` to interact with the deployed smart contracts!"
  );
  log("----------------------------------");
};
export default deployFactory;
deployFactory.tags = ["all", "factory"];
