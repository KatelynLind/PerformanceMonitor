# Hello FHEVM: Your First Confidential dApp Tutorial

Welcome to your journey into Fully Homomorphic Encryption on the blockchain! This tutorial will guide you through building your first confidential dApp using FHEVM, where sensitive data remains encrypted even during computation.

## 🎯 What You'll Learn

By the end of this tutorial, you'll have built a complete **Performance Monitor** dApp that:
- Stores sensitive performance data as encrypted values on-chain
- Performs computations on encrypted data without revealing it
- Provides a user-friendly frontend to interact with your confidential smart contract

## 📋 Prerequisites

### What You Need to Know
- **Solidity basics**: You can write and deploy simple smart contracts
- **JavaScript/React fundamentals**: Basic frontend development skills
- **Ethereum development tools**: Familiarity with MetaMask, deployment tools

### What You DON'T Need to Know
- ❌ Advanced cryptography or mathematics
- ❌ Complex FHE theory
- ❌ Specialized encryption libraries

## 🚀 Getting Started

### Step 1: Understanding FHE in Simple Terms

**Fully Homomorphic Encryption (FHE)** is like a magic box:
- You put encrypted data in
- Computations happen inside the box
- You get encrypted results out
- **The data never becomes visible during processing**

Think of it as performing calculations on locked safes without ever opening them!

### Step 2: Setting Up Your Environment

#### Required Tools
```bash
# Install Node.js dependencies
npm install

# Install Hardhat for smart contract development
npm install --save-dev hardhat

# Install FHEVM library
npm install fhevmjs
```

#### MetaMask Configuration
1. Add Zama Devnet to MetaMask
2. Network Details:
   - **Network Name**: Zama Devnet
   - **RPC URL**: `https://devnet.zama.ai`
   - **Chain ID**: 8009
   - **Symbol**: ZAMA

## 🔧 Building Your First FHE Smart Contract

### Step 3: Create the Performance Monitor Contract

Let's build a contract that stores and analyzes performance metrics confidentially:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";

contract PerformanceMonitor {
    using TFHE for euint32;

    // Encrypted performance metrics
    mapping(address => euint32) private performanceScores;
    mapping(address => euint32) private responseTime;

    // Events for frontend interaction
    event MetricUpdated(address indexed user);
    event ThresholdAlert(address indexed user);

    // Store encrypted performance score
    function updatePerformanceScore(einput encryptedScore, bytes calldata inputProof) external {
        // Convert encrypted input to FHE type
        euint32 score = TFHE.asEuint32(encryptedScore, inputProof);

        // Store encrypted score
        performanceScores[msg.sender] = score;

        emit MetricUpdated(msg.sender);
    }

    // Store encrypted response time
    function updateResponseTime(einput encryptedTime, bytes calldata inputProof) external {
        euint32 time = TFHE.asEuint32(encryptedTime, inputProof);
        responseTime[msg.sender] = time;

        emit MetricUpdated(msg.sender);
    }

    // Check if performance is above threshold (returns encrypted result)
    function checkPerformanceThreshold(uint32 threshold) external view returns (ebool) {
        euint32 userScore = performanceScores[msg.sender];
        euint32 thresholdEncrypted = TFHE.asEuint32(threshold);

        // Perform encrypted comparison
        return TFHE.ge(userScore, thresholdEncrypted);
    }

    // Get encrypted performance metrics (only owner can decrypt)
    function getEncryptedScore() external view returns (euint32) {
        return performanceScores[msg.sender];
    }

    // Calculate encrypted performance ratio
    function getPerformanceRatio() external view returns (euint32) {
        euint32 score = performanceScores[msg.sender];
        euint32 time = responseTime[msg.sender];

        // Encrypted division (score / time * 100)
        euint32 ratio = TFHE.div(TFHE.mul(score, TFHE.asEuint32(100)), time);
        return ratio;
    }
}
```

### Step 4: Key FHE Concepts Explained

#### Encrypted Types
- `euint32`: 32-bit encrypted unsigned integer
- `ebool`: Encrypted boolean value
- `einput`: Encrypted input from frontend

#### FHE Operations
```solidity
// Addition
euint32 sum = TFHE.add(a, b);

// Comparison (returns encrypted boolean)
ebool isGreater = TFHE.ge(a, b);

// Multiplication
euint32 product = TFHE.mul(a, b);

// Conditional selection
euint32 result = TFHE.select(condition, valueIfTrue, valueIfFalse);
```

## 🖥️ Building the Frontend

### Step 5: Setting Up the Frontend

Create a React application that interacts with your FHE contract:

```javascript
// App.js
import React, { useState, useEffect } from 'react';
import { initFhevm, createInstance } from 'fhevmjs';

