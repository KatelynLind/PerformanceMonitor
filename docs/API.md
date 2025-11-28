# Contract API Reference

## PerformanceMonitor Smart Contract

Complete API documentation for the PerformanceMonitor smart contract.

## Contract Overview

**Purpose**: Privacy-preserving performance monitoring using Fully Homomorphic Encryption (FHE)

**Network**: Ethereum Sepolia Testnet

**Solidity Version**: ^0.8.24

## State Variables

### Public Variables

#### `owner: address`

The contract owner/administrator address. Set at deployment.

#### `totalMetrics: uint256`

Total number of metrics submitted to the contract since deployment.

## Structs

### PerformanceData

Encrypted performance data for a system.

```solidity
struct PerformanceData {
    euint32 cpuUsage;        // CPU usage percentage (0-100)
    euint32 memoryUsage;     // Memory usage in MB
    euint32 networkLatency;  // Network latency in ms
    euint64 throughput;      // Data throughput in bytes/sec
    uint256 timestamp;       // Submission timestamp
    bool isActive;          // Whether system is actively monitored
}
```

### SystemMetrics

Aggregated metrics for a system.

```solidity
struct SystemMetrics {
    euint32 avgCpuUsage;     // Average CPU usage
    euint32 avgMemoryUsage;  // Average memory usage
    euint32 avgLatency;      // Average latency
    euint64 totalThroughput; // Total throughput
    uint256 lastUpdate;      // Last update timestamp
    uint32 dataPoints;       // Number of data points
}
```

## Events

### MetricsSubmitted

Emitted when metrics are successfully submitted.

```solidity
event MetricsSubmitted(address indexed system, uint256 timestamp);
```

**Parameters**:
- `system`: Address that submitted the metrics
- `timestamp`: Block timestamp of submission

### SystemAdded

Emitted when a new system is added to monitoring.

```solidity
event SystemAdded(address indexed system);
```

**Parameters**:
- `system`: Address of the newly monitored system

### SystemRemoved

Emitted when a system is removed from monitoring.

```solidity
event SystemRemoved(address indexed system);
```

**Parameters**:
- `system`: Address of the removed system

### ReporterAuthorized

Emitted when an address is authorized to submit metrics.

```solidity
event ReporterAuthorized(address indexed reporter);
```

**Parameters**:
- `reporter`: Address that was authorized

### ReporterRevoked

Emitted when an address loses authorization to submit metrics.

```solidity
event ReporterRevoked(address indexed reporter);
```

**Parameters**:
- `reporter`: Address that was revoked

## Functions

### Authorization Functions

#### `authorizeReporter(address _reporter)`

Authorize an address to submit performance metrics.

**Access**: Owner only

**Parameters**:
- `_reporter`: Address to authorize

**Returns**: None

**Events**: Emits `ReporterAuthorized` event

**Example**:
```javascript
await contract.authorizeReporter("0x1234...abcd");
```

#### `revokeReporter(address _reporter)`

Revoke authorization from an address.

**Access**: Owner only

**Parameters**:
- `_reporter`: Address to revoke

**Returns**: None

**Events**: Emits `ReporterRevoked` event

**Example**:
```javascript
await contract.revokeReporter("0x1234...abcd");
```

#### `isAuthorizedReporter(address reporter)`

Check if an address is authorized to submit metrics.

**Access**: Public (view)

**Parameters**:
- `reporter`: Address to check

**Returns**: `bool` - True if authorized

**Example**:
```javascript
const isAuthorized = await contract.isAuthorizedReporter(address);
```

### Metric Submission

#### `submitMetrics(uint32 _cpuUsage, uint32 _memoryUsage, uint32 _networkLatency, uint64 _throughput)`

Submit encrypted performance metrics.

**Access**: Authorized reporters only

**Parameters**:
- `_cpuUsage`: CPU usage percentage (0-100)
- `_memoryUsage`: Memory usage in MB (must be > 0)
- `_networkLatency`: Network latency in milliseconds
- `_throughput`: Data throughput in bytes/sec

**Returns**: None

**Events**: Emits `MetricsSubmitted` event

**Validation**:
- CPU usage must be between 0-100
- Memory usage must be greater than 0
- Latency must be non-negative
- Throughput must be non-negative

**Example**:
```javascript
await contract.submitMetrics(
    45,              // CPU: 45%
    2048,            // Memory: 2048 MB
    25,              // Latency: 25 ms
    BigInt(1000000)  // Throughput: 1MB/sec
);
```

### Information Retrieval

#### `getSystemInfo(address system)`

Query basic information about a monitored system.

**Access**: Public (view)

**Parameters**:
- `system`: Address of the system

**Returns**: Tuple of:
- `isActive`: bool - Whether system is actively monitored
- `lastTimestamp`: uint256 - Last update timestamp
- `dataPoints`: uint32 - Number of metrics submitted

**Example**:
```javascript
const info = await contract.getSystemInfo(systemAddress);
console.log(info.isActive);
console.log(info.lastTimestamp);
console.log(info.dataPoints);
```

#### `getMonitoredSystemsCount()`

Get the total number of monitored systems.

**Access**: Public (view)

**Parameters**: None

**Returns**: `uint256` - Number of monitored systems

