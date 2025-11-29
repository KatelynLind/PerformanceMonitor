# Performance Monitor - Documentation Index

Welcome to the Performance Monitor documentation. Use this index to navigate through all available guides and documentation.

## 🚀 Getting Started

### For First-Time Users
1. **[QUICKSTART.md](./QUICKSTART.md)** - Get the app running in 5 minutes
   - Prerequisites
   - Installation steps
   - Basic configuration
   - First run guide

### For Detailed Information
2. **[README.md](./README.md)** - Complete project documentation
   - Features overview
   - Project structure
   - Installation guide
   - Usage instructions
   - Configuration options

## 📚 Specific Topics

### Smart Contract Development
- **Contract Location**: `contracts/PerformanceMonitor.sol`
- **Contract Functions**: See README.md → "Smart Contract" section
- **Testing**: `test/PerformanceMonitor.test.js`
- **Deployment**: See DEPLOYMENT.md

### Frontend Development
- **Technology Stack**: React 18 + TypeScript + Vite
- **UI Components**: Located in `src/components/ui/`
- **Hooks**: Located in `src/hooks/`
- **Configuration**: `src/config/wagmi.ts` for Web3 setup
- **Styling**: TailwindCSS (see `tailwind.config.js`)

### Deployment & Production
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
   - Smart contract deployment to Sepolia
   - Frontend deployment (Vercel, Netlify, etc.)
   - Environment configuration
   - Verification and monitoring
   - Troubleshooting

### Project Overview
4. **[SUMMARY.md](./SUMMARY.md)** - Project summary and architecture
   - Feature matrix
   - Code statistics
   - Performance optimizations
   - Future roadmap

## 📂 Directory Guide

```
PerformanceMonitor/
├── src/                    # React application source code
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   └── App.tsx            # Root component
│
├── contracts/             # Solidity smart contracts
│   └── PerformanceMonitor.sol
│
├── scripts/               # Deployment and utility scripts
│   ├── deploy.js          # Contract deployment
│   ├── interact.js        # Contract interaction
│   ├── simulate.js        # Simulation script
│   └── verify.js          # Verification script
│
├── test/                  # Contract tests
│   └── PerformanceMonitor.test.js
│
├── public/                # Static assets
└── Configuration Files
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── hardhat.config.js
    └── package.json
```

## 🎯 Common Tasks

### Start Development Server
```bash
npm run dev
```
See **QUICKSTART.md** for details.

### Deploy Smart Contract
```bash
npm run compile:sol
npx hardhat run scripts/deploy.js --network sepolia
```
See **DEPLOYMENT.md** for step-by-step instructions.

### Build for Production
```bash
npm run build
```
See **DEPLOYMENT.md** → "Frontend Deployment" section.

### Run Contract Tests
```bash
npm run test:sol
```

### Check Code Quality
```bash
npm run lint
npm run format:check
```

## 🔍 Feature Documentation

### Real-time Metrics Monitoring
- **Component**: `src/components/MetricsMonitor.tsx`
- **Hook**: `src/hooks/useTransactionHistory.ts`
- **Features**:
  - Real-time metrics collection
  - Statistics calculation
  - Visual dashboard

See **README.md** → "Metrics Monitoring" section.

### Transaction History
- **Component**: `src/components/TransactionHistory.tsx`
- **Features**:
  - Persistent localStorage storage
  - JSON/CSV export
  - Transaction filtering

See **README.md** → "Transaction History" section.

### Loading States & Error Handling
- **Components**: `src/components/ui/Loading.tsx`, `src/components/ui/Toast.tsx`
- **Boundary**: `src/components/ErrorBoundary.tsx`
- **Hook**: `src/hooks/useContractInteraction.ts`

See **README.md** → "Features in Detail" section.

## 📋 Configuration Guide

### Environment Variables
1. Copy `.env.example` to `.env`
2. Update with your values
3. See **QUICKSTART.md** → "Configuration" for details

### Tailwind CSS
- Edit `tailwind.config.js` to customize colors
- See **README.md** → "Configuration" → "Tailwind CSS"

### Wagmi/Web3
- Edit `src/config/wagmi.ts` for chain configuration
- See **README.md** → "Configuration" → "Wagmi Configuration"

## 🧪 Testing & Quality Assurance

### Contract Tests
```bash
npx hardhat test
```
Test file: `test/PerformanceMonitor.test.js`

### Code Quality
```bash
npm run lint
npm run format:check
```

### Gas Usage
```bash
REPORT_GAS=true npm run test:sol
```

## 🌐 Network & Deployment

### Sepolia Testnet
- **ChainId**: 11155111
- **RPC**: https://rpc.sepolia.org
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepolia-faucet.pk910.de/

### Deployment Guides
- **Vercel**: See DEPLOYMENT.md → "Deploy to Vercel"
- **Netlify**: See DEPLOYMENT.md → "Deploy to Netlify"
- **Custom Server**: See DEPLOYMENT.md → "Deploy to Traditional Hosting"

## 🆘 Troubleshooting

For common issues, see:
- **QUICKSTART.md** → "Troubleshooting"
- **DEPLOYMENT.md** → "Troubleshooting"
- **README.md** → "Frequently Asked Questions" (if applicable)

## 📞 Getting Help

1. **Check the relevant documentation** for your task
2. **Review TROUBLESHOOTING** sections
3. **Check error messages** in console
4. **Review code comments** for implementation details
5. **Open GitHub issues** for bugs or feature requests

## 🎓 Learning Resources

### Official Documentation
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Guide](https://www.rainbowkit.com/)
- [Hardhat Docs](https://hardhat.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

### Blockchain Resources
- [Ethereum.org](https://ethereum.org/)
- [Web3.js Documentation](https://docs.web3js.org/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Sepolia Testnet Info](https://sepolia.etherscan.io/)

## 📊 Project Metrics

- **Total Components**: 7 core + 6 UI components
- **Smart Contract Functions**: 11 main functions
- **Test Cases**: 20+ comprehensive tests
- **Configuration Files**: 7 setup files
- **Documentation Pages**: 5 guides (this file + 4 others)
- **Lines of Code**: ~1500+ (excluding node_modules)

## 🎉 Next Steps

1. **First Time?** → Start with **QUICKSTART.md**
2. **Want Details?** → Read **README.md**
3. **Ready to Deploy?** → Follow **DEPLOYMENT.md**
4. **Need Overview?** → Check **SUMMARY.md**
5. **Have Questions?** → Refer back to this index

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready

For the most up-to-date information, always refer to the main documentation files in the root directory.
