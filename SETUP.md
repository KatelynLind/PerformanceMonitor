# Setup & Installation Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Installation Steps

### 1. Clone and Install Dependencies

```bash
cd PerformanceMonitor
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

Required variables:
- `INFURA_API_KEY`: For network RPC access
- `PRIVATE_KEY`: For contract deployment
- `PAUSER_ADDRESS`: For pause/resume functionality

### 3. Setup Git Hooks

```bash
npm run prepare
# This installs Husky pre-commit hooks
```

## Development Workflow

### Compile Smart Contracts

```bash
npm run compile:sol
```

### Run Tests

```bash
npm run test:sol          # Run all tests
npm run test:gas          # Run with gas reporting
npm run test:coverage     # Generate coverage report
```

### Code Quality

```bash
npm run lint              # Lint Solidity and JavaScript
npm run format            # Auto-format code
npm run format:check      # Verify formatting
```

### Security Audit

```bash
npm run security:audit    # Run all security checks
```

### Build Frontend

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run preview          # Preview production build
```

## Project Structure

```
PerformanceMonitor/
├── contracts/
│   ├── PerformanceMonitor.sol    # Main contract
│   └── SecurityPatterns.sol      # Security utilities
├── src/
│   ├── components/               # React components
│   ├── lib/                      # Utilities
│   └── App.tsx                   # Main app
├── test/
│   └── PerformanceMonitor.test.ts
├── hardhat.config.ts             # Hardhat configuration
├── .eslintrc.json                # ESLint config
├── .prettierrc.json              # Prettier config
├── .solhint.json                 # Solhint config
├── .husky/                       # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── .github/workflows/
│   └── security-audit.yml        # CI/CD pipeline
└── .env.example                  # Environment template
```

## Configuration Files

### .eslintrc.json
JavaScript/TypeScript linting with security plugin

### .prettierrc.json
Code formatting for Solidity and TypeScript

### .solhint.json
Solidity-specific security and gas optimization checks

### hardhat.config.ts
Hardhat configuration with:
- Solidity 0.8.24
- Optimizer: Yul enabled, 800 runs
- Gas reporting
- Test coverage

### .husky/pre-commit
Automated checks before commits:
1. Format verification
2. Solidity linting
3. JavaScript linting
4. Security audit

## Environment Configuration (PauserSet)

### Pause/Resume Mechanism

The `.env.example` includes PauserSet configuration:

```env
# Pause/Resume Control
PAUSER_ADDRESS=your_pauser_contract_address_here
ALLOW_EMERGENCY_PAUSE=true
PAUSE_TIMEOUT_DAYS=7
```

### Emergency Pause Usage

```solidity
// In contract code
if (paused) {
    revert("Contract is paused");
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

Automatically runs on:
- Push to main/develop
- Pull requests
- Weekly schedule (security audit)

Jobs:
1. **security-audit**: Linting and audits
2. **gas-optimization**: Gas analysis
3. **test-coverage**: Unit tests with coverage
4. **dos-protection-check**: DoS validation
5. **build**: Build frontend and contracts

## Troubleshooting

### Pre-commit Hooks Not Running

```bash
npm run prepare
git config core.hooksPath .husky
```

### Gas Reporter Not Working

```bash
# Install globally
npm install -g hardhat-gas-reporter
# Set environment variable
export REPORT_GAS=true
```

### Formatter Issues

```bash
# Fix all formatting issues
npm run format

# Check specific file
npx prettier --check contracts/PerformanceMonitor.sol
```

### Network Connection Issues

- Verify `INFURA_API_KEY` in `.env.local`
- Check network is accessible
- Try different RPC endpoint in `.env.local`

## Performance Tips

### Faster Builds
```bash
npm run compile:sol -- --network hardhat
```

### Faster Tests
```bash
# Run specific test file
npx hardhat test test/PerformanceMonitor.test.ts
```

### Faster Linting
```bash
# Lint only changed files
npx solhint contracts/SecurityPatterns.sol
```

## Best Practices

1. **Always run tests before committing**
   ```bash
   npm test
   ```

2. **Format code before committing**
   ```bash
   npm run format
   ```

3. **Review security warnings**
   ```bash
   npm audit
   ```

4. **Keep dependencies updated**
   ```bash
   npm update
   npm audit fix
   ```

5. **Use descriptive commit messages**
   ```bash
   git commit -m "feat(security): add rate limiting to submitMetrics"
   ```

## Advanced Configuration

### Custom Gas Limits

Edit `hardhat.config.ts`:
```typescript
gasReporter: {
  enabled: process.env.REPORT_GAS === "true",
  // Additional options
}
```

### Custom Linting Rules

Edit `.solhint.json` and `.eslintrc.json`:
```json
{
  "rules": {
    "custom-rule": ["error", { "option": true }]
  }
}
```

### Custom Prettier Settings

Edit `.prettierrc.json`:
```json
{
  "printWidth": 120,
  "tabWidth": 4
}
```

## Next Steps

1. Read [SECURITY.md](./SECURITY.md) for security details
2. Check [README.md](./README.md) for project overview
3. Review smart contracts in `/contracts`
4. Run example tests to verify setup
