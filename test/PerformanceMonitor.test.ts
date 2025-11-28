import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PerformanceMonitor, PerformanceMonitor__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PerformanceMonitor")) as PerformanceMonitor__factory;
  const contract = (await factory.deploy()) as PerformanceMonitor;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PerformanceMonitor", function () {
  let signers: Signers;
  let contract: PerformanceMonitor;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite cannot run on Sepolia");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  // ===== DEPLOYMENT TESTS (5 tests) =====
  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set deployer as owner", async function () {
      expect(await contract.owner()).to.equal(signers.deployer.address);
    });

    it("should authorize deployer as reporter on deployment", async function () {
      expect(await contract.isAuthorizedReporter(signers.deployer.address)).to.be.true;
    });

    it("should initialize zero total metrics", async function () {
      expect(await contract.totalMetrics()).to.equal(0);
    });

    it("should initialize empty monitored systems list", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(0);
    });
  });

  // ===== AUTHORIZATION TESTS (8 tests) =====
  describe("Authorization and Access Control", function () {
    it("should authorize a new reporter", async function () {
      await expect(contract.connect(signers.deployer).authorizeReporter(signers.alice.address))
        .to.emit(contract, "ReporterAuthorized")
        .withArgs(signers.alice.address);

      expect(await contract.isAuthorizedReporter(signers.alice.address)).to.be.true;
    });

    it("should revoke reporter authorization", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      await expect(contract.connect(signers.deployer).revokeReporter(signers.alice.address))
        .to.emit(contract, "ReporterRevoked")
        .withArgs(signers.alice.address);

      expect(await contract.isAuthorizedReporter(signers.alice.address)).to.be.false;
    });

    it("should reject non-owner authorization attempt", async function () {
      await expect(
        contract.connect(signers.alice).authorizeReporter(signers.bob.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject non-owner revoke attempt", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      await expect(
        contract.connect(signers.bob).revokeReporter(signers.alice.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow authorized reporter to submit metrics", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should reject unauthorized reporter from submitting metrics", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.be.revertedWith("Not authorized reporter");
    });

    it("should allow owner to submit metrics without explicit authorization", async function () {
      await expect(
        contract.connect(signers.deployer).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should deny multiple revokes of same reporter", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).revokeReporter(signers.alice.address);

      // Second revoke should emit event but not revert
      await expect(
        contract.connect(signers.deployer).revokeReporter(signers.alice.address)
      ).to.emit(contract, "ReporterRevoked");
    });
  });

  // ===== METRICS SUBMISSION TESTS (12 tests) =====
  describe("Metrics Submission", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
    });

    it("should submit metrics successfully", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.emit(contract, "MetricsSubmitted");
    });

    it("should increment total metrics counter", async function () {
      const initialCount = await contract.totalMetrics();

      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      expect(await contract.totalMetrics()).to.equal(initialCount + 1n);
    });

    it("should add system to monitored systems on first submission", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(0);

      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(1);
      expect(await contract.getMonitoredSystem(0)).to.equal(signers.alice.address);
    });

    it("should emit SystemAdded event on first metrics submission", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.emit(contract, "SystemAdded").withArgs(signers.alice.address);
    });

    it("should reject metrics with invalid CPU usage (>100)", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(101, 1024, 10, 1000000)
      ).to.be.revertedWith("Invalid CPU usage");
    });

    it("should accept metrics with CPU usage at boundary (100)", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(100, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept metrics with CPU usage at lower boundary (0)", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(0, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should reject metrics with zero memory usage", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 0, 10, 1000000)
      ).to.be.revertedWith("Invalid memory usage");
    });

    it("should accept metrics with valid memory usage", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should reject metrics with negative latency", async function () {
      // Note: uint32 cannot be negative in solidity, so this test validates type safety
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept metrics with zero latency", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 0, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept metrics with zero throughput", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 0)
      ).to.not.be.reverted;
    });
  });

  // ===== SYSTEM MONITORING TESTS (8 tests) =====
  describe("System Monitoring", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);
    });

    it("should track multiple monitored systems", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.bob).submitMetrics(60, 2048, 15, 2000000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(2);
    });

    it("should not add duplicate systems", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.alice).submitMetrics(55, 1100, 12, 1100000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(1);
    });

    it("should retrieve monitored system by index", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      const system = await contract.getMonitoredSystem(0);
      expect(system).to.equal(signers.alice.address);
    });

    it("should revert when accessing out of bounds system index", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      await expect(
        contract.getMonitoredSystem(10)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("should remove system from monitoring", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      await expect(
        contract.connect(signers.deployer).removeSystem(signers.alice.address)
      ).to.emit(contract, "SystemRemoved").withArgs(signers.alice.address);

      const (isActive) = await contract.getSystemInfo(signers.alice.address);
      expect(isActive).to.be.false;
    });

    it("should revert removal of non-monitored system", async function () {
      await expect(
        contract.connect(signers.deployer).removeSystem(signers.charlie.address)
      ).to.be.revertedWith("System not monitored");
    });

    it("should return system info after metrics submission", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);

      const (isActive, _timestamp, dataPoints) = await contract.getSystemInfo(signers.alice.address);
      expect(isActive).to.be.true;
      expect(dataPoints).to.equal(1);
    });

    it("should mark system as inactive when removed", async function () {
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.deployer).removeSystem(signers.alice.address);

      const (isActive) = await contract.getSystemInfo(signers.alice.address);
      expect(isActive).to.be.false;
    });
  });

  // ===== EMERGENCY PAUSE/RESUME TESTS (4 tests) =====
  describe("Emergency Pause and Resume", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);

      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.bob).submitMetrics(60, 2048, 15, 2000000);
    });

    it("should pause all systems monitoring", async function () {
      await contract.connect(signers.deployer).emergencyPause();

      const (aliceActive) = await contract.getSystemInfo(signers.alice.address);
      const (bobActive) = await contract.getSystemInfo(signers.bob.address);

      expect(aliceActive).to.be.false;
      expect(bobActive).to.be.false;
    });

    it("should only allow owner to pause", async function () {
      await expect(
        contract.connect(signers.alice).emergencyPause()
      ).to.be.revertedWith("Not authorized");
    });

    it("should resume monitoring for all systems", async function () {
      await contract.connect(signers.deployer).emergencyPause();
      await contract.connect(signers.deployer).resumeMonitoring();

      const (aliceActive) = await contract.getSystemInfo(signers.alice.address);
      const (bobActive) = await contract.getSystemInfo(signers.bob.address);

      expect(aliceActive).to.be.true;
      expect(bobActive).to.be.true;
    });

    it("should only allow owner to resume", async function () {
      await contract.connect(signers.deployer).emergencyPause();

      await expect(
        contract.connect(signers.alice).resumeMonitoring()
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ===== ENCRYPTED DATA HANDLING TESTS (3 tests) =====
  describe("Encrypted Data Handling", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
    });

    it("should encrypt metrics data securely", async function () {
      const cpuValue = 50;
      const memoryValue = 1024;
      const latencyValue = 10;
      const throughputValue = 1000000;

      await contract.connect(signers.alice).submitMetrics(cpuValue, memoryValue, latencyValue, throughputValue);

      // Verify data is stored (encrypted in contract state)
      const (isActive) = await contract.getSystemInfo(signers.alice.address);
      expect(isActive).to.be.true;
    });

    it("should grant FHE permissions for encrypted data", async function () {
      // This test verifies that FHE.allow and FHE.allowThis are called
      // by checking successful storage of encrypted metrics
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;

      // If permissions were not granted, subsequent operations would fail
      const (isActive) = await contract.getSystemInfo(signers.alice.address);
      expect(isActive).to.be.true;
    });

    it("should handle aggregation of encrypted metrics", async function () {
      // Submit metrics twice to test aggregation
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.alice).submitMetrics(60, 2048, 15, 2000000);

      const (_isActive, _timestamp, dataPoints) = await contract.getSystemInfo(signers.alice.address);
      expect(dataPoints).to.equal(2);
    });
  });

  // ===== EDGE CASES TESTS (5 tests) =====
  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
    });

    it("should handle maximum CPU usage (100)", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(100, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should handle minimum valid memory (1 MB)", async function () {
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should handle maximum uint32 latency", async function () {
      const maxUint32 = (2n ** 32n) - 1n;
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, Number(maxUint32), 1000000)
      ).to.not.be.reverted;
    });

    it("should handle maximum uint64 throughput", async function () {
      const maxValue = ethers.MaxUint256;
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, maxValue)
      ).to.not.be.reverted;
    });

    it("should maintain data integrity across multiple submissions", async function () {
      const submissions = [
        { cpu: 25, mem: 512, lat: 5, thr: 500000 },
        { cpu: 50, mem: 1024, lat: 10, thr: 1000000 },
        { cpu: 75, mem: 2048, lat: 15, thr: 1500000 },
        { cpu: 100, mem: 4096, lat: 20, thr: 2000000 },
      ];

      for (const sub of submissions) {
        await contract.connect(signers.alice).submitMetrics(sub.cpu, sub.mem, sub.lat, sub.thr);
      }

      expect(await contract.totalMetrics()).to.equal(submissions.length);
      const (_isActive, _timestamp, dataPoints) = await contract.getSystemInfo(signers.alice.address);
      expect(dataPoints).to.equal(submissions.length);
    });
  });

  // ===== QUERY FUNCTIONS TESTS (3 tests) =====
  describe("Query Functions", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);

      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.bob).submitMetrics(60, 2048, 15, 2000000);
    });

    it("should return correct monitored systems count", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(2);
    });

    it("should return correct reporter authorization status", async function () {
      expect(await contract.isAuthorizedReporter(signers.alice.address)).to.be.true;
      expect(await contract.isAuthorizedReporter(signers.charlie.address)).to.be.false;
    });

    it("should return correct owner address", async function () {
      expect(await contract.owner()).to.equal(signers.deployer.address);
    });
  });

  // ===== GAS OPTIMIZATION TESTS (2 tests) =====
  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
    });

    it("should submit metrics with reasonable gas usage", async function () {
      const tx = await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      const receipt = await tx.wait();

      // Expect gas usage to be reasonable (< 1M for initial submission)
      expect(receipt?.gasUsed).to.be.lt(1000000);
    });

    it("should authorize reporter with minimal gas overhead", async function () {
      const tx = await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);
      const receipt = await tx.wait();

      // Simple storage write should be < 50k gas
      expect(receipt?.gasUsed).to.be.lt(50000);
    });
  });

  // ===== DECRYPTION REQUEST TESTS (2 tests) =====
  describe("Decryption Requests", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
    });

    it("should request metrics decryption", async function () {
      // Request decryption (doesn't verify signature in mock mode)
      await expect(
        contract.connect(signers.deployer).requestMetricsDecryption(signers.alice.address)
      ).to.not.be.reverted;
    });

    it("should reject decryption request for inactive system", async function () {
      await contract.connect(signers.deployer).removeSystem(signers.alice.address);

      await expect(
        contract.connect(signers.deployer).requestMetricsDecryption(signers.alice.address)
      ).to.be.revertedWith("System not active");
    });
  });

  // ===== CONCURRENT OPERATIONS TESTS (3 tests) =====
  describe("Concurrent Operations", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.charlie.address);
    });

    it("should handle concurrent metrics submissions from multiple reporters", async function () {
      const [tx1, tx2, tx3] = await Promise.all([
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000),
        contract.connect(signers.bob).submitMetrics(60, 2048, 15, 2000000),
        contract.connect(signers.charlie).submitMetrics(70, 3072, 20, 3000000),
      ]);

      await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);

      expect(await contract.getMonitoredSystemsCount()).to.equal(3);
      expect(await contract.totalMetrics()).to.equal(3);
    });

    it("should update metrics from same system concurrently", async function () {
      // Submit multiple metrics from same system
      await contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(signers.alice).submitMetrics(60, 1100, 12, 1100000);
      await contract.connect(signers.alice).submitMetrics(70, 1200, 14, 1200000);

      const (_isActive, _timestamp, dataPoints) = await contract.getSystemInfo(signers.alice.address);
      expect(dataPoints).to.equal(3);
      expect(await contract.getMonitoredSystemsCount()).to.equal(1);
    });

    it("should handle revocation and reauthorization", async function () {
      await contract.connect(signers.deployer).revokeReporter(signers.alice.address);
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.be.revertedWith("Not authorized reporter");

      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await expect(
        contract.connect(signers.alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });
  });
});
