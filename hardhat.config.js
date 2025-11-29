require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

// FHE plugin - optional
try {
  require("@fhevm/hardhat-plugin");
} catch (e) {
  console.warn("FHEVM plugin not available, running in standard mode");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf",
          },
        },
      },
      evmVersion: "cancun",
      metadata: {
        bytecodeHash: "ipfs",
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/" + (process.env.INFURA_API_KEY || ""),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    excludeContracts: ["test/"],
  },
  coverage: {
    provider: "hardhat",
    skipFiles: ["node_modules/", "test/"],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  paths: {
    artifacts: "artifacts",
    sources: "contracts",
    tests: "test",
    cache: "cache",
  },
  mocha: {
    require: "ts-node/register",
    extensions: ["ts"],
    timeout: 40000,
    slow: 300000,
    exit: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
