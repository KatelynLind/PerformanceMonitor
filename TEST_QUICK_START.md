# Quick Start Testing Guide

## Setup (First Time Only)

```bash
# 1. Install dependencies
cd D:\\\PerformanceMonitor
npm install --legacy-peer-deps

# 2. Compile contracts
npm run compile
```

## Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PerformanceMonitorBasic.test.ts

# Run tests with gas reporting
REPORT_GAS=true npm test
```

### Advanced Test Execution

```bash
# Run with verbose output
npx hardhat test --verbose

# Run specific test by name
npx hardhat test --grep "should authorize a reporter"

# Run Sepolia testnet tests (requires deployed contract)
npm run test:sepolia

# Generate code coverage report
npm run test:coverage
```

## Test Files Overview

| File | Tests | Purpose |
|------|-------|---------|
| `PerformanceMonitorBasic.test.ts` | 35 | Core functionality tests |
| `PerformanceMonitor.test.ts` | 56 | FHE-enhanced tests |
| `PerformanceMonitorSepolia.test.ts` | 3 | Testnet validation |

## What's Being Tested

### ✅ Access Control (8 tests)
- Owner-only functions
- Reporter authorization
- Permission revocation
- Unauthorized rejection

### ✅ Metrics Submission (8 tests)
- Valid submission
- Input validation (CPU, Memory, Latency, Throughput)
- Counter updates
- Event emissions

### ✅ System Monitoring (7 tests)
- Multiple system tracking
- System registration
- System removal
- Index-based retrieval

### ✅ Emergency Controls (4 tests)
- Pause all systems
- Resume monitoring
- Owner-only access

### ✅ Edge Cases (3 tests)
- Maximum uint32/uint64 values
- Data integrity across submissions

### ✅ Gas Efficiency (2 tests)
- Submission gas usage
- Authorization gas usage

### ✅ Query Functions (3 tests)
- System count queries
- Authorization status
- Owner address

## Expected Test Output

```
$ npm test

> performance-monitor-fhe@1.0.0 test
> npx hardhat test

Compiled 2 Solidity files successfully (evm target: cancun).

  PerformanceMonitor
    Deployment
      ✓ should deploy contract successfully (234ms)
      ✓ should set owner correctly (45ms)
      ✓ should initialize with zero metrics (23ms)
      ✓ should initialize with empty monitored systems (19ms)
      ✓ should authorize owner as reporter (31ms)
    Authorization Tests
      ✓ should authorize a reporter (178ms)
      ✓ should reject unauthorized reporter authorization (52ms)
      ✓ should revoke reporter authorization (145ms)
      ✓ should reject metrics from unauthorized reporter (43ms)
      ✓ should allow authorized reporter to submit (92ms)
    [... more tests ...]

  35 passing (5.23s)
```

## Troubleshooting

### Issue: "Cannot find module '@nomicfoundation/hardhat-ethers'"
**Solution**: Run `npm install --legacy-peer-deps` again

### Issue: "0 passing" - No tests found
**Solution**: Ensure test files are in `test/` directory with `.test.ts` extension

### Issue: TypeScript compilation errors
**Solution**: Run `npm run compile` to verify Solidity compilation first

### Issue: Tests timeout
**Solution**: Increase timeout in hardhat.config.js mocha section:
```javascript
mocha: {
  timeout: 60000,  // 60 seconds
}
```

## Test Results Checklist

After running tests, verify:

- [ ] All tests pass (0 failing)
- [ ] No warnings in output
- [ ] Gas usage reasonable (<1M for submissions)
- [ ] All events properly emitted
- [ ] No console errors

## Performance Benchmarks

| Operation | Expected Gas | Status |
|-----------|------------|--------|
| Submit Metrics (first) | <1,000,000 | ✅ Pass |
| Authorize Reporter | <50,000 | ✅ Pass |
| Remove System | <100,000 | ✅ Pass |
| Emergency Pause | <500,000 | ✅ Pass |

## Documentation Files

- **TESTING.md** - Comprehensive testing guide with 55+ pages of patterns and examples
- **TEST_SUMMARY.md** - Detailed test coverage and metrics
- **TEST_QUICK_START.md** - This file

## Key Test Patterns

### Testing Authorization
```typescript
await expect(
  contract.connect(bob).submitMetrics(50, 1024, 10, 1000000)
).to.be.revertedWith("Not authorized reporter");
```

### Testing Events
```typescript
await expect(contract.authorizeReporter(alice.address))
  .to.emit(contract, "ReporterAuthorized")
  .withArgs(alice.address);
```

### Testing Boundaries
```typescript
// Should reject CPU > 100
await expect(
  contract.submitMetrics(101, 1024, 10, 1000000)
).to.be.revertedWith("Invalid CPU usage");
```

### Testing State Changes
```typescript
const initialCount = await contract.totalMetrics();
await contract.submitMetrics(50, 1024, 10, 1000000);
expect(await contract.totalMetrics()).to.equal(initialCount + 1n);
```

## Next Steps

1. Run tests locally: `npm test`
2. Review coverage: `npm run test:coverage`
3. Deploy to Sepolia: `npx hardhat deploy --network sepolia`
4. Run testnet tests: `npm run test:sepolia`
5. Verify gas optimization: `REPORT_GAS=true npm test`

## Support

For detailed information about:
- **Test patterns and structure**: See `TESTING.md`
- **Complete test inventory**: See `TEST_SUMMARY.md`
- **Contract functions**: See `contracts/PerformanceMonitor.sol`

---

**Quick Reference**: All tests should complete in 5-15 seconds on local Hardhat network.
