# Getting Started Guide

## Overview

Performance Monitor is a privacy-preserving performance monitoring system built on blockchain using Fully Homomorphic Encryption (FHE). This guide will help you set up and deploy the smart contract.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **MetaMask** or similar wallet for Sepolia testnet

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd performance-monitor-fhe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
# Sepolia RPC endpoint (get from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_key

# After deployment, add:
CONTRACT_ADDRESS=0x...
```

**Security Note**: Never commit `.env` file to version control. It's already in `.gitignore`.

## Development

### Compile Contracts

```bash
npm run compile
```

Compiles Solidity contracts to artifacts and generates TypeChain types.

### Run Tests

```bash
npm run test
```

Runs the test suite in the test directory.

### Run Tests with Gas Report

```bash
npm run test:gas
```

Generates a gas usage report for contract functions.

### Start Local Node

```bash
npm run node
```

Starts a local Hardhat node for development.

## Deployment

### Deploy to Local Network

In one terminal:

```bash
npm run node
```

In another terminal:

```bash
npm run deploy:local
```

### Deploy to Sepolia Testnet

```bash
npm run deploy
```

This will:
1. Compile the contract
2. Deploy to Sepolia network
3. Save deployment information to `docs/DEPLOYMENT.json`
4. Generate a deployment summary

**Output**: Contract address and deployment details will be displayed.

### Verify Contract on Etherscan

After deployment:

```bash
npm run verify
```

This will:
1. Verify the contract source code on Etherscan
2. Save verification information to `docs/VERIFICATION.json`
3. Provide an Etherscan link for the contract

## Interaction

### Interactive Contract Testing

```bash
npm run interact
```

This script will:
- Query contract information
- Test authorization
- Submit sample metrics
- Display system information
- Perform emergency operations (if owner)

### Run Simulation Scenarios

```bash
npm run simulate
```

Runs comprehensive simulation scenarios:
- Multiple systems reporting metrics
- Aggregate system status
- Authorization management
- System lifecycle management
- Emergency pause and resume operations

## File Structure

```
performance-monitor-fhe/
├── contracts/
│   └── PerformanceMonitor.sol
├── scripts/
│   ├── deploy.js           # Deployment script
│   ├── verify.js           # Etherscan verification
│   ├── interact.js         # Contract interaction
│   └── simulate.js         # Simulation scenarios
├── test/
│   └── PerformanceMonitor.test.js
├── docs/
│   ├── GETTING_STARTED.md  # This file
│   ├── DEPLOYMENT.md       # Deployment guide
│   ├── API.md              # Contract API reference
│   └── DEPLOYMENT.json     # Generated after deployment
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Dependencies and scripts
├── .env.example            # Environment template
└── README.md               # Project overview
```

## Contract Functions

### Public Functions

#### `submitMetrics(uint32, uint32, uint32, uint64)`

Submit encrypted performance metrics.

```javascript
await contract.submitMetrics(
  cpuUsage,      // 0-100
  memoryUsage,   // in MB
  networkLatency, // in ms
  throughput     // bytes/sec
);
```

#### `getSystemInfo(address)`

Query system information.

```javascript
const info = await contract.getSystemInfo(systemAddress);
// Returns: [isActive, lastTimestamp, dataPoints]
```

#### `getMonitoredSystemsCount()`

Get total number of monitored systems.

```javascript
const count = await contract.getMonitoredSystemsCount();
```

#### `emergencyPause()`

Pause all monitoring (owner only).

```javascript
await contract.emergencyPause();
```

#### `resumeMonitoring()`

Resume all monitoring (owner only).

```javascript
await contract.resumeMonitoring();
```

## Troubleshooting

### Common Issues

#### 1. "CONTRACT_ADDRESS not found"

**Solution**: Either set `CONTRACT_ADDRESS` in `.env` or run `npm run deploy` first.

#### 2. "No contract found at address"

**Solution**: Ensure the contract address is correct and the contract has been deployed to the specified network.

#### 3. "Insufficient funds"

**Solution**: Get Sepolia testnet ETH from a faucet:
- [Sepoliafaucet.com](https://sepoliafaucet.com)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

#### 4. "Private key is invalid"

**Solution**: Ensure your private key in `.env` is:
- Without the "0x" prefix
- Exactly 64 hexadecimal characters

### Getting Help

For detailed API documentation, see [API.md](./API.md)
For deployment details, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Next Steps

1. ✓ Install and configure the project
2. ✓ Deploy to Sepolia testnet
3. ✓ Verify contract on Etherscan
4. ✓ Run interaction scripts
5. Integrate with frontend application
6. Deploy to mainnet (if ready)

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC**: `https://sepolia.infura.io/v3/YOUR_KEY`
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### Performance Monitoring

Monitor your deployments and interactions:
- View transactions: `https://sepolia.etherscan.io/tx/{txHash}`
- View contract: `https://sepolia.etherscan.io/address/{contractAddress}`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation in `docs/API.md`
3. Check Hardhat documentation: https://hardhat.org/docs
