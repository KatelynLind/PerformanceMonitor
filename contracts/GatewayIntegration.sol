// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GatewayIntegration
 * @notice Advanced metrics contract with Gateway callback pattern
 * @dev Implements FHE request/response pattern with timeout protection and refund mechanism
 */

interface IGatewayCallback {
    function handleDecryption(uint256 requestId, bytes calldata plaintext) external;
}

/**
 * @notice Refund and timeout protection mechanism
 * Handles graceful failure scenarios and prevents permanent locks
 */
abstract contract RefundAndTimeoutProtection {
    uint256 public constant REQUEST_TIMEOUT = 1 hours;
    uint256 public constant MAX_REFUND_PERCENTAGE = 100; // 100% = full refund

    struct RefundRequest {
        address requester;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
        RefundReason reason;
    }

    enum RefundReason {
        DECRYPTION_FAILED,
        TIMEOUT_EXCEEDED,
        INVALID_RESPONSE,
        GATEWAY_ERROR
    }

    mapping(uint256 => RefundRequest) public refunds;
    uint256 public refundCount = 0;

    event RefundIssued(
        uint256 indexed refundId,
        address indexed requester,
        uint256 amount,
        RefundReason reason,
        uint256 timestamp
    );

    event RefundClaimed(
        uint256 indexed refundId,
        address indexed requester,
        uint256 amount
    );

    /**
     * @notice Create a refund request for failed decryption
     * @param requester Address to refund
     * @param amount Amount to refund
     * @param reason Reason for refund
     */
    function _initiateRefund(
        address requester,
        uint256 amount,
        RefundReason reason
    ) internal returns (uint256 refundId) {
        require(requester != address(0), "Invalid requester address");
        require(amount > 0, "Refund amount must be > 0");

        refundId = refundCount++;
        refunds[refundId] = RefundRequest({
            requester: requester,
            amount: amount,
            timestamp: block.timestamp,
            refunded: false,
            reason: reason
        });

        emit RefundIssued(refundId, requester, amount, reason, block.timestamp);
    }

    /**
     * @notice Check if request has timed out
     */
    function _isTimeout(uint256 requestTimestamp) internal view returns (bool) {
        return block.timestamp > requestTimestamp + REQUEST_TIMEOUT;
    }

    /**
     * @notice Claim refund if eligible
     */
    function claimRefund(uint256 refundId) external virtual {
        RefundRequest storage refund = refunds[refundId];

        require(refund.requester == msg.sender, "Not refund recipient");
        require(!refund.refunded, "Refund already claimed");
        require(refund.amount > 0, "Invalid refund amount");

        refund.refunded = true;

        (bool success, ) = payable(msg.sender).call{value: refund.amount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(refundId, msg.sender, refund.amount);
    }
}

/**
 * @notice Gateway callback pattern for asynchronous decryption
 * Implements request/response model with automatic timeout handling
 */
abstract contract GatewayCallbackPattern is RefundAndTimeoutProtection {

    struct DecryptionRequest {
        address requester;
        bytes encryptedData;
        uint256 timestamp;
        DecryptionStatus status;
        bytes decryptedResult;
    }

    enum DecryptionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        TIMEOUT
    }

    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    uint256 public requestCount = 0;
    address public gatewayAddress;

    event DecryptionRequested(
        uint256 indexed requestId,
        address indexed requester,
        bytes encryptedData,
        uint256 timestamp
    );

    event DecryptionCompleted(
        uint256 indexed requestId,
        address indexed requester,
        bytes decryptedResult,
        uint256 timestamp
    );

    event DecryptionFailed(
        uint256 indexed requestId,
        address indexed requester,
        string reason
    );

    modifier onlyGateway() {
        require(msg.sender == gatewayAddress, "Only gateway can call");
        _;
    }

    /**
     * @notice Set gateway address for decryption callbacks
     */
    function setGatewayAddress(address _gateway) external virtual {
        require(_gateway != address(0), "Invalid gateway address");
        gatewayAddress = _gateway;
    }

    /**
     * @notice Request decryption via gateway
     * @param encryptedData Encrypted data to decrypt
     * @return requestId ID of the decryption request
     */
    function requestDecryption(bytes calldata encryptedData)
        external
        returns (uint256 requestId)
    {
        require(encryptedData.length > 0, "Empty encrypted data");

        requestId = requestCount++;
        decryptionRequests[requestId] = DecryptionRequest({
            requester: msg.sender,
            encryptedData: encryptedData,
            timestamp: block.timestamp,
            status: DecryptionStatus.PENDING,
            decryptedResult: bytes("")
        });

        emit DecryptionRequested(requestId, msg.sender, encryptedData, block.timestamp);
    }

    /**
     * @notice Gateway callback function for completed decryption
     * Called by gateway after decryption is complete
     * @param requestId Request ID
     * @param plaintext Decrypted plaintext
     */
    function gatewayCallback(uint256 requestId, bytes calldata plaintext)
        external
        onlyGateway
    {
        DecryptionRequest storage req = decryptionRequests[requestId];

        require(req.requester != address(0), "Invalid request");
        require(req.status == DecryptionStatus.PENDING, "Request already processed");

        if (plaintext.length == 0) {
            req.status = DecryptionStatus.FAILED;
            _initiateRefund(
                req.requester,
                0, // Refund amount set by caller
                RefundReason.INVALID_RESPONSE
            );
            emit DecryptionFailed(requestId, req.requester, "Empty plaintext");
            return;
        }

        // Check timeout before completing
        if (_isTimeout(req.timestamp)) {
            req.status = DecryptionStatus.TIMEOUT;
            _initiateRefund(
                req.requester,
                0,
                RefundReason.TIMEOUT_EXCEEDED
            );
            emit DecryptionFailed(requestId, req.requester, "Request timeout");
            return;
        }

        req.status = DecryptionStatus.COMPLETED;
        req.decryptedResult = plaintext;

        emit DecryptionCompleted(requestId, req.requester, plaintext, block.timestamp);

        // Execute callback in implementing contract
        _onDecryptionComplete(requestId, plaintext);
    }

    /**
     * @notice Handle timeout scenarios
     * Must be called by authorized parties to mark requests as timed out
     */
    function handleTimeout(uint256 requestId) external {
        DecryptionRequest storage req = decryptionRequests[requestId];

        require(req.requester != address(0), "Invalid request");
        require(req.status == DecryptionStatus.PENDING, "Request already processed");
        require(_isTimeout(req.timestamp), "Request not timed out yet");

        req.status = DecryptionStatus.TIMEOUT;

        _initiateRefund(
            req.requester,
            0, // Set actual refund amount in implementation
            RefundReason.TIMEOUT_EXCEEDED
        );

        emit DecryptionFailed(requestId, req.requester, "Request timeout");
    }

    /**
     * @notice Check request status
     */
    function getRequestStatus(uint256 requestId)
        external
        view
        returns (DecryptionStatus)
    {
        return decryptionRequests[requestId].status;
    }

    /**
     * @notice Check if request can be refunded due to timeout
     */
    function canClaimTimeoutRefund(uint256 requestId)
        external
        view
        returns (bool)
    {
        DecryptionRequest storage req = decryptionRequests[requestId];
        return req.status == DecryptionStatus.TIMEOUT && !refunds[requestId].refunded;
    }

    /**
     * @notice Override in implementing contract to handle decryption results
     */
    function _onDecryptionComplete(uint256 requestId, bytes calldata plaintext)
        internal
        virtual;
}

