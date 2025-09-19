# CrossGuard Security Protocol

## Overview

CrossGuard is a decentralized smart contract insurance protocol built on Somnia Network that combines AI-powered vulnerability detection with on-chain parametric insurance. The protocol enables developers to scan their smart contracts for security vulnerabilities and purchase tailored insurance coverage based on automated risk assessment.

## Core Features

- **AI Vulnerability Scanner**: Analyzes smart contracts for 149+ known vulnerability patterns including reentrancy, oracle manipulation, flash loan exploits, access control issues, and integer overflows
- **Risk-Based Pricing**: Dynamic premium calculation (2.5%-10.5% annually) based on actual contract risk scores (0-100)
- **Parametric Insurance**: Automated claims processing with instant payouts upon verified exploit events
- **Fully On-Chain**: All policies, premiums, and claims are processed entirely on the blockchain

## Smart Contracts

### CrossGuardInsuranceNative.sol
The main insurance protocol contract deployed on Somnia Testnet that handles:
- Policy creation and management
- Premium calculations based on coverage amount, duration, and risk score
- Native STT token payments
- Automated claims verification
- Pool fund management

**Deployed Address**: `0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC`

### Contract Architecture
```
InsuranceProtocol
├── purchaseInsurance() - Create new policy with STT payment
├── calculatePremium() - Compute risk-adjusted premiums
├── processClaim() - Handle exploit claims
├── getUserPolicies() - Retrieve user's active policies
└── getPoolStats() - View insurance pool statistics
```

## Testnet Deployment

The protocol is live on **Somnia Testnet** (Chain ID: 50312)

### Network Configuration
- **RPC URL**: https://dream-rpc.somnia.network/
- **Explorer**: https://shannon-explorer.somnia.network/
- **Native Token**: STT (Somnia Test Token)
- **Block Time**: Sub-second finality
- **TPS**: 1M+ transactions per second capability

### Key Parameters
- **Minimum Coverage**: 1,000 STT
- **Maximum Coverage**: 10,000,000 STT
- **Policy Duration**: 30-365 days
- **Risk Score Range**: 0-100 (policies denied above 79)
- **Gas Cost**: ~0.01 STT per transaction

## Getting Started

1. Connect MetaMask to Somnia Testnet
2. Obtain STT from the [Somnia Faucet](https://testnet.somnia.network)
3. Visit the CrossGuard dApp
4. Scan your smart contract for vulnerabilities
5. Purchase insurance based on the risk assessment

## Technical Stack

- **Blockchain**: Somnia Network (EVM-compatible Layer 1)
- **Smart Contracts**: Solidity 0.8.19
- **Frontend**: Next.js 13, TypeScript, TailwindCSS
- **Web3 Integration**: Ethers.js v6
- **Development**: Hardhat, OpenZeppelin Contracts

## Security

All smart contracts have been developed following best practices with OpenZeppelin libraries. The protocol implements multiple safety checks including reentrancy guards, input validation, and overflow protection.

## License

MIT