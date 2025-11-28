// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PerformanceMonitor
 * @dev A contract for monitoring and recording system performance metrics
 */
contract PerformanceMonitor {
    struct Metric {
        uint256 timestamp;
        string metricName;
        uint256 value;
        string unit;
        address recorder;
    }

    Metric[] public metrics;
    mapping(address => uint256[]) public userMetrics;
    mapping(address => bool) public authorizedRecorders;
    address public owner;

    event MetricRecorded(
        uint256 indexed id,
        address indexed recorder,
        string metricName,
        uint256 value,
        uint256 timestamp
    );
    event RecorderAuthorized(address indexed recorder);
    event RecorderRevoked(address indexed recorder);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedRecorders[msg.sender] || msg.sender == owner,
            "Not authorized to record metrics"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedRecorders[msg.sender] = true;
    }

    /**
     * @dev Record a new performance metric
     * @param metricName Name of the metric
     * @param value Value of the metric
     * @param unit Unit of measurement
     */
    function recordMetric(
        string memory metricName,
        uint256 value,
        string memory unit
    ) external onlyAuthorized {
        Metric memory newMetric = Metric({
            timestamp: block.timestamp,
            metricName: metricName,
            value: value,
            unit: unit,
            recorder: msg.sender
        });

        uint256 metricId = metrics.length;
        metrics.push(newMetric);
        userMetrics[msg.sender].push(metricId);

        emit MetricRecorded(metricId, msg.sender, metricName, value, block.timestamp);
    }

    /**
     * @dev Get total count of metrics
     */
    function getMetricsCount() external view returns (uint256) {
        return metrics.length;
    }

    /**
     * @dev Get metrics for a specific user
     */
    function getUserMetrics(address user) external view returns (uint256[] memory) {
        return userMetrics[user];
    }

    /**
     * @dev Get metric details by ID
     */
    function getMetric(uint256 id)
        external
        view
        returns (
            uint256 timestamp,
            string memory metricName,
            uint256 value,
            string memory unit,
            address recorder
        )
    {
        require(id < metrics.length, "Metric does not exist");
        Metric memory metric = metrics[id];
        return (
            metric.timestamp,
            metric.metricName,
            metric.value,
            metric.unit,
            metric.recorder
        );
    }

    /**
     * @dev Get latest N metrics
     */
    function getLatestMetrics(uint256 count)
        external
        view
        returns (Metric[] memory)
    {
        uint256 total = metrics.length;
        uint256 resultCount = count > total ? total : count;
        Metric[] memory result = new Metric[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = metrics[total - 1 - i];
        }

        return result;
    }

    /**
     * @dev Calculate average of all metric values
     */
    function getAverageValue() external view returns (uint256) {
        if (metrics.length == 0) return 0;

        uint256 sum = 0;
        for (uint256 i = 0; i < metrics.length; i++) {
            sum += metrics[i].value;
        }

        return sum / metrics.length;
    }

    /**
     * @dev Authorize a new recorder
     */
    function authorizeRecorder(address recorder) external onlyOwner {
        authorizedRecorders[recorder] = true;
        emit RecorderAuthorized(recorder);
    }

    /**
     * @dev Revoke recorder authorization
     */
    function revokeRecorder(address recorder) external onlyOwner {
        require(recorder != owner, "Cannot revoke owner");
        authorizedRecorders[recorder] = false;
        emit RecorderRevoked(recorder);
    }

    /**
     * @dev Check if an address is authorized
     */
    function isAuthorized(address recorder) external view returns (bool) {
        return authorizedRecorders[recorder];
    }
}