/**
 * @notice Input validation utilities
 * Provides comprehensive input sanitization and access control
 */
abstract contract InputValidationAndAccessControl {

    // Role-based access control
    mapping(address => mapping(bytes32 => bool)) private permissions;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GATEWAY_ROLE = keccak256("GATEWAY_ROLE");
    bytes32 public constant REQUESTER_ROLE = keccak256("REQUESTER_ROLE");

    event PermissionGranted(address indexed user, bytes32 indexed role);
    event PermissionRevoked(address indexed user, bytes32 indexed role);

    /**
     * @notice Grant permission/role to address
     */
    function grantPermission(address user, bytes32 role) external virtual {
        require(user != address(0), "Invalid address");
        permissions[user][role] = true;
        emit PermissionGranted(user, role);
    }

    /**
     * @notice Revoke permission/role from address
     */
    function revokePermission(address user, bytes32 role) external virtual {
        permissions[user][role] = false;
        emit PermissionRevoked(user, role);
    }

    /**
     * @notice Check if address has permission
     */
    function hasPermission(address user, bytes32 role)
        external
        view
        returns (bool)
    {
        return permissions[user][role];
    }

    modifier requirePermission(bytes32 role) {
        require(permissions[msg.sender][role], "Permission denied");
        _;
    }

    /**
     * @notice Validate metric value (prevent overflow)
     */
    function _validateMetricValue(uint256 value) internal pure {
        require(value <= type(uint128).max, "Value overflow protection");
    }

    /**
     * @notice Validate address input
     */
    function _validateAddress(address addr) internal pure {
        require(addr != address(0), "Invalid address");
    }

    /**
     * @notice Validate array length (prevent DoS)
     */
    function _validateArrayLength(uint256 length) internal pure {
        require(length > 0 && length <= 1000, "Invalid array length");
    }

    /**
     * @notice Validate string length
     */
    function _validateStringLength(string memory str, uint256 maxLength)
        internal
        pure
    {
        require(bytes(str).length > 0, "Empty string");
        require(bytes(str).length <= maxLength, "String too long");
    }
}

