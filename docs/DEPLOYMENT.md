# Deployment Guide

## Overview

This guide covers deployment of the PerformanceMonitor smart contract to Ethereum networks using Hardhat.

## Network Information

### Sepolia Testnet

- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_API_KEY
- **Block Explorer**: https://sepolia.etherscan.io
- **Currency**: ETH (Testnet)
- **Faucets**:
  - https://sepoliafaucet.com
  - https://www.infura.io/faucet/sepolia

### Deployed Contract Information

**Contract Address**: `0x03B087793fcC92380e91a6a7af92DEAB98086f8A`

**Network**: Ethereum Sepolia Testnet

**Etherscan Link**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x03B087793fcC92380e91a6a7af92DEAB98086f8A)

**Contract Name**: PerformanceMonitor

**Solidity Version**: 0.8.24

**Optimization Enabled**: Yes (200 runs)

**License**: MIT

## Prerequisites

### Required Tools

1. **Node.js** (v18.0.0 or higher)
2. **npm** (v9.0.0 or higher)
3. **Ethereum Wallet** with testnet ETH

### Required API Keys

1. **Infura or Alchemy API Key**: For RPC access
2. **Etherscan API Key**: For contract verification
3. **Private Key**: Of the deployment wallet

## Pre-Deployment Checklist

- [ ] Install Node.js and npm
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Get Sepolia testnet ETH from faucet
- [ ] Obtain Infura/Alchemy API key
- [ ] Obtain Etherscan API key
- [ ] Create `.env` file from `.env.example`
- [ ] Configure environment variables
- [ ] Compile contracts (`npm run compile`)
- [ ] Run tests (`npm run test`)

## Step-by-Step Deployment

### Step 1: Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Deployer private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# For verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Step 2: Get Testnet ETH

Visit a Sepolia faucet and request test ETH:
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia

Recommended amount: At least 0.1 ETH for deployment and testing

### Step 3: Compile Contracts

```bash
npm run compile
```

**Expected Output**:
```
Compiled 1 Solidity file successfully
```

### Step 4: Deploy to Sepolia

```bash
npm run deploy
```

**Expected Output**:
```
================================================
Performance Monitor - Contract Deployment
================================================

Deploying contract with account: 0x...
Network: sepolia (Chain ID: 11155111)
Account balance: X.XXXX ETH

Deploying PerformanceMonitor contract...
✓ Contract deployed successfully!
✓ Contract address: 0x...

Contract owner: 0x...
Total metrics: 0
Monitored systems count: 0

Deployment information saved to: docs/DEPLOYMENT.json
Deployment summary saved to: docs/DEPLOYMENT_SUMMARY.md

================================================
Deployment completed successfully!
================================================
```

### Step 5: Update Environment

After deployment, update `.env`:

```env
CONTRACT_ADDRESS=0x_your_deployed_address
```

### Step 6: Verify on Etherscan

```bash
npm run verify
```

**Expected Output**:
```
================================================
Performance Monitor - Contract Verification
================================================

Contract address: 0x...
Network: sepolia (Chain ID: 11155111)

Checking if contract exists at address...
✓ Contract found!

Contract Details:
- Owner: 0x...
- Total Metrics: 0
- Monitored Systems: 0

Attempting to verify contract on Etherscan...
URL: https://sepolia.etherscan.io/address/0x...

✓ Contract verified successfully on Etherscan!
Verification info saved to: docs/VERIFICATION.json

================================================
Verification process completed!
================================================
```

## Post-Deployment Tasks

### 1. Test the Deployment

Run the interaction script:

```bash
npm run interact
```

This will:
- Query contract information
- Test authorization functions
- Submit sample metrics
- Verify system status

### 2. Run Simulation

Test comprehensive scenarios:

```bash
npm run simulate
```

This runs:
- Multiple systems reporting
- Aggregate status checks
- Authorization management
- Emergency operations

### 3. Save Deployment Information

The deployment process automatically creates:

- `docs/DEPLOYMENT.json` - Machine-readable deployment data
- `docs/DEPLOYMENT_SUMMARY.md` - Human-readable summary
- `docs/VERIFICATION.json` - Etherscan verification info

**Example DEPLOYMENT.json**:
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x03B087793fcC92380e91a6a7af92DEAB98086f8A",
  "deployer": "0x...",
  "deploymentBlock": 1234567,
  "deploymentTimestamp": "2025-11-29T10:00:00.000Z"
}
```

## Deployment Costs

Estimated gas costs on Sepolia:

| Operation | Estimated Gas | Estimated Cost (ETH) |
|-----------|--------------|---------------------|
| Contract Deployment | ~2,500,000 | ~0.05 ETH |
| Authorize Reporter | ~50,000 | ~0.001 ETH |
| Submit Metrics (first) | ~150,000 | ~0.003 ETH |
| Submit Metrics (subsequent) | ~130,000 | ~0.0026 ETH |
| Verify on Etherscan | Free | 0 ETH |

**Note**: These are approximate values. Actual costs vary based on network congestion.

## Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution**: Request more testnet ETH from faucets

### Issue: "Nonce too low"

**Solution**: Reset MetaMask or wait for pending transactions

### Issue: "Invalid API Key"

**Solution**: Verify your Infura/Alchemy and Etherscan API keys

### Issue: "Contract verification failed"

**Solution**:
1. Ensure contract is compiled with correct settings
2. Wait a few minutes after deployment
3. Verify constructor arguments match deployment

### Issue: "Private key invalid"

**Solution**:
- Remove "0x" prefix from private key in .env
- Ensure key is 64 hexadecimal characters

## Security Best Practices

1. **Never commit `.env` file** - Already in .gitignore
2. **Use separate wallets** for testnet and mainnet
3. **Test thoroughly** on testnet before mainnet deployment
4. **Backup private keys** securely
5. **Verify contracts** on Etherscan for transparency
6. **Monitor gas prices** before deploying
7. **Use hardware wallets** for mainnet deployments

## Upgrade Path

To upgrade the contract:

1. Deploy new version
2. Migrate data (if needed)
3. Update CONTRACT_ADDRESS in .env
4. Test new version thoroughly
5. Deprecate old contract

## Mainnet Deployment

For mainnet deployment:

1. Update `hardhat.config.js` with mainnet configuration
2. Ensure sufficient ETH for deployment
3. Test extensively on testnet first
4. Consider using a multisig wallet
5. Get a security audit
6. Plan for incident response
7. Monitor contract activity

## Support

For deployment issues:
- Check [Hardhat Documentation](https://hardhat.org/docs)
- Review [GETTING_STARTED.md](./GETTING_STARTED.md)
- Check [API.md](./API.md) for contract reference

## Deployed Contract Summary

| Property | Value |
|----------|-------|
| Contract Name | PerformanceMonitor |
| Network | Sepolia Testnet |
| Chain ID | 11155111 |
| Contract Address | 0x03B087793fcC92380e91a6a7af92DEAB98086f8A |
| Etherscan | [View Contract](https://sepolia.etherscan.io/address/0x03B087793fcC92380e91a6a7af92DEAB98086f8A) |
| Solidity Version | 0.8.24 |
| License | MIT |
| Optimization | Enabled (200 runs) |

## Next Steps

After successful deployment:

1. ✓ Contract deployed and verified
2. → Integrate with frontend application
3. → Set up monitoring and alerts
4. → Document API endpoints
5. → Create user guides
6. → Plan for production deployment
