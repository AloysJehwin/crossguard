const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 TESTING PREMIUM CALCULATION");
  console.log("=".repeat(60) + "\n");

  try {
    // Contract address
    const contractAddress = "0x45B29955CEa195d9c1664e8F4628041503B0d11A";
    
    // Get the contract ABI
    const CrossGuardInsurance = await hre.ethers.getContractFactory("CrossGuardInsuranceNative");
    const insurance = CrossGuardInsurance.attach(contractAddress);
    
    // Test parameters
    const testCases = [
      { coverage: "1000", duration: 30, riskScore: 30 },
      { coverage: "10000", duration: 90, riskScore: 30 },
      { coverage: "100000", duration: 180, riskScore: 50 },
    ];
    
    console.log("Contract Address:", contractAddress);
    console.log("-".repeat(60));
    
    for (const test of testCases) {
      const coverageWei = hre.ethers.parseEther(test.coverage);
      const durationSeconds = test.duration * 24 * 60 * 60;
      
      console.log(`\nTest Case:`);
      console.log(`  Coverage: ${test.coverage} STT`);
      console.log(`  Duration: ${test.duration} days`);
      console.log(`  Risk Score: ${test.riskScore}/100`);
      
      try {
        const premium = await insurance.calculatePremium(
          coverageWei,
          durationSeconds,
          test.riskScore
        );
        
        const premiumSTT = hre.ethers.formatEther(premium);
        const percentage = (parseFloat(premiumSTT) / parseFloat(test.coverage) * 100).toFixed(2);
        
        console.log(`  Premium: ${premiumSTT} STT (${percentage}% of coverage)`);
      } catch (error) {
        console.log(`  ERROR: ${error.message}`);
      }
    }
    
    console.log("\n" + "=".repeat(60));
    
    // Test direct call with web3 provider
    console.log("\n📞 Testing direct RPC call...");
    const provider = new hre.ethers.JsonRpcProvider("https://dream-rpc.somnia.network/");
    
    // Manual ABI for calculatePremium
    const abi = ["function calculatePremium(uint256,uint256,uint256) pure returns(uint256)"];
    const contract = new hre.ethers.Contract(contractAddress, abi, provider);
    
    const testPremium = await contract.calculatePremium(
      hre.ethers.parseEther("10000"),
      90 * 24 * 60 * 60,
      30
    );
    
    console.log("Direct call result:", hre.ethers.formatEther(testPremium), "STT");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });