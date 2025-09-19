const hre = require("hardhat");

async function main() {
  console.log("\nTESTING ACTUAL PURCHASE");
  console.log("=".repeat(40));

  const contractAddress = "0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC";
  const [signer] = await hre.ethers.getSigners();
  
  const contract = await hre.ethers.getContractAt("CrossGuardInsuranceNative", contractAddress);
  
  // Test parameters
  const protocolAddress = "0x1234567890123456789012345678901234567890"; // Test address
  const coverageAmount = hre.ethers.parseEther("1000"); // 1000 STT
  const duration = 30 * 24 * 60 * 60; // 30 days
  const riskScore = 30;
  
  // Calculate premium
  const premium = await contract.calculatePremium(coverageAmount, duration, riskScore);
  
  console.log("Protocol to insure:", protocolAddress);
  console.log("Coverage:", hre.ethers.formatEther(coverageAmount), "STT");
  console.log("Duration:", duration / 86400, "days");
  console.log("Risk Score:", riskScore);
  console.log("Premium:", hre.ethers.formatEther(premium), "STT");
  
  try {
    console.log("\nSending purchase transaction...");
    const tx = await contract.purchaseInsurance(
      protocolAddress,
      coverageAmount,
      duration,
      riskScore,
      { 
        value: premium,
        gasLimit: 5000000
      }
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Purchase successful!");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Find the PolicyPurchased event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'PolicyPurchased';
      } catch (e) {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      console.log("\nPolicy ID:", parsed.args[0].toString());
    }
    
  } catch (error) {
    console.error("\n❌ Purchase failed!");
    console.error("Error:", error.message);
    
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });