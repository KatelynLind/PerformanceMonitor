// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecurityPatterns
 * @notice Reusable security patterns for DoS protection and safe operations
 * @dev Contains modifiers and utilities to prevent common attack vectors
 */

/**
 * @notice Prevents Denial of Service attacks through reentrancy
 * Uses checks-effects-interactions pattern and state tracking
 */
abstract contract ReentrancyGuard {
    uint256 private locked = 1;

    modifier nonReentrant() {
        require(locked == 1, "No reentrancy");
        locked = 2;
        _;
        locked = 1;
    }
}

/**
 * @notice Rate limiting to prevent DoS through transaction spam
 * Tracks last execution time per address
 */
abstract contract RateLimited {
    mapping(address => uint256) private lastExecution;
    uint256 public constant RATE_LIMIT_WINDOW = 1 minutes;

    modifier rateLimit() {
        require(
            block.timestamp >= lastExecution[msg.sender] + RATE_LIMIT_WINDOW,
            "Rate limit exceeded"
        );
        lastExecution[msg.sender] = block.timestamp;
        _;
    }
}

/**
 * @notice Gas optimization patterns
 * Limits expensive operations to prevent gas-based DoS
 */
abstract contract GasOptimized {
    uint256 public constant MAX_BATCH_SIZE = 100;
    uint256 public constant MAX_ARRAY_LENGTH = 1000;

    modifier boundedLoop(uint256 length) {
        require(length <= MAX_BATCH_SIZE, "Batch size too large");
        _;
    }

    modifier boundedArray() {
        _;
    }
}

/**
 * @notice State pause mechanism for emergency situations
 * Allows owner to pause/resume critical functions
 */
abstract contract Pausable {
    bool public paused = false;
    address public pauser;

    event PausedStatus(bool indexed status, uint256 timestamp);

    constructor() {
        pauser = msg.sender;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyPauser() {
        require(msg.sender == pauser, "Only pauser can call this");
        _;
    }

    function setPauser(address newPauser) external onlyPauser {
        require(newPauser != address(0), "Invalid pauser");
        pauser = newPauser;
    }

    function pause() external onlyPauser {
        paused = true;
        emit PausedStatus(true, block.timestamp);
    }

    function unpause() external onlyPauser {
        paused = false;
        emit PausedStatus(false, block.timestamp);
    }
}

/**
 * @notice Access control with role-based permissions
 * Prevents unauthorized operations
 */
abstract contract AccessControl {
    mapping(bytes32 => mapping(address => bool)) private roles;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "Access denied");
        _;
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return roles[role][account];
    }

    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        roles[role][account] = true;
        emit RoleGranted(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        roles[role][account] = false;
        emit RoleRevoked(role, account);
    }
}

/**
 * @notice Safe math operations (Solidity 0.8+ has built-in overflow protection)
 * Additional checks for edge cases
 */
abstract contract SafeMath {
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "Addition overflow");
        return c;
    }

    function safeSub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "Subtraction underflow");
        return a - b;
    }

    function safeMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "Multiplication overflow");
        return c;
    }
}

/**
 * @notice Input validation utilities
 * Prevents invalid data from causing issues
 */
abstract contract InputValidation {
    function validateAddress(address addr) internal pure {
        require(addr != address(0), "Invalid address");
    }

    function validateNonZero(uint256 value) internal pure {
        require(value > 0, "Value cannot be zero");
    }

    function validatePercentage(uint256 percentage) internal pure {
        require(percentage <= 100, "Percentage must be <= 100");
    }

    function validateStringLength(string memory str, uint256 maxLength) internal pure {
        require(bytes(str).length <= maxLength, "String too long");
    }
}

/**
 * @notice Event tracking for transparency and auditing
 * All critical operations emit events
 */
abstract contract EventTracker {
    event OperationExecuted(
        address indexed executor,
        string indexed operationType,
        uint256 timestamp,
        bytes data
    );

    event SecurityEvent(
        string indexed eventType,
        address indexed actor,
        uint256 timestamp
    );

    function _emitOperation(
        string memory opType,
        bytes memory data
    ) internal {
        emit OperationExecuted(msg.sender, opType, block.timestamp, data);
    }

    function _emitSecurityEvent(string memory eventType) internal {
        emit SecurityEvent(eventType, msg.sender, block.timestamp);
    }
}
