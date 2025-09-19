# CrossGuard Insurance Contract Information

## Deployed Contracts on Somnia Testnet

### ✅ ACTIVE CONTRACT (Use This One)
- **Contract Type**: CrossGuardInsuranceNative 
- **Address**: `0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC`
- **Status**: ✅ DEPLOYED AND WORKING
- **Payment Method**: Native STT (sent with transaction value)
- **Deployed**: Successfully deployed and verified

### ❌ OLD CONTRACT (Do Not Use)
- **Contract Type**: CrossGuardInsurance (ERC20 version)
- **Address**: `0x45B29955CEa195d9c1664e8F4628041503B0d11A`
- **Status**: ❌ INCOMPATIBLE - Uses ERC20 tokens, not native STT
- **Issue**: This contract expects ERC20 token transfers, not native ETH/STT

## Network Information
- **Network**: Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network/
- **Native Token**: STT (Somnia Test Token)

## How to Test

1. **Navigate to**: `/insurance-test` in the frontend
2. **Connect wallet** to Somnia Testnet
3. **Ensure you have STT** for gas and premium payments
4. **Use minimum values** for testing:
   - Coverage: 1000 STT
   - Duration: 30 days
   - Risk Score: 30

## Contract Functions

### purchaseInsurance
```solidity
function purchaseInsurance(
    address _protocolAddress,  // Contract to insure
    uint256 _coverageAmount,    // Coverage in wei
    uint256 _duration,          // Duration in seconds
    uint256 _riskScore          // Risk score 0-100
) payable returns (uint256)
```
**Important**: Send premium as `msg.value` with the transaction

### calculatePremium
```solidity
function calculatePremium(
    uint256 _coverageAmount,
    uint256 _duration,
    uint256 _riskScore
) pure returns (uint256)
```

## Premium Calculation
- Base rate: 2.5% annually
- Risk adjustment: 0-8% based on risk score
- Formula: `(basePremium + riskAdjustment) * (duration / 365 days)`

## Troubleshooting

### "Transaction Reverted" Errors
1. Check you're using the correct contract address (`0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC`)
2. Ensure sufficient STT balance for premium + gas
3. Risk score must be < 80
4. Coverage must be between 1000 and 10,000,000 STT
5. Duration must be between 30 and 365 days

### Testing Steps
1. Use `/debug` page for detailed contract interaction logs
2. Use `/insurance-test` page for the working implementation
3. Check console for detailed error messages