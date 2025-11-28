import { expect } from "chai";
import { ethers } from "hardhat";
import { PerformanceMonitor } from "../types";

describe("PerformanceMonitor - Basic Tests", function () {
  let contract: PerformanceMonitor;
  let owner: any;
  let alice: any;
  let bob: any;

  beforeEach(async function () {
    const [ownerSigner, aliceSigner, bobSigner] = await ethers.getSigners();
    owner = ownerSigner;
    alice = aliceSigner;
    bob = bobSigner;

    const factory = await ethers.getContractFactory("PerformanceMonitor");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy contract successfully", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
    });

    it("should set owner correctly", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should initialize with zero metrics", async function () {
      expect(await contract.totalMetrics()).to.equal(0n);
    });

    it("should initialize with empty monitored systems", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(0n);
    });

    it("should authorize owner as reporter", async function () {
      expect(await contract.isAuthorizedReporter(owner.address)).to.be.true;
    });
  });

  describe("Authorization Tests", function () {
    it("should authorize a reporter", async function () {
      await expect(contract.authorizeReporter(alice.address))
        .to.emit(contract, "ReporterAuthorized")
        .withArgs(alice.address);

      expect(await contract.isAuthorizedReporter(alice.address)).to.be.true;
    });

    it("should reject unauthorized reporter authorization", async function () {
      await expect(
        contract.connect(bob).authorizeReporter(alice.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should revoke reporter authorization", async function () {
      await contract.authorizeReporter(alice.address);

      await expect(contract.revokeReporter(alice.address))
        .to.emit(contract, "ReporterRevoked")
        .withArgs(alice.address);

      expect(await contract.isAuthorizedReporter(alice.address)).to.be.false;
    });

    it("should reject metrics from unauthorized reporter", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.be.revertedWith("Not authorized reporter");
    });

    it("should allow authorized reporter to submit", async function () {
      await contract.authorizeReporter(alice.address);

      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });
  });

  describe("Metrics Submission", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
    });

    it("should submit metrics successfully", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.emit(contract, "MetricsSubmitted");
    });

    it("should increment total metrics counter", async function () {
      const initialCount = await contract.totalMetrics();

      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      expect(await contract.totalMetrics()).to.equal(initialCount + 1n);
    });

    it("should add system to monitored list", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(0n);

      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(1n);
      expect(await contract.getMonitoredSystem(0)).to.equal(alice.address);
    });

    it("should emit SystemAdded event", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.emit(contract, "SystemAdded");
    });

    it("should reject CPU usage > 100", async function () {
      await expect(
        contract.connect(alice).submitMetrics(101, 1024, 10, 1000000)
      ).to.be.revertedWith("Invalid CPU usage");
    });

    it("should accept CPU usage of 100", async function () {
      await expect(
        contract.connect(alice).submitMetrics(100, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept CPU usage of 0", async function () {
      await expect(
        contract.connect(alice).submitMetrics(0, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should reject zero memory usage", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 0, 10, 1000000)
      ).to.be.revertedWith("Invalid memory usage");
    });

    it("should accept valid memory usage", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1, 10, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept zero latency", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 0, 1000000)
      ).to.not.be.reverted;
    });

    it("should accept zero throughput", async function () {
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 0)
      ).to.not.be.reverted;
    });
  });

  describe("System Monitoring", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
      await contract.authorizeReporter(bob.address);
    });

    it("should track multiple systems", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(bob).submitMetrics(60, 2048, 15, 2000000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(2n);
    });

    it("should not duplicate systems on multiple submissions", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(alice).submitMetrics(55, 1100, 12, 1100000);

      expect(await contract.getMonitoredSystemsCount()).to.equal(1n);
    });

    it("should retrieve system by index", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      const system = await contract.getMonitoredSystem(0);
      expect(system).to.equal(alice.address);
    });

    it("should revert on out-of-bounds index", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      await expect(
        contract.getMonitoredSystem(10)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("should remove system from monitoring", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      await expect(contract.removeSystem(alice.address))
        .to.emit(contract, "SystemRemoved")
        .withArgs(alice.address);

      const [isActive] = await contract.getSystemInfo(alice.address);
      expect(isActive).to.be.false;
    });

    it("should reject removal of non-monitored system", async function () {
      await expect(
        contract.removeSystem(bob.address)
      ).to.be.revertedWith("System not monitored");
    });

    it("should return system info", async function () {
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);

      const [isActive, _timestamp, dataPoints] = await contract.getSystemInfo(
        alice.address
      );
      expect(isActive).to.be.true;
      expect(dataPoints).to.equal(1n);
    });
  });

  describe("Emergency Controls", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
      await contract.authorizeReporter(bob.address);

      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(bob).submitMetrics(60, 2048, 15, 2000000);
    });

    it("should pause all systems", async function () {
      await contract.emergencyPause();

      const [aliceActive] = await contract.getSystemInfo(alice.address);
      const [bobActive] = await contract.getSystemInfo(bob.address);

      expect(aliceActive).to.be.false;
      expect(bobActive).to.be.false;
    });

    it("should reject non-owner pause", async function () {
      await expect(
        contract.connect(alice).emergencyPause()
      ).to.be.revertedWith("Not authorized");
    });

    it("should resume all systems", async function () {
      await contract.emergencyPause();
      await contract.resumeMonitoring();

      const [aliceActive] = await contract.getSystemInfo(alice.address);
      const [bobActive] = await contract.getSystemInfo(bob.address);

      expect(aliceActive).to.be.true;
      expect(bobActive).to.be.true;
    });

    it("should reject non-owner resume", async function () {
      await contract.emergencyPause();

      await expect(
        contract.connect(alice).resumeMonitoring()
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
    });

    it("should handle maximum uint32 latency", async function () {
      const maxUint32 = (1n << 32n) - 1n;
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, Number(maxUint32), 1000000)
      ).to.not.be.reverted;
    });

    it("should handle large throughput values", async function () {
      const largeValue = ethers.parseUnits("1000000000", 0);
      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, largeValue)
      ).to.not.be.reverted;
    });

    it("should maintain integrity across multiple submissions", async function () {
      const submissions = [
        { cpu: 25, mem: 512, lat: 5, thr: 500000n },
        { cpu: 50, mem: 1024, lat: 10, thr: 1000000n },
        { cpu: 75, mem: 2048, lat: 15, thr: 1500000n },
        { cpu: 100, mem: 4096, lat: 20, thr: 2000000n },
      ];

      for (const sub of submissions) {
        await contract
          .connect(alice)
          .submitMetrics(sub.cpu, sub.mem, sub.lat, sub.thr);
      }

      expect(await contract.totalMetrics()).to.equal(submissions.length);
      const [, , dataPoints] = await contract.getSystemInfo(alice.address);
      expect(dataPoints).to.equal(submissions.length);
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
      await contract.authorizeReporter(bob.address);

      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);
      await contract.connect(bob).submitMetrics(60, 2048, 15, 2000000);
    });

    it("should return monitored systems count", async function () {
      expect(await contract.getMonitoredSystemsCount()).to.equal(2n);
    });

    it("should return reporter authorization status", async function () {
      expect(await contract.isAuthorizedReporter(alice.address)).to.be.true;
      expect(await contract.isAuthorizedReporter(bob.address)).to.be.true;
    });

    it("should return owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Gas Efficiency", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
    });

    it("should submit metrics with reasonable gas", async function () {
      const tx = await contract
        .connect(alice)
        .submitMetrics(50, 1024, 10, 1000000);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(1000000n);
    });

    it("should authorize with minimal gas", async function () {
      const tx = await contract.authorizeReporter(bob.address);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(100000n);
    });
  });

  describe("Decryption Requests", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
      await contract.connect(alice).submitMetrics(50, 1024, 10, 1000000);
    });

    it("should request metrics decryption", async function () {
      await expect(contract.requestMetricsDecryption(alice.address)).to.not.be
        .reverted;
    });

    it("should reject decryption for inactive system", async function () {
      await contract.removeSystem(alice.address);

      await expect(
        contract.requestMetricsDecryption(alice.address)
      ).to.be.revertedWith("System not active");
    });
  });

  describe("Concurrent Operations", function () {
    beforeEach(async function () {
      await contract.authorizeReporter(alice.address);
      await contract.authorizeReporter(bob.address);
    });

    it("should handle multiple concurrent submissions", async function () {
      const [tx1, tx2] = await Promise.all([
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000),
        contract.connect(bob).submitMetrics(60, 2048, 15, 2000000),
      ]);

      await Promise.all([tx1.wait(), tx2.wait()]);

      expect(await contract.getMonitoredSystemsCount()).to.equal(2n);
      expect(await contract.totalMetrics()).to.equal(2n);
    });

    it("should handle revocation and reauthorization", async function () {
      await contract.revokeReporter(alice.address);

      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.be.revertedWith("Not authorized reporter");

      await contract.authorizeReporter(alice.address);

      await expect(
        contract.connect(alice).submitMetrics(50, 1024, 10, 1000000)
      ).to.not.be.reverted;
    });
  });
});
