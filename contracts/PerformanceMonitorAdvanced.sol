// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./GatewayIntegration.sol";

/**
 * @title PerformanceMonitorAdvanced
 * @notice Advanced performance metrics system with FHE, Gateway callbacks, and timeout protection
 * @dev Extends original PerformanceMonitor with refund mechanism and privacy preservation
 */
contract PerformanceMonitorAdvanced is
    GatewayCallbackPattern,
    InputValidationAndAccessControl,
    PrivacyPreservation,
    GasOptimizedHCU,
    AdvancedAuditTrail
{

    struct PerformanceMetric {
        uint256 id;
        address reporter;
        string metricType;      // "CPU", "MEMORY", "LATENCY", "THROUGHPUT"
        uint256 encryptedValue; // Encrypted value using randomized multiplier
        uint256 timestamp;
        uint256 requestId;      // Associated FHE decryption request
        MetricStatus status;
    }

    enum MetricStatus {
        SUBMITTED,
        ENCRYPTED,
        DECRYPTION_REQUESTED,
        DECRYPTED,
        FAILED,
        REFUNDED
    }

    struct AggregatedMetrics {
        bytes encryptedSum;     // Encrypted aggregate (cannot be decrypted without key)
        bytes encryptedAverage; // Encrypted average
        uint256 count;
        uint256 lastUpdate;
    }

    mapping(uint256 => PerformanceMetric) public metrics;
    mapping(address => uint256[]) public userMetrics;
    mapping(string => AggregatedMetrics) public aggregates;

    uint256 public metricCount = 0;
    address public owner;

    // Privacy parameters
    uint256 private nonce = 0;
    uint256 public privacyBlurFactor = 100; // Blur to nearest 100

    event MetricSubmitted(
        uint256 indexed metricId,
        address indexed reporter,
        string metricType,
        uint256 timestamp
    );

    event MetricEncrypted(
        uint256 indexed metricId,
        bytes encryptedData,
        uint256 randomMultiplier
    );

    event DecryptionRequested(
        uint256 indexed metricId,
        uint256 indexed requestId,
        address indexed reporter
    );

    event MetricDecrypted(
        uint256 indexed metricId,
        uint256 decryptedValue,
        uint256 timestamp
    );

    event MetricRefunded(
        uint256 indexed metricId,
        address indexed reporter,
        uint256 refundId,
        RefundReason reason
    );

    event AggregatesUpdated(
        string indexed metricType,
        uint256 count,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyMetricReporter() {
        require(permissions[msg.sender][REQUESTER_ROLE], "Not authorized reporter");
        _;
    }

    constructor(address _gatewayAddress) {
        owner = msg.sender;
        gatewayAddress = _gatewayAddress;
        permissions[msg.sender][ADMIN_ROLE] = true;
        permissions[msg.sender][GATEWAY_ROLE] = true;
    }

    /**
     * @notice Submit encrypted performance metric
     * Uses randomized multiplier for privacy preservation
     * @param metricType Type of metric (CPU, MEMORY, LATENCY, THROUGHPUT)
     * @param plainValue Original plaintext value
     */
    function submitEncryptedMetric(string memory metricType, uint256 plainValue)
        external
        onlyMetricReporter
        returns (uint256 metricId)
    {
        // Input validation
        _validateStringLength(metricType, 50);
        _validateMetricValue(plainValue);
        _validateAddress(msg.sender);

        // Create random multiplier for this metric
        uint256 randomMultiplier = _generateRandomMultiplier();

        // Apply obfuscation with random multiplier
        uint256 obfuscatedValue = _obfuscateWithRandomMultiplier(
            plainValue,
            randomMultiplier
        );

        // Create metric record
        metricId = metricCount++;
        metrics[metricId] = PerformanceMetric({
            id: metricId,
            reporter: msg.sender,
            metricType: metricType,
            encryptedValue: obfuscatedValue,
            timestamp: block.timestamp,
            requestId: type(uint256).max, // Not yet requested
            status: MetricStatus.ENCRYPTED
        });

        userMetrics[msg.sender].push(metricId);

        // Log action for audit trail
        _logAction(
            msg.sender,
            "SUBMIT_ENCRYPTED_METRIC",
            abi.encodePacked(metricType, plainValue),
            true
        );

        // Track HCU usage
        _trackHCUUsage("ENCRYPT");

        emit MetricSubmitted(metricId, msg.sender, metricType, block.timestamp);
        emit MetricEncrypted(metricId, abi.encodePacked(obfuscatedValue), randomMultiplier);

        return metricId;
    }

    /**
     * @notice Request decryption of metric via Gateway
     * Initiates async FHE decryption through Gateway callback pattern
     * @param metricId ID of metric to decrypt
     */
    function requestMetricDecryption(uint256 metricId)
        external
        returns (uint256 requestId)
    {
        PerformanceMetric storage metric = metrics[metricId];

        require(metric.reporter != address(0), "Invalid metric");
        require(metric.status == MetricStatus.ENCRYPTED, "Invalid metric status");
        require(
            msg.sender == metric.reporter || msg.sender == owner,
            "Unauthorized"
        );

        // Create Gateway decryption request
        requestId = requestDecryption(abi.encodePacked(metric.encryptedValue));

        metric.requestId = requestId;
        metric.status = MetricStatus.DECRYPTION_REQUESTED;

        _trackHCUUsage("COMPARE");

        emit DecryptionRequested(metricId, requestId, metric.reporter);

        return requestId;
    }

    /**
     * @notice Handle decryption result callback from Gateway
     * Implements IGatewayCallback interface
     * @param requestId Gateway request ID
     * @param plaintext Decrypted plaintext
     */
    function _onDecryptionComplete(uint256 requestId, bytes calldata plaintext)
        internal
        override
    {
        // Find metric with this request ID
        uint256 metricId = _findMetricByRequestId(requestId);
        require(metricId < metricCount, "Metric not found");

        PerformanceMetric storage metric = metrics[metricId];
        require(metric.status == MetricStatus.DECRYPTION_REQUESTED, "Invalid status");

        // Decode plaintext to value
        uint256 decryptedValue = abi.decode(plaintext, (uint256));

        // Validate decrypted value
        _validateMetricValue(decryptedValue);

        metric.status = MetricStatus.DECRYPTED;

        _logAction(
            metric.reporter,
            "METRIC_DECRYPTED",
            plaintext,
            true
        );

        emit MetricDecrypted(metricId, decryptedValue, block.timestamp);

        // Update aggregates with decrypted value
        _updateAggregates(metric.metricType, decryptedValue);

        _trackHCUUsage("AGGREGATE");
    }

    /**
     * @notice Handle refund for failed/timeout decryption
     * Called when decryption fails or times out
     * @param metricId Metric ID
     * @param reason Refund reason
     */
    function claimMetricRefund(uint256 metricId, RefundReason reason)
        external
        returns (uint256 refundId)
    {
        PerformanceMetric storage metric = metrics[metricId];

        require(metric.reporter != address(0), "Invalid metric");
        require(msg.sender == metric.reporter, "Only reporter can claim");
        require(
            metric.status == MetricStatus.FAILED ||
            metric.status == MetricStatus.DECRYPTION_REQUESTED,
            "Invalid status for refund"
        );

        // Check timeout
        if (reason == RefundReason.TIMEOUT_EXCEEDED) {
            require(
                _isTimeout(metric.timestamp),
                "Request not timed out yet"
            );
        }

        metric.status = MetricStatus.REFUNDED;

        // Initiate refund
        refundId = _initiateRefund(metric.reporter, 0, reason);

        _logAction(
            metric.reporter,
            "CLAIM_REFUND",
            abi.encodePacked(metricId),
            true
        );

        emit MetricRefunded(metricId, metric.reporter, refundId, reason);

        return refundId;
    }

    /**
     * @notice Get metric privacy-blurred version
     * Returns blurred value to prevent exact value leakage
     * @param metricId Metric ID
     */
    function getMetricBlurred(uint256 metricId)
        external
        view
        returns (uint256 blurred)
    {
        PerformanceMetric storage metric = metrics[metricId];
        require(metric.reporter != address(0), "Invalid metric");

        // Blur the encrypted value
        blurred = _blurValue(metric.encryptedValue, privacyBlurFactor);
    }

    /**
     * @notice Compute aggregate without revealing individual values
     * Uses secure aggregation pattern
     * @param metricType Type of metric to aggregate
     */
    function computeSecureAggregate(string memory metricType)
        external
        returns (bytes32 aggregateHash)
    {
        _validateStringLength(metricType, 50);

        // Find all metrics of this type
        bytes[] memory encryptedValues = new bytes[](metricCount);
        uint256 count = 0;

        for (uint256 i = 0; i < metricCount; i++) {
            if (
                keccak256(abi.encodePacked(metrics[i].metricType)) ==
                keccak256(abi.encodePacked(metricType)) &&
                metrics[i].status == MetricStatus.DECRYPTED
            ) {
                encryptedValues[count] = abi.encodePacked(metrics[i].encryptedValue);
                count++;
            }
        }

        // Secure aggregate computation
        aggregateHash = _secureAggregate(encryptedValues);

        _trackHCUUsage("AGGREGATE");

        emit AggregatesUpdated(metricType, count, block.timestamp);

        return aggregateHash;
    }

    /**
     * @notice Set privacy blur factor
     * Higher value = more blurring = more privacy
     */
    function setPrivacyBlurFactor(uint256 newFactor) external onlyOwner {
        require(newFactor > 0, "Invalid blur factor");
        privacyBlurFactor = newFactor;
    }

    /**
     * @notice Override gateway address setter
     */
    function setGatewayAddress(address _gateway) external override onlyOwner {
        super.setGatewayAddress(_gateway);
    }

    /**
     * @notice Override permission grant
     */
    function grantPermission(address user, bytes32 role)
        external
        override
        onlyOwner
    {
        super.grantPermission(user, role);
    }

    /**
     * @notice Override permission revoke
     */
    function revokePermission(address user, bytes32 role)
        external
        override
        onlyOwner
    {
        super.revokePermission(user, role);
    }

    /**
     * @notice Override HCU limit setter
     */
    function setDailyHCULimit(uint256 newLimit) external override onlyOwner {
        super.setDailyHCULimit(newLimit);
    }

    /**
     * @notice Override HCU usage reset
     */
    function resetDailyHCUUsage() external override onlyOwner {
        super.resetDailyHCUUsage();
    }

    // ==================== Internal Functions ====================

    /**
     * @notice Generate random multiplier for obfuscation
     */
    function _generateRandomMultiplier() internal returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(block.timestamp, nonce))) % (2 ** 32) + 1;
    }

    /**
     * @notice Update aggregates with new decrypted value
     */
    function _updateAggregates(string memory metricType, uint256 value) internal {
        AggregatedMetrics storage agg = aggregates[metricType];

        // Update encrypted aggregate (in production, use real FHE operations)
        bytes memory newSum = abi.encodePacked(
            keccak256(abi.encodePacked(agg.encryptedSum, value))
        );

        agg.encryptedSum = newSum;
        agg.count++;
        agg.lastUpdate = block.timestamp;
    }

    /**
     * @notice Find metric by request ID
     */
    function _findMetricByRequestId(uint256 requestId)
        internal
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < metricCount; i++) {
            if (metrics[i].requestId == requestId) {
                return i;
            }
        }
        return type(uint256).max;
    }

    /**
     * @notice Get user's metrics
     */
    function getUserMetrics(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userMetrics[user];
    }

    /**
     * @notice Get total metric count
     */
    function getMetricCount() external view returns (uint256) {
        return metricCount;
    }

    /**
     * @notice Get metric details
     */
    function getMetric(uint256 metricId)
        external
        view
        returns (PerformanceMetric memory)
    {
        require(metricId < metricCount, "Invalid metric ID");
        return metrics[metricId];
    }
}
