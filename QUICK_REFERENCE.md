# Quick Reference Guide

## Project: Performance Monitor FHE

### Status: ✓ COMPLETE & READY FOR DEPLOYMENT

---

## Essential Commands

### Compilation & Testing
```bash
npm run compile              # Compile smart contracts
npm run test                 # Run all tests
npm run test:gas            # Tests with gas report
npm run test:coverage       # Coverage report
```

### Deployment (Choose One)
```bash
npm run deploy              # Deploy to Sepolia testnet
npm run deploy:local        # Deploy to local network
npm run node                # Start local Hardhat node
```

### Verification & Interaction
```bash
npm run verify              # Verify on Etherscan
npm run interact            # Test contract interaction
npm run simulate            # Run full simulation
```

### Cleanup
```bash
npm run clean               # Clean all artifacts
```

---

## File Quick Links

### Documentation
- **Getting Started**: `docs/GETTING_STARTED.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **API Reference**: `docs/API.md`
- **Setup Summary**: `HARDHAT_SETUP_SUMMARY.md`
- **Checklist**: `REFACTORING_CHECKLIST.md`

### Configuration
- **Hardhat Config**: `hardhat.config.js`
- **Environment Template**: `.env.example`
- **Package Config**: `package.json`

### Deployment Scripts
- **Deploy**: `scripts/deploy.js`
- **Verify**: `scripts/verify.js`
- **Interact**: `scripts/interact.js`
- **Simulate**: `scripts/simulate.js`

### Smart Contract
- **Contract**: `contracts/PerformanceMonitor.sol`
- **Tests**: `test/PerformanceMonitor.test.js`

---

## Setup in 5 Minutes

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env with your keys:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Compile & Test
```bash
npm run compile
npm run test
```

### 4. Deploy
```bash
npm run deploy
```

### 5. Verify
```bash
npm run verify
```

---

## Network Information

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: https://sepolia.infura.io/v3/YOUR_KEY
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### Contract Address
```
0x03B087793fcC92380e91a6a7af92DEAB98086f8A
```

### Etherscan Link
https://sepolia.etherscan.io/address/0x03B087793fcC92380e91a6a7af92DEAB98086f8A

---

## API Quick Reference

### Authorization
```javascript
// Authorize reporter
await contract.authorizeReporter(address);

// Revoke reporter
await contract.revokeReporter(address);

// Check authorization
const isAuth = await contract.isAuthorizedReporter(address);
```

### Submit Metrics
```javascript
await contract.submitMetrics(
    45,              // CPU: 45%
    2048,            // Memory: 2048 MB
    25,              // Latency: 25 ms
    BigInt(1000000)  // Throughput: 1 MB/s
);
```

### Query Information
```javascript
// Get system info
const info = await contract.getSystemInfo(address);

// Get systems count
const count = await contract.getMonitoredSystemsCount();

// Get system address by index
const address = await contract.getMonitoredSystem(0);
```

### Emergency Operations
```javascript
// Pause monitoring
await contract.emergencyPause();

// Resume monitoring
await contract.resumeMonitoring();
```

---

## Project Features

✓ Encrypted metrics collection (FHE)
✓ Authorization-based access control
✓ System lifecycle management
✓ Emergency pause/resume capability
✓ Complete audit trail
✓ Privacy-preserving operations
✓ Decryption request support
✓ Event logging

---

## Troubleshooting Quick Tips

### Issue: "CONTRACT_ADDRESS not found"
**Solution**: Either set CONTRACT_ADDRESS in `.env` or run `npm run deploy`

### Issue: "Insufficient funds"
**Solution**: Get Sepolia testnet ETH from https://sepoliafaucet.com

### Issue: "Nonce too low"
**Solution**: Wait for pending transactions or reset MetaMask

### Issue: "Invalid API key"
**Solution**: Verify your Infura/Alchemy and Etherscan API keys are correct

### Issue: "Private key invalid"
**Solution**: Check that private key has no "0x" prefix and is 64 hex chars

---

## Documentation Structure

```
docs/
├── GETTING_STARTED.md      ← Start here
├── DEPLOYMENT.md           ← For deployment
├── API.md                  ← For function reference
└── DEPLOYMENT.json         ← Generated deployment info
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Hardhat 2.20.0 |
| Language | Solidity 0.8.24 |
| Blockchain | Ethereum Sepolia |
| Encryption | TFHE-rs (Zama) |
| Frontend | React 18 + TypeScript |
| Web3 | Wagmi + Viem + RainbowKit |

---

## Support Resources

- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org
- **Solidity**: https://docs.soliditylang.org
- **Ethereum**: https://ethereum.org/developers
- **Zama FHE**: https://docs.zama.ai

---

## Deployment Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Get Sepolia testnet ETH from faucet
- [ ] Add RPC URL to `.env`
- [ ] Add private key to `.env`
- [ ] Add Etherscan API key to `.env`
- [ ] Run `npm install`
- [ ] Run `npm run compile`
- [ ] Run `npm run test`
- [ ] Run `npm run deploy`
- [ ] Update CONTRACT_ADDRESS in `.env`
- [ ] Run `npm run verify`
- [ ] Run `npm run interact`

---

## Important Files Created

### Scripts (4 files)
- `scripts/deploy.js` - Deployment automation
- `scripts/verify.js` - Etherscan verification
- `scripts/interact.js` - Contract interaction testing
- `scripts/simulate.js` - Comprehensive simulation

### Documentation (5 files)
- `docs/GETTING_STARTED.md` - Setup guide
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/API.md` - Complete API reference
- `HARDHAT_SETUP_SUMMARY.md` - Setup summary
- `REFACTORING_CHECKLIST.md` - Completion checklist

### Configuration (3 files)
- `hardhat.config.js` - Hardhat configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

### Other (2 files)
- `README.md` - Project overview (updated)
- `package.json` - Dependencies (updated)

---

## Next Steps

1. **Setup**: Copy `.env.example` to `.env` and configure
2. **Test**: Run `npm run compile && npm run test`
3. **Deploy**: Run `npm run deploy`
4. **Verify**: Run `npm run verify`
5. **Interact**: Run `npm run interact`

---

## Project Status

**Overall Status**: ✓ PRODUCTION READY

- ✓ Hardhat framework configured
- ✓ All scripts created and tested
- ✓ Complete documentation
- ✓ Sepolia network configured
- ✓ Etherscan integration ready
- ✓ Security best practices
- ✓ Professional code standards

---

**Last Updated**: November 29, 2025
**Framework Version**: Hardhat 2.20.0
**Network**: Ethereum Sepolia Testnet
