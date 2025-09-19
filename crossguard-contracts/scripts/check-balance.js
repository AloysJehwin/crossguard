const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("💰 CHECKING WALLET BALANCE ON SOMNIA TESTNET");
  console.log("=".repeat(60) + "\n");

  try {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    
    // Get balance using provider
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    
    console.log("📋 WALLET INFORMATION:");
    console.log("-".repeat(60));
    console.log("Network:       Somnia Testnet");
    console.log("Chain ID:      ", network.chainId);
    console.log("Wallet Address:", deployer.address);
    console.log("Balance:       ", hre.ethers.formatEther(balance), "STT");
    console.log("-".repeat(60));
    
    // Check if balance is sufficient for deployment
    const minBalance = hre.ethers.parseEther("0.1"); // Minimum 0.1 STT for deployment
    
    if (balance >= minBalance) {
      console.log("\n✅ Balance is sufficient for deployment!");
    } else {
      console.log("\n⚠️  WARNING: Balance might be insufficient for deployment!");
      console.log("   You need at least 0.1 STT for gas fees.");
      console.log("\n📝 HOW TO GET TEST TOKENS:");
      console.log("   1. Visit Somnia Discord/Telegram");
      console.log("   2. Find the faucet channel");
      console.log("   3. Request tokens with your address:", deployer.address);
    }
    
    console.log("\n" + "=".repeat(60) + "\n");
    
  } catch (error) {
    console.error("❌ Error checking balance:");
    console.error(error.message);
    
    if (error.message.includes("invalid address") || error.message.includes("private key")) {
      console.log("\n📝 No private key found. Please add to .env file:");
      console.log("   PRIVATE_KEY=your_private_key_here");
      console.log("\n   If you have it in .env.local, copy it to crossguard-contracts/.env");
    } else if (error.message.includes("network")) {
      console.log("\n📝 Network connection issue. Check:");
      console.log("   - RPC URL is correct");
      console.log("   - Internet connection");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });