async function main() {
  console.log("Deploying PerformanceMonitor contract...");

  // Get the contract factory
  const PerformanceMonitor = await ethers.getContractFactory("PerformanceMonitor");

  // Deploy the contract
  const contract = await PerformanceMonitor.deploy();
  await contract.deployed();

  console.log("PerformanceMonitor deployed to:", contract.address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    address: contract.address,
    deployer: (await ethers.getSigners())[0].address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  const path = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(path, JSON.stringify(deploymentInfo, null, 2));

  console.log("Deployment info saved to:", path);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
