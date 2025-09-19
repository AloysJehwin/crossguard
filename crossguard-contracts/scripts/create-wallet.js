const { ethers } = require("ethers");

console.log("\n" + "=".repeat(60));
console.log("🔐 CREATING NEW WALLET FOR SOMNIA TESTNET DEPLOYMENT");
console.log("=".repeat(60) + "\n");

// Create a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log("✅ New Wallet Created Successfully!\n");
console.log("📋 WALLET DETAILS:");
console.log("-".repeat(60));
console.log("Address:     ", wallet.address);
console.log("Private Key: ", wallet.privateKey);
console.log("-".repeat(60));

console.log("\n📝 MNEMONIC PHRASE (Save this securely!):");
console.log("-".repeat(60));
console.log(wallet.mnemonic.phrase);
console.log("-".repeat(60));

console.log("\n⚙️  SETUP INSTRUCTIONS:");
console.log("-".repeat(60));
console.log("1. Add to your .env file:");
console.log(`   PRIVATE_KEY=${wallet.privateKey.slice(2)}`);
console.log("\n2. Get test STT tokens:");
console.log("   - Request from Somnia faucet");
console.log("   - Or ask in Somnia Discord/Telegram");
console.log("\n3. Your wallet address to receive tokens:");
console.log(`   ${wallet.address}`);
console.log("-".repeat(60));

console.log("\n⚠️  SECURITY WARNINGS:");
console.log("-".repeat(60));
console.log("• NEVER share your private key or mnemonic phrase");
console.log("• NEVER commit .env file to GitHub");
console.log("• This is for TESTNET use only");
console.log("• Keep this wallet separate from your main funds");
console.log("-".repeat(60));

console.log("\n🚀 Next Steps:");
console.log("-".repeat(60));
console.log("1. Copy the PRIVATE_KEY line above");
console.log("2. Paste it into crossguard-contracts/.env");
console.log("3. Get STT test tokens for gas fees");
console.log("4. Run: npx hardhat run scripts/deploy-somnia.js --network somnia-testnet");
console.log("-".repeat(60) + "\n");