**Example**:
```javascript
const count = await contract.getMonitoredSystemsCount();
console.log(`Systems: ${count}`);
```

#### `getMonitoredSystem(uint256 index)`

Get a monitored system address by index.

**Access**: Public (view)

**Parameters**:
- `index`: Position in the monitored systems array

**Returns**: `address` - System address at that index

**Errors**: Reverts if index is out of bounds

**Example**:
```javascript
const systemAddress = await contract.getMonitoredSystem(0);
```

### System Management

#### `removeSystem(address system)`

Remove a system from monitoring.

**Access**: Owner only

**Parameters**:
- `system`: Address of system to remove

**Returns**: None

**Events**: Emits `SystemRemoved` event

**Example**:
```javascript
await contract.removeSystem(systemAddress);
```

### Emergency Operations

#### `emergencyPause()`

Pause monitoring for all systems.

**Access**: Owner only

**Parameters**: None

**Returns**: None

**Effect**: Sets `isActive` to false for all monitored systems

**Example**:
```javascript
await contract.emergencyPause();
```

#### `resumeMonitoring()`

Resume monitoring for all systems.

**Access**: Owner only

**Parameters**: None

**Returns**: None

**Effect**: Sets `isActive` to true for all monitored systems

**Example**:
```javascript
await contract.resumeMonitoring();
```

### Decryption Operations

#### `requestMetricsDecryption(address system)`

Request decryption of a system's metrics (asynchronous).

**Access**: Owner only

**Parameters**:
- `system`: Address of system to decrypt

**Returns**: None

**Note**: This is an async operation. Results are returned via callback.

**Example**:
```javascript
await contract.requestMetricsDecryption(systemAddress);
```

#### `processDecryptedMetrics(uint256 requestId, uint32[] memory decryptedValues, bytes[] memory signatures)`

Callback function for decrypted metrics results.

**Access**: Internal callback

**Parameters**:
- `requestId`: ID of the decryption request
- `decryptedValues`: Decrypted metric values
- `signatures`: Signature data from validators

**Note**: This is called automatically by the FHE oracle.

## Usage Examples

### Example 1: Deploy and Setup

```javascript
// Deploy contract
const PerformanceMonitor = await ethers.getContractFactory("PerformanceMonitor");
const contract = await PerformanceMonitor.deploy();

// Authorize reporter
await contract.authorizeReporter(reporterAddress);
```

### Example 2: Submit Metrics

```javascript
// As authorized reporter
await contract.submitMetrics(
    45,              // CPU 45%
    2048,            // 2048 MB memory
    25,              // 25 ms latency
    BigInt(1000000)  // 1 MB/s throughput
);

// Check submission
const count = await contract.totalMetrics();
console.log(`Total submissions: ${count}`);
```

### Example 3: Query System Status

```javascript
// Get system info
const systemCount = await contract.getMonitoredSystemsCount();

for (let i = 0; i < systemCount; i++) {
    const address = await contract.getMonitoredSystem(i);
    const info = await contract.getSystemInfo(address);

    console.log(`System ${i}:`);
    console.log(`  Active: ${info.isActive}`);
    console.log(`  Data Points: ${info.dataPoints}`);
}
```

### Example 4: Emergency Response

```javascript
// Pause all monitoring
await contract.emergencyPause();

// ... perform emergency procedures ...

// Resume monitoring
await contract.resumeMonitoring();
```

## Error Handling

### Common Errors

#### "Not authorized"
- **Cause**: Caller is not the contract owner
- **Solution**: Use the owner account or have the owner call the function

#### "Not authorized reporter"
- **Cause**: Caller is not an authorized reporter
- **Solution**: Have the owner authorize the reporter first

#### "Invalid CPU usage"
- **Cause**: CPU usage > 100
- **Solution**: Ensure CPU percentage is between 0-100

#### "Invalid memory usage"
- **Cause**: Memory usage is 0 or negative
- **Solution**: Submit a positive memory value

#### "System not monitored"
- **Cause**: System address is not in the monitored systems list
- **Solution**: Verify the system address is correct

#### "Index out of bounds"
- **Cause**: Array index exceeds number of monitored systems
- **Solution**: Check the index is less than `getMonitoredSystemsCount()`

## Gas Optimization

### Function Gas Usage (Approximate)

- `authorizeReporter`: ~50,000 gas
- `submitMetrics`: ~150,000 gas (first submission for system)
- `submitMetrics`: ~130,000 gas (subsequent submissions)
- `getSystemInfo`: ~5,000 gas
- `getMonitoredSystem`: ~3,000 gas
- `emergencyPause`: ~5,000 + 5,000 per system
- `resumeMonitoring`: ~5,000 + 5,000 per system

## Security Considerations

1. **Encryption**: All metric data is encrypted using FHE
2. **Authorization**: Only authorized addresses can submit metrics
3. **Ownership**: Critical functions are owner-protected
4. **Data Privacy**: Encrypted data cannot be decrypted without proper authorization
5. **Immutability**: Historical data is preserved on-chain

## Best Practices

1. **Authorization**: Only authorize trusted addresses
2. **Regular Monitoring**: Check system status regularly
3. **Data Backup**: Monitor and backup decrypted data off-chain
4. **Emergency Procedures**: Test emergency pause/resume regularly
5. **Gas Optimization**: Batch metric submissions when possible
