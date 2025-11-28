const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("================================================");
  console.log("Performance Monitor - Contract Interaction");
  console.log("================================================\n");

  try {
    // Get contract address
    let contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      const deploymentPath = path.join(__dirname, "../docs/DEPLOYMENT.json");
      if (fs.existsSync(deploymentPath)) {
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath));
        contractAddress = deploymentInfo.contractAddress;
      } else {
        throw new Error("CONTRACT_ADDRESS not found");
      }
    }

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`Signer address: ${signer.address}\n`);

    // Connect to contract
    const PerformanceMonitor = await hre.ethers.getContractFactory(
      "PerformanceMonitor"
    );
    const contract = PerformanceMonitor.attach(contractAddress);

    console.log("=== 1. Query Contract Information ===\n");

    // Get contract info
    const owner = await contract.owner();
    console.log(`Owner: ${owner}`);

    const totalMetrics = await contract.totalMetrics();
    console.log(`Total Metrics Submitted: ${totalMetrics}`);

    const systemCount = await contract.getMonitoredSystemsCount();
    console.log(`Monitored Systems Count: ${systemCount}`);

    const isAuthorized = await contract.isAuthorizedReporter(signer.address);
    console.log(`Is Authorized Reporter: ${isAuthorized}\n`);

    console.log("=== 2. Authorize Reporter ===\n");

    // Authorize a reporter (if caller is owner)
    if (signer.address === owner) {
      const testReporter = "0x0000000000000000000000000000000000000001";
      console.log(`Authorizing reporter: ${testReporter}`);

      const authTx = await contract.authorizeReporter(testReporter);
      const authReceipt = await authTx.wait();

      console.log(`✓ Reporter authorized`);
      console.log(`  Transaction hash: ${authReceipt.hash}\n`);

      const isNowAuthorized = await contract.isAuthorizedReporter(
        testReporter
      );
      console.log(`Reporter is now authorized: ${isNowAuthorized}\n`);
    } else {
      console.log(
        "Note: Not the contract owner. Skipping authorization example.\n"
      );
    }

    console.log("=== 3. Submit Performance Metrics ===\n");

    if (isAuthorized) {
      const cpuUsage = 45;
      const memoryUsage = 2048;
      const networkLatency = 25;
      const throughput = BigInt(1000000);

      console.log(`Submitting metrics:`);
      console.log(`  CPU Usage: ${cpuUsage}%`);
      console.log(`  Memory Usage: ${memoryUsage}MB`);
      console.log(`  Network Latency: ${networkLatency}ms`);
      console.log(`  Throughput: ${throughput} bytes/sec\n`);

      const submitTx = await contract.submitMetrics(
        cpuUsage,
        memoryUsage,
        networkLatency,
        throughput
      );
      const submitReceipt = await submitTx.wait();

      console.log(`✓ Metrics submitted successfully`);
      console.log(`  Transaction hash: ${submitReceipt.hash}\n`);

      // Query updated metrics
      const newTotal = await contract.totalMetrics();
      console.log(`Total Metrics After Submission: ${newTotal}\n`);
    }

    console.log("=== 4. Query System Information ===\n");

    if (systemCount > 0) {
      for (let i = 0; i < Math.min(systemCount, 3); i++) {
        const systemAddress = await contract.getMonitoredSystem(i);
        console.log(`System ${i}: ${systemAddress}`);

        const systemInfo = await contract.getSystemInfo(systemAddress);
        console.log(`  Active: ${systemInfo.isActive}`);
        console.log(`  Last Timestamp: ${systemInfo.lastTimestamp}`);
        console.log(`  Data Points: ${systemInfo.dataPoints}\n`);
      }
    } else {
      console.log("No monitored systems yet.\n");
    }

    console.log("=== 5. Emergency Operations (Owner Only) ===\n");

    if (signer.address === owner && systemCount > 0) {
      console.log("Testing emergency pause...");
      const pauseTx = await contract.emergencyPause();
      const pauseReceipt = await pauseTx.wait();
      console.log(`✓ Emergency pause executed`);
      console.log(`  Transaction hash: ${pauseReceipt.hash}\n`);

      console.log("Resuming monitoring...");
      const resumeTx = await contract.resumeMonitoring();
      const resumeReceipt = await resumeTx.wait();
      console.log(`✓ Monitoring resumed`);
      console.log(`  Transaction hash: ${resumeReceipt.hash}\n`);
    } else if (signer.address !== owner) {
      console.log("Note: Not the contract owner. Skipping emergency operations.\n");
    }

    console.log("=== 6. Contract ABI Info ===\n");

    const abiPath = path.join(
      __dirname,
      "../artifacts/contracts/PerformanceMonitor.sol/PerformanceMonitor.json"
    );
    if (fs.existsSync(abiPath)) {
      const artifact = JSON.parse(fs.readFileSync(abiPath));
      console.log(`ABI has ${artifact.abi.length} functions/events`);
      console.log(`Artifact saved at: ${abiPath}\n`);
    }

    // Save interaction results
    const interactionResults = {
      contractAddress: contractAddress,
      signer: signer.address,
      owner: owner,
      totalMetrics: totalMetrics.toString(),
      monitoredSystems: systemCount.toString(),
      isAuthorized: isAuthorized,
      timestamp: new Date().toISOString(),
    };

    const resultsPath = path.join(
      __dirname,
      "../docs/INTERACTION_RESULTS.json"
    );
    fs.writeFileSync(resultsPath, JSON.stringify(interactionResults, null, 2));
    console.log(`Interaction results saved to: ${resultsPath}`);

    console.log("\n================================================");
    console.log("Interaction completed successfully!");
    console.log("================================================");
  } catch (error) {
    console.error("\n✗ Interaction failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
