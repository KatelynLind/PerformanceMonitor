import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { PerformanceMonitor } from "../types";
import { expect } from "chai";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("PerformanceMonitor - Sepolia Testnet", function () {
  let signers: Signers;
  let contract: PerformanceMonitor;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Only run on Sepolia testnet
    if (fhevm.isMock) {
      console.warn("This test suite can only run on Sepolia Testnet");
      this.skip();
    }

    try {
      const deployment = await deployments.get("PerformanceMonitor");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("PerformanceMonitor", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia' first";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should submit metrics on Sepolia testnet", async function () {
    steps = 6;
    this.timeout(4 * 40000); // 160 seconds for testnet

    progress("Checking authorization status...");
    const isAuthorized = await contract.isAuthorizedReporter(signers.alice.address);
    console.log(`Reporter authorized: ${isAuthorized}`);

    if (!isAuthorized) {
      progress("Authorizing reporter...");
      const authTx = await contract.authorizeReporter(signers.alice.address);
      await authTx.wait();
    }

    progress(`Submitting encrypted metrics to contract at ${contractAddress}...`);
    const cpuUsage = 75;
    const memoryUsage = 2048;
    const latency = 15;
    const throughput = 1500000;

    let tx = await contract
      .connect(signers.alice)
      .submitMetrics(cpuUsage, memoryUsage, latency, throughput);

    progress("Waiting for transaction confirmation...");
    await tx.wait();

    progress("Retrieving system information...");
    const [isActive, timestamp, dataPoints] = await contract.getSystemInfo(signers.alice.address);

    progress("Verifying metrics submission...");
    expect(isActive).to.be.true;
    expect(dataPoints).to.be.gt(0);

    progress(`Metrics submitted successfully! Data points: ${dataPoints}, Timestamp: ${timestamp}`);
  });

  it("should track multiple metrics submissions", async function () {
    steps = 4;
    this.timeout(4 * 40000);

    progress("Getting initial data points...");
    const [, , initialDataPoints] = await contract.getSystemInfo(signers.alice.address);

    progress("Submitting additional metrics...");
    const tx = await contract
      .connect(signers.alice)
      .submitMetrics(80, 3072, 20, 2000000);

    await tx.wait();

    progress("Verifying data points increased...");
    const [, , newDataPoints] = await contract.getSystemInfo(signers.alice.address);

    expect(newDataPoints).to.be.gt(initialDataPoints);

    progress(`Total data points: ${newDataPoints}`);
  });

  it("should retrieve monitored systems count", async function () {
    steps = 2;
    this.timeout(2 * 40000);

    progress("Querying monitored systems count...");
    const count = await contract.getMonitoredSystemsCount();

    progress(`Total monitored systems: ${count}`);
    expect(count).to.be.gt(0);
  });
});
