const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("================================================");
  console.log("Performance Monitor - Simulation Scenarios");
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
        console.log(
          "Note: No deployed contract found. Run 'npm run deploy' first."
        );
        return;
      }
    }

    const [owner, ...otherSigners] = await hre.ethers.getSigners();
    console.log(`Owner: ${owner.address}`);
    console.log(`Available signers: ${otherSigners.length}\n`);

    const PerformanceMonitor = await hre.ethers.getContractFactory(
      "PerformanceMonitor"
    );
    const contract = PerformanceMonitor.attach(contractAddress);

    console.log("=== Scenario 1: Multiple Systems Reporting Metrics ===\n");

    // Simulate multiple systems
    const systems = otherSigners.slice(0, 3);
    const metricsData = [
      {
        name: "System-A",
        cpu: 35,
        memory: 1024,
        latency: 15,
        throughput: BigInt(500000),
      },
      {
        name: "System-B",
        cpu: 65,
        memory: 3072,
        latency: 45,
        throughput: BigInt(2000000),
      },
      {
        name: "System-C",
        cpu: 50,
        memory: 2048,
        latency: 30,
        throughput: BigInt(1500000),
      },
    ];

    for (let i = 0; i < systems.length; i++) {
      const signer = systems[i];
      const metrics = metricsData[i];

      console.log(`\nAuthorizing ${metrics.name}...`);
      const authTx = await contract.authorizeReporter(signer.address);
      await authTx.wait();

      console.log(`Submitting metrics for ${metrics.name}:`);
      console.log(`  CPU: ${metrics.cpu}%`);
      console.log(`  Memory: ${metrics.memory}MB`);
      console.log(`  Latency: ${metrics.latency}ms`);
      console.log(`  Throughput: ${metrics.throughput.toString()} bytes/sec`);

      const submitTx = await contract
        .connect(signer)
        .submitMetrics(
          metrics.cpu,
          metrics.memory,
          metrics.latency,
          metrics.throughput
        );
      const receipt = await submitTx.wait();
      console.log(`  ✓ Transaction: ${receipt.hash}`);
    }

    console.log("\n=== Scenario 2: Aggregate System Status ===\n");

    const totalMetrics = await contract.totalMetrics();
    console.log(`Total metrics recorded: ${totalMetrics}`);

    const monitoredCount = await contract.getMonitoredSystemsCount();
    console.log(`Monitored systems: ${monitoredCount}`);

    if (monitoredCount > 0) {
      console.log("\nSystem Details:");
      for (let i = 0; i < monitoredCount; i++) {
        const systemAddr = await contract.getMonitoredSystem(i);
        const info = await contract.getSystemInfo(systemAddr);
        const name = metricsData[i]?.name || `System-${i}`;

        console.log(`\n${name}:`);
        console.log(`  Address: ${systemAddr}`);
        console.log(`  Active: ${info.isActive}`);
        console.log(`  Data Points: ${info.dataPoints}`);
        console.log(`  Last Update: ${new Date(Number(info.lastTimestamp) * 1000).toISOString()}`);
      }
    }

    console.log("\n=== Scenario 3: Authorization Management ===\n");

    const testAddr = "0x1234567890123456789012345678901234567890";
    console.log(`Authorizing test address: ${testAddr}`);
    const authTx1 = await contract.authorizeReporter(testAddr);
    await authTx1.wait();
    console.log("✓ Authorized");

    let isAuthorized = await contract.isAuthorizedReporter(testAddr);
    console.log(`Verification: ${isAuthorized}`);

    console.log(`\nRevoking reporter: ${testAddr}`);
    const revokeTx = await contract.revokeReporter(testAddr);
    await revokeTx.wait();
    console.log("✓ Revoked");

    isAuthorized = await contract.isAuthorizedReporter(testAddr);
    console.log(`Verification: ${isAuthorized}\n`);

    console.log("=== Scenario 4: System Lifecycle Management ===\n");

    if (monitoredCount > 0) {
      const firstSystem = await contract.getMonitoredSystem(0);
      const beforeRemoval = await contract.getSystemInfo(firstSystem);

      console.log(`System before removal:`);
      console.log(`  Address: ${firstSystem}`);
      console.log(`  Active: ${beforeRemoval.isActive}`);

      console.log(`\nRemoving system from monitoring...`);
      const removeTx = await contract.removeSystem(firstSystem);
      await removeTx.wait();
      console.log("✓ System removed");

      const afterRemoval = await contract.getSystemInfo(firstSystem);
      console.log(`System after removal:`);
      console.log(`  Active: ${afterRemoval.isActive}\n`);
    }

    console.log("=== Scenario 5: Emergency Pause and Resume ===\n");

    if ((await contract.getMonitoredSystemsCount()) > 0) {
      console.log("Pausing all monitoring...");
      const pauseTx = await contract.emergencyPause();
      await pauseTx.wait();
      console.log("✓ All systems paused");

      const systemCount = await contract.getMonitoredSystemsCount();
      if (systemCount > 0) {
        const firstSystem = await contract.getMonitoredSystem(0);
        const pausedInfo = await contract.getSystemInfo(firstSystem);
        console.log(`Sample system active status after pause: ${pausedInfo.isActive}`);
      }

      console.log("\nResuming monitoring...");
      const resumeTx = await contract.resumeMonitoring();
      await resumeTx.wait();
      console.log("✓ All systems resumed");

      if (systemCount > 0) {
        const firstSystem = await contract.getMonitoredSystem(0);
        const resumedInfo = await contract.getSystemInfo(firstSystem);
        console.log(`Sample system active status after resume: ${resumedInfo.isActive}\n`);
      }
    }

    // Save simulation results
    const simulationResults = {
      contractAddress: contractAddress,
      scenarios: [
        "Multiple Systems Reporting",
        "Aggregate System Status",
        "Authorization Management",
        "System Lifecycle",
        "Emergency Operations",
      ],
      finalMetrics: {
        totalMetricsRecorded: totalMetrics.toString(),
        monitoredSystems: monitoredCount.toString(),
        ownerAddress: owner.address,
      },
      timestamp: new Date().toISOString(),
    };

    const resultsPath = path.join(__dirname, "../docs/SIMULATION_RESULTS.json");
    fs.writeFileSync(resultsPath, JSON.stringify(simulationResults, null, 2));
    console.log(`Simulation results saved to: ${resultsPath}`);

    console.log("\n================================================");
    console.log("Simulation completed successfully!");
    console.log("================================================");
  } catch (error) {
    console.error("\n✗ Simulation failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
