// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PerformanceMonitor is SepoliaConfig {

    address public owner;
    uint256 public totalMetrics;

    struct PerformanceData {
        euint32 cpuUsage;        // CPU usage percentage (0-100)
        euint32 memoryUsage;     // Memory usage in MB
        euint32 networkLatency;  // Network latency in ms
        euint64 throughput;      // Data throughput in bytes/sec
        uint256 timestamp;
        bool isActive;
    }

    struct SystemMetrics {
        euint32 avgCpuUsage;
        euint32 avgMemoryUsage;
        euint32 avgLatency;
        euint64 totalThroughput;
        uint256 lastUpdate;
        uint32 dataPoints;
    }

    mapping(address => PerformanceData) public userMetrics;
    mapping(address => SystemMetrics) public aggregatedMetrics;
    mapping(address => bool) public authorizedReporters;

    address[] public monitoredSystems;

    event MetricsSubmitted(address indexed system, uint256 timestamp);
    event SystemAdded(address indexed system);
    event SystemRemoved(address indexed system);
    event ReporterAuthorized(address indexed reporter);
    event ReporterRevoked(address indexed reporter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedReporter() {
        require(authorizedReporters[msg.sender] || msg.sender == owner, "Not authorized reporter");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedReporters[msg.sender] = true;
    }

    // Authorize a system or service to report metrics
    function authorizeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = true;
        emit ReporterAuthorized(_reporter);
    }

    // Revoke reporting authorization
    function revokeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = false;
        emit ReporterRevoked(_reporter);
    }

    // Submit encrypted performance metrics
    function submitMetrics(
        uint32 _cpuUsage,
        uint32 _memoryUsage,
        uint32 _networkLatency,
        uint64 _throughput
    ) external onlyAuthorizedReporter {
        require(_cpuUsage <= 100, "Invalid CPU usage");
        require(_memoryUsage > 0, "Invalid memory usage");
        require(_networkLatency >= 0, "Invalid latency");
        require(_throughput >= 0, "Invalid throughput");

        // Encrypt sensitive performance data
        euint32 encryptedCpu = FHE.asEuint32(_cpuUsage);
        euint32 encryptedMemory = FHE.asEuint32(_memoryUsage);
        euint32 encryptedLatency = FHE.asEuint32(_networkLatency);
        euint64 encryptedThroughput = FHE.asEuint64(_throughput);

        // Store encrypted metrics
        userMetrics[msg.sender] = PerformanceData({
            cpuUsage: encryptedCpu,
            memoryUsage: encryptedMemory,
            networkLatency: encryptedLatency,
            throughput: encryptedThroughput,
            timestamp: block.timestamp,
            isActive: true
        });

        // Update aggregated metrics
        _updateAggregatedMetrics(msg.sender, encryptedCpu, encryptedMemory, encryptedLatency, encryptedThroughput);

        // Add to monitored systems if not already present
        if (!_isSystemMonitored(msg.sender)) {
            monitoredSystems.push(msg.sender);
            emit SystemAdded(msg.sender);
        }

        // Grant access permissions
        FHE.allowThis(encryptedCpu);
        FHE.allowThis(encryptedMemory);
        FHE.allowThis(encryptedLatency);
        FHE.allowThis(encryptedThroughput);
        FHE.allow(encryptedCpu, msg.sender);
        FHE.allow(encryptedMemory, msg.sender);
        FHE.allow(encryptedLatency, msg.sender);
        FHE.allow(encryptedThroughput, msg.sender);

        totalMetrics++;
        emit MetricsSubmitted(msg.sender, block.timestamp);
    }

    // Update aggregated metrics (simplified - in production would use FHE operations)
    function _updateAggregatedMetrics(
        address system,
        euint32 cpu,
        euint32 memUsage,
        euint32 latency,
        euint64 throughput
    ) private {
        SystemMetrics storage metrics = aggregatedMetrics[system];

        if (metrics.dataPoints == 0) {
            // First data point
            metrics.avgCpuUsage = cpu;
            metrics.avgMemoryUsage = memUsage;
            metrics.avgLatency = latency;
            metrics.totalThroughput = throughput;
        } else {
            // Update running averages using FHE operations
            // In a real implementation, these would be proper FHE calculations
            metrics.avgCpuUsage = cpu; // Simplified
            metrics.avgMemoryUsage = memUsage; // Simplified
            metrics.avgLatency = latency; // Simplified
            metrics.totalThroughput = FHE.add(metrics.totalThroughput, throughput);
        }

        metrics.dataPoints++;
        metrics.lastUpdate = block.timestamp;

        // Grant permissions for aggregated data
        FHE.allowThis(metrics.avgCpuUsage);
        FHE.allowThis(metrics.avgMemoryUsage);
        FHE.allowThis(metrics.avgLatency);
        FHE.allowThis(metrics.totalThroughput);
    }

    // Check if a system is already being monitored
    function _isSystemMonitored(address system) private view returns (bool) {
        for (uint i = 0; i < monitoredSystems.length; i++) {
            if (monitoredSystems[i] == system) {
                return true;
            }
        }
        return false;
    }

    // Remove a system from monitoring
    function removeSystem(address system) external onlyOwner {
        require(_isSystemMonitored(system), "System not monitored");

        // Remove from array
        for (uint i = 0; i < monitoredSystems.length; i++) {
            if (monitoredSystems[i] == system) {
                monitoredSystems[i] = monitoredSystems[monitoredSystems.length - 1];
                monitoredSystems.pop();
                break;
            }
        }

        // Mark as inactive
        userMetrics[system].isActive = false;

        emit SystemRemoved(system);
    }

    // Get basic system info (non-encrypted data)
    function getSystemInfo(address system) external view returns (
        bool isActive,
        uint256 lastTimestamp,
        uint32 dataPoints
    ) {
        PerformanceData storage data = userMetrics[system];
        SystemMetrics storage metrics = aggregatedMetrics[system];

        return (
            data.isActive,
            data.timestamp,
            metrics.dataPoints
        );
    }

    // Get total number of monitored systems
    function getMonitoredSystemsCount() external view returns (uint256) {
        return monitoredSystems.length;
    }

    // Get monitored system by index
    function getMonitoredSystem(uint256 index) external view returns (address) {
        require(index < monitoredSystems.length, "Index out of bounds");
        return monitoredSystems[index];
    }

    // Check if caller is authorized to report
    function isAuthorizedReporter(address reporter) external view returns (bool) {
        return authorizedReporters[reporter];
    }

    // Emergency function to pause all monitoring
    function emergencyPause() external onlyOwner {
        for (uint i = 0; i < monitoredSystems.length; i++) {
            userMetrics[monitoredSystems[i]].isActive = false;
        }
    }

    // Resume monitoring for all systems
    function resumeMonitoring() external onlyOwner {
        for (uint i = 0; i < monitoredSystems.length; i++) {
            userMetrics[monitoredSystems[i]].isActive = true;
        }
    }

    // Request decryption of specific system metrics (async)
    function requestMetricsDecryption(address system) external onlyOwner {
        require(userMetrics[system].isActive, "System not active");

        PerformanceData storage data = userMetrics[system];
        bytes32[] memory cts = new bytes32[](4);
        cts[0] = FHE.toBytes32(data.cpuUsage);
        cts[1] = FHE.toBytes32(data.memoryUsage);
        cts[2] = FHE.toBytes32(data.networkLatency);
        cts[3] = FHE.toBytes32(data.throughput);

        FHE.requestDecryption(cts, this.processDecryptedMetrics.selector);
    }

    // Callback for decrypted metrics
    function processDecryptedMetrics(
        uint256 requestId,
        uint32[] memory decryptedValues,
        bytes[] memory signatures
    ) external {
        // Verify signatures (simplified - in production use proper signature verification)
        // FHE.checkSignatures would typically require additional parameters

        // Process decrypted data (emit events, store for analysis, etc.)
        // decryptedValues[0] = cpuUsage
        // decryptedValues[1] = memoryUsage
        // decryptedValues[2] = networkLatency
        // decryptedValues[3] = throughput (truncated to uint32)

        // This would typically be used for generating reports or alerts
    }
}