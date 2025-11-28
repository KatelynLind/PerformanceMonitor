const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("================================================");
  console.log("Performance Monitor - Contract Verification");
  console.log("================================================\n");

  try {
    // Get contract address from environment or deployment info
    let contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      const deploymentPath = path.join(__dirname, "../docs/DEPLOYMENT.json");
      if (fs.existsSync(deploymentPath)) {
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath));
        contractAddress = deploymentInfo.contractAddress;
        console.log(`Using contract address from deployment info: ${contractAddress}\n`);
      } else {
        throw new Error(
          "CONTRACT_ADDRESS not found in environment or deployment info"
        );
      }
    } else {
      console.log(`Contract address from environment: ${contractAddress}\n`);
    }

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Check if contract exists
    console.log("Checking if contract exists at address...");
    const code = await hre.ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error(`No contract found at address: ${contractAddress}`);
    }
    console.log("✓ Contract found!\n");

    // Get contract details
    const PerformanceMonitor = await hre.ethers.getContractFactory(
      "PerformanceMonitor"
    );
    const contract = PerformanceMonitor.attach(contractAddress);

    console.log("Contract Details:");
    console.log(`- Owner: ${await contract.owner()}`);
    console.log(`- Total Metrics: ${await contract.totalMetrics()}`);
    console.log(`- Monitored Systems: ${await contract.getMonitoredSystemsCount()}\n`);

    // Verify on Etherscan
    console.log("Attempting to verify contract on Etherscan...");
    console.log(`URL: https://${network.name === "sepolia" ? "sepolia." : ""}etherscan.io/address/${contractAddress}\n`);

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✓ Contract verified successfully on Etherscan!");

      // Save verification info
      const verificationInfo = {
        contractAddress: contractAddress,
        network: network.name,
        chainId: network.chainId,
        verifiedAt: new Date().toISOString(),
        etherscanUrl: `https://${
          network.name === "sepolia" ? "sepolia." : ""
        }etherscan.io/address/${contractAddress}`,
      };

      const verificationPath = path.join(
        __dirname,
        "../docs/VERIFICATION.json"
      );
      fs.writeFileSync(verificationPath, JSON.stringify(verificationInfo, null, 2));
      console.log(`Verification info saved to: ${verificationPath}`);
    } catch (verificationError) {
      if (verificationError.message.includes("Already Verified")) {
        console.log("✓ Contract is already verified on Etherscan!");
      } else {
        console.warn("⚠ Verification on Etherscan failed:");
        console.warn(verificationError.message);
        console.warn("\nNote: The contract may already be verified or the verification might be pending.");
      }
    }

    console.log("\n================================================");
    console.log("Verification process completed!");
    console.log("================================================");
  } catch (error) {
    console.error("\n✗ Verification failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