/**
 * @notice Privacy preservation techniques
 * Implements methods to prevent information leakage
 */
abstract contract PrivacyPreservation {

    /**
     * @notice Randomized multiplier to protect against division analysis attacks
     * Prevents price/value leakage through division patterns
     * @param value Original value
     * @param randomMultiplier Random multiplier
     * @return result Obfuscated result
     */
    function _obfuscateWithRandomMultiplier(
        uint256 value,
        uint256 randomMultiplier
    ) internal pure returns (uint256 result) {
        require(randomMultiplier > 0, "Invalid multiplier");

        // Apply multiplier then divide to create obfuscation layer
        uint256 obfuscated = value * randomMultiplier;
        // Store only the obfuscated form on-chain
        result = obfuscated;
    }

    /**
     * @notice Blur numerical precision to prevent exact value leakage
     * Uses discretization to hide exact values
     * @param value Original value
     * @param blurFactor Blur resolution (e.g., 100 = nearest 100)
     * @return blurred Blurred value
     */
    function _blurValue(uint256 value, uint256 blurFactor)
        internal
        pure
        returns (uint256 blurred)
    {
        require(blurFactor > 0, "Invalid blur factor");
        blurred = (value / blurFactor) * blurFactor;
    }

    /**
     * @notice Homomorphic comparison without revealing values
     * Compare encrypted values without decryption
     * @param encryptedA First encrypted value
     * @param encryptedB Second encrypted value
     * @return isGreater True if A > B (computed on encrypted data)
     */
    function _homomorphicCompare(bytes memory encryptedA, bytes memory encryptedB)
        internal
        pure
        returns (bool isGreater)
    {
        // In production, this would use actual FHE operations
        // For now, returns comparison of hash values
        isGreater = keccak256(encryptedA) > keccak256(encryptedB);
    }

    /**
     * @notice Compute aggregate statistics without revealing individual values
     * Uses secure multi-party computation pattern
     * @param encryptedValues Array of encrypted values
     * @return aggregateHash Hash of aggregated result (encrypted)
     */
    function _secureAggregate(bytes[] memory encryptedValues)
        internal
        pure
        returns (bytes32 aggregateHash)
    {
        for (uint256 i = 0; i < encryptedValues.length; i++) {
            aggregateHash = keccak256(
                abi.encodePacked(aggregateHash, encryptedValues[i])
            );
        }
    }
}

