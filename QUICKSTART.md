# Quick Start Guide

Get up and running with Performance Monitor in 5 minutes.

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- A Web3 wallet (MetaMask recommended)
- Sepolia testnet ETH (optional, for contract deployment)

## Installation

```bash
# Navigate to project directory
cd PerformanceMonitor

# Install dependencies
npm install
```

## Configuration

```bash
# Copy environment template
cp .env.example .env

# For local development, copy local example
cp .env.local.example .env.local
```

Update `.env` with your values (optional for basic usage):
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

## Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Connect Your Wallet

1. Click the "Connect Wallet" button in the top right
2. Select your wallet provider (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet
4. You're ready to use the app!

## Monitor Performance

### Start Monitoring
1. Go to "Performance Metrics" tab
2. Click "Start Monitoring" button
3. Watch real-time metrics appear
4. Stop anytime with "Stop Monitoring" button

### View Transaction History
1. Go to "Transaction History" tab
2. See all recorded transactions
3. Export data as JSON or CSV
4. Copy transaction hashes

## Deploy Smart Contract (Optional)

If you want to deploy the contract to Sepolia:

```bash
# Update .env with your private key
export PRIVATE_KEY=your_private_key

# Compile contract
npm run compile:sol

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Build for Production

```bash
# Build optimized production version
npm run build

# Preview production build locally
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
```

## Troubleshooting

### "No wallet found"
- Install MetaMask or compatible Web3 wallet
- Refresh the page

### "Wrong network"
- Switch to Sepolia testnet in your wallet
- Add Sepolia if not already present

### "Contract call failed"
- Ensure you have Sepolia ETH
- Check contract address is correct
- Verify account is authorized

## Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint:js          # Check code style
npm run compile:sol      # Compile smart contracts
npm run test:sol         # Run contract tests
```

## Project Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
├── config/            # Configuration files
├── App.tsx            # Main app component
└── index.css          # Global styles

contracts/
└── PerformanceMonitor.sol    # Smart contract

scripts/
└── deploy.js          # Deployment script
```

## Features Overview

### Real-time Metrics
- CPU Usage tracking
- Memory monitoring
- Disk I/O metrics
- Network latency analysis

### Loading States
- Button spinners during operations
- Skeleton screens for data
- Full-screen overlay for critical tasks

### Error Handling
- Toast notifications
- Detailed error messages
- Graceful failure recovery

### Transaction History
- Persistent storage (browser localStorage)
- Export to JSON/CSV
- Status tracking (pending/success/failed)

## Next Steps

1. **Customize Colors**
   - Edit `tailwind.config.js`
   - Update color scheme

2. **Add More Metrics**
   - Modify `MetricsMonitor.tsx`
   - Update smart contract

3. **Deploy Frontend**
   - Build: `npm run build`
   - Deploy `dist/` to Vercel/Netlify

4. **Deploy Contract**
   - Follow DEPLOYMENT.md guide
   - Save contract address

5. **Monitor in Production**
   - Check Etherscan for transactions
   - Monitor frontend errors
   - Track user activity

## Resources

- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/
- **wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/
- **Hardhat Docs**: https://hardhat.org/
- **Sepolia Testnet**: https://sepolia.etherscan.io/

## Need Help?

- Check error messages in console
- Review README.md for detailed docs
- Check DEPLOYMENT.md for deployment help
- Open GitHub issues for bugs

Happy monitoring! 🚀
