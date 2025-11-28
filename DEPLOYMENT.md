# Deployment Guide

This guide covers deploying the Performance Monitor application and smart contracts.

## Prerequisites

### Required Tools
- Node.js 16+
- npm or yarn
- git
- A Sepolia testnet account with some ETH

### Wallet Setup
1. Install MetaMask or similar Web3 wallet
2. Add Sepolia testnet to your wallet
3. Obtain Sepolia testnet ETH from a faucet:
   - https://sepolia-faucet.pk910.de/
   - https://www.infura.io/faucet/sepolia

## Smart Contract Deployment

### 1. Configure Environment

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Add your configuration:
```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Compile Contract

```bash
npx hardhat compile
```

This creates:
- `artifacts/contracts/PerformanceMonitor.sol/PerformanceMonitor.json` - ABI and bytecode
- `types/contracts/PerformanceMonitor.sol/PerformanceMonitor.ts` - TypeScript types

### 3. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
Deploying PerformanceMonitor contract...
PerformanceMonitor deployed to: 0x...
Deployment info saved to: ./deployments/sepolia.json
```

### 4. Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with the deployed address from step 3.

### 5. Save Deployment Info

The deployment script automatically saves to `deployments/sepolia.json`:
```json
{
  "network": "sepolia",
  "address": "0x...",
  "deployer": "0x...",
  "blockNumber": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Deployment

### 1. Build Application

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

### 2. Deploy to Vercel

#### Option A: Via CLI
```bash
npm install -g vercel
vercel
```

#### Option B: Via GitHub
1. Push code to GitHub repository
2. Go to Vercel Dashboard (https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

#### Environment Variables on Vercel
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ENV=production
```

### 3. Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Or via GitHub:
1. Push to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### 4. Deploy to Traditional Hosting

```bash
npm run build
# Copy dist/ folder to your hosting provider
```

## Configuration Updates

After deployment, update the contract address in your application:

1. Update `src/config/wagmi.ts` with contract ABI:
```ts
import PerformanceMonitorABI from '../abis/PerformanceMonitor.json'

export const CONTRACT_ADDRESS = '0x...' // Your deployed address
export const CONTRACT_ABI = PerformanceMonitorABI
```

2. Create `src/abis/PerformanceMonitor.json` from compiled contract:
```bash
cp artifacts/contracts/PerformanceMonitor.sol/PerformanceMonitor.json src/abis/
```

## Testing Deployment

### 1. Test Locally
```bash
npm run dev
```

### 2. Test Production Build
```bash
npm run build
npm run preview
```

### 3. Test Smart Contract Functions

Create `test/PerformanceMonitor.test.js`:
```javascript
const { expect } = require("chai");

describe("PerformanceMonitor", function () {
  it("Should record metrics", async function () {
    const PerformanceMonitor = await ethers.getContractFactory("PerformanceMonitor");
    const contract = await PerformanceMonitor.deploy();
    await contract.deployed();

    await contract.recordMetric("CPU", 75, "%");
    const count = await contract.getMetricsCount();
    expect(count).to.equal(1);
  });
});
```

Run tests:
```bash
npx hardhat test
```

## Monitoring Deployment

### Check Contract Status
```bash
# Check contract on Etherscan
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>

# Check recent transactions
curl https://api.sepolia.etherscan.io/api?module=account&action=txlist&address=<CONTRACT_ADDRESS>&startblock=0&endblock=99999999
```

### View Metrics
```bash
# Get metrics count
npx hardhat run -c contracts --network sepolia << 'EOF'
const contractAddress = "0x...";
const PerformanceMonitor = await ethers.getContractFactory("PerformanceMonitor");
const contract = await PerformanceMonitor.attach(contractAddress);
const count = await contract.getMetricsCount();
console.log("Metrics count:", count.toString());
EOF
```

## Troubleshooting

### Deployment Fails
- Check Sepolia RPC URL is accessible
- Ensure private key is correct
- Verify account has enough Sepolia ETH (> 0.01 ETH)

### Contract Verification Fails
- Wait a few seconds after deployment
- Ensure Etherscan API key is valid
- Check contract address is correct

### Frontend Connection Issues
- Verify contract address in application config
- Check wallet is connected to Sepolia network
- Ensure wallet has some Sepolia ETH

### Gas Issues
- Increase gas limit in hardhat.config.js
- Check current Sepolia gas prices
- Consider optimizing contract code

## Security Checklist

Before production deployment:
- [ ] Private keys stored securely (never in version control)
- [ ] Environment variables configured correctly
- [ ] Contract code audited
- [ ] Frontend validates all user inputs
- [ ] Error handling implemented
- [ ] Wallet connection verified
- [ ] HTTPS enabled (for web deployment)
- [ ] CORS headers configured
- [ ] Rate limiting implemented (if applicable)
- [ ] Monitoring and alerting setup

## Cost Estimation

### One-time Costs
- Contract deployment: ~0.005 - 0.02 ETH (varies with gas)
- Contract verification: ~0.001 - 0.005 ETH

### Per-transaction Costs
- Record metric: ~0.001 - 0.005 ETH
- View metric: Free (read-only)
- Authorization: ~0.001 - 0.005 ETH

### Hosting Costs (Monthly)
- Vercel Free: $0
- Vercel Pro: $20/month
- Netlify Free: $0
- Netlify Pro: $19/month

## Support & Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Sepolia Testnet Info](https://sepolia.etherscan.io/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Netlify Deploy Guide](https://docs.netlify.com/)