function App() {
    const [fhevmInstance, setFhevmInstance] = useState(null);
    const [account, setAccount] = useState('');
    const [performanceScore, setPerformanceScore] = useState('');
    const [responseTime, setResponseTime] = useState('');

    // Initialize FHEVM
    useEffect(() => {
        async function initializeFHE() {
            await initFhevm();
            const instance = await createInstance({
                chainId: 8009,
                networkUrl: 'https://devnet.zama.ai',
            });
            setFhevmInstance(instance);
        }
        initializeFHE();
    }, []);

    // Connect MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            setAccount(accounts[0]);
        }
    };

    // Submit encrypted performance data
    const submitPerformanceData = async () => {
        if (!fhevmInstance || !account) return;

        // Encrypt the performance score
        const encryptedScore = fhevmInstance.encrypt32(parseInt(performanceScore));
        const encryptedTime = fhevmInstance.encrypt32(parseInt(responseTime));

        // Send to smart contract
        const contract = new ethers.Contract(contractAddress, abi, signer);

        await contract.updatePerformanceScore(
            encryptedScore.handles[0],
            encryptedScore.inputProof
        );

        await contract.updateResponseTime(
            encryptedTime.handles[0],
            encryptedTime.inputProof
        );

        alert('Performance data submitted successfully!');
    };

    return (
        <div className="app">
            <h1>🔒 Confidential Performance Monitor</h1>

            <div className="connection-section">
                <button onClick={connectWallet}>
                    {account ? `Connected: ${account.slice(0,6)}...` : 'Connect Wallet'}
                </button>
            </div>

            <div className="input-section">
                <h2>Submit Performance Metrics</h2>
                <input
                    type="number"
                    placeholder="Performance Score (0-100)"
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Response Time (ms)"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                />
                <button onClick={submitPerformanceData}>
                    Submit Encrypted Data
                </button>
            </div>

            <div className="info-section">
                <h3>🔐 Privacy Features</h3>
                <ul>
                    <li>Your performance data is encrypted before leaving your browser</li>
                    <li>Computations happen on encrypted data on-chain</li>
                    <li>Only you can decrypt your results</li>
                    <li>No sensitive information is exposed during processing</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
```

### Step 6: Advanced FHE Features

#### Encrypted Conditional Logic
```solidity
function evaluatePerformance() external view returns (euint32) {
    euint32 score = performanceScores[msg.sender];
    euint32 time = responseTime[msg.sender];

    // If score > 80 AND time < 200, return bonus points
    ebool highScore = TFHE.ge(score, TFHE.asEuint32(80));
    ebool fastResponse = TFHE.le(time, TFHE.asEuint32(200));
    ebool eligible = TFHE.and(highScore, fastResponse);

    euint32 bonus = TFHE.asEuint32(10);
    euint32 noBonus = TFHE.asEuint32(0);

    return TFHE.select(eligible, bonus, noBonus);
}
```

#### Encrypted Aggregations
```solidity
function calculateTeamAverage(address[] calldata teamMembers) external view returns (euint32) {
    euint32 total = TFHE.asEuint32(0);

    for (uint i = 0; i < teamMembers.length; i++) {
        total = TFHE.add(total, performanceScores[teamMembers[i]]);
    }

    return TFHE.div(total, TFHE.asEuint32(uint32(teamMembers.length)));
}
```

## 🧪 Testing Your Contract

### Step 7: Writing Tests

```javascript
// test/PerformanceMonitor.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PerformanceMonitor", function () {
    let contract;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const PerformanceMonitor = await ethers.getContractFactory("PerformanceMonitor");
        contract = await PerformanceMonitor.deploy();
        await contract.deployed();
    });

    it("Should store encrypted performance scores", async function () {
        // This test demonstrates the principle, actual FHE testing requires special setup
        const tx = await contract.updatePerformanceScore(encryptedInput, proof);
        await tx.wait();

        expect(await contract.getEncryptedScore()).to.not.equal(0);
    });
});
```

## 🚀 Deployment Guide

### Step 8: Deploy to Zama Devnet

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.19",
    networks: {
        zama: {
            url: "https://devnet.zama.ai",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 8009,
        },
    },
};
```

```bash
# Deploy command
npx hardhat run scripts/deploy.js --network zama
```

## 🎉 Congratulations!

You've successfully built your first confidential dApp! Here's what you accomplished:

✅ **Created encrypted smart contracts** that process sensitive data without exposing it
✅ **Built a frontend** that encrypts data before sending it to the blockchain
✅ **Implemented FHE operations** for secure computations
✅ **Deployed on Zama network** for real-world testing

## 🔮 Next Steps

Now that you understand the basics, explore:
- **Complex encrypted workflows** with multiple operations
- **Access control patterns** for encrypted data
- **Integration with existing dApps** to add privacy features
- **Advanced FHE operations** like encrypted machine learning

## 📚 Additional Resources

- **FHEVM Documentation**: Learn more advanced patterns
- **Zama Developer Portal**: Extended tutorials and examples
- **Community Discord**: Connect with other FHE developers
- **Example Projects**: Explore more complex confidential applications

## 🤝 Community

Join the growing community of privacy-focused developers:
- Share your creations and get feedback
- Collaborate on confidential computing projects
- Contribute to the FHEVM ecosystem

---

*Remember: With great privacy comes great responsibility. Use FHE to build applications that protect user data and create a more private digital world.*