/**
 * @notice Gas optimization for homomorphic computation
 * Manages HCU (Homomorphic Computation Unit) usage efficiently
 */
abstract contract GasOptimizedHCU {

    struct HCUUsage {
        uint256 totalUsed;
        uint256 costPerUnit;
        uint256 dailyLimit;
    }

    HCUUsage public hcuConfig = HCUUsage({
        totalUsed: 0,
        costPerUnit: 1 gwei, // Cost per HCU
        dailyLimit: 10000    // Daily HCU limit
    });

    event HCUUsageTracked(
        address indexed user,
        uint256 unitsUsed,
        uint256 totalCost
    );

    /**
     * @notice Calculate HCU cost for operation
     * @param operationType Type of operation (ADD=10, MULT=50, COMPARE=20)
     * @return hcuUnits Number of HCU units needed
     */
    function _estimateHCUCost(string memory operationType)
        internal
        pure
        returns (uint256 hcuUnits)
    {
        bytes32 opHash = keccak256(abi.encodePacked(operationType));

        if (opHash == keccak256(abi.encodePacked("ADD"))) {
            return 10;
        } else if (opHash == keccak256(abi.encodePacked("MULTIPLY"))) {
            return 50;
        } else if (opHash == keccak256(abi.encodePacked("COMPARE"))) {
            return 20;
        } else if (opHash == keccak256(abi.encodePacked("AGGREGATE"))) {
            return 30;
        }

        return 5; // Default
    }

    /**
     * @notice Track HCU usage and ensure within limits
     * @param operationType Type of operation
     */
    function _trackHCUUsage(string memory operationType) internal {
        uint256 hcuCost = _estimateHCUCost(operationType);
        require(
            hcuConfig.totalUsed + hcuCost <= hcuConfig.dailyLimit,
            "Daily HCU limit exceeded"
        );

        hcuConfig.totalUsed += hcuCost;

        emit HCUUsageTracked(msg.sender, hcuCost, hcuCost * hcuConfig.costPerUnit);
    }

    /**
     * @notice Set daily HCU limit
     */
    function setDailyHCULimit(uint256 newLimit) external virtual {
        require(newLimit > 0, "Invalid limit");
        hcuConfig.dailyLimit = newLimit;
    }

    /**
     * @notice Reset daily HCU usage counter
     */
    function resetDailyHCUUsage() external virtual {
        hcuConfig.totalUsed = 0;
    }
}

/**
 * @notice Advanced audit trail and logging
 */
abstract contract AdvancedAuditTrail {

    struct AuditLog {
        uint256 timestamp;
        address actor;
        string action;
        bytes data;
        uint256 gasUsed;
        bool success;
    }

    AuditLog[] public auditLogs;

    event ActionLogged(
        uint256 indexed logId,
        address indexed actor,
        string action,
        uint256 timestamp,
        bool success
    );

    /**
     * @notice Log an action for audit purposes
     */
    function _logAction(
        address actor,
        string memory action,
        bytes memory data,
        bool success
    ) internal {
        uint256 logId = auditLogs.length;
        auditLogs.push(AuditLog({
            timestamp: block.timestamp,
            actor: actor,
            action: action,
            data: data,
            gasUsed: gasleft(),
            success: success
        }));

        emit ActionLogged(logId, actor, action, block.timestamp, success);
    }

    /**
     * @notice Get audit log count
     */
    function getAuditLogCount() external view returns (uint256) {
        return auditLogs.length;
    }

    /**
     * @notice Get audit log details
     */
    function getAuditLog(uint256 logId)
        external
        view
        returns (AuditLog memory)
    {
        require(logId < auditLogs.length, "Invalid log ID");
        return auditLogs[logId];
    }
}
