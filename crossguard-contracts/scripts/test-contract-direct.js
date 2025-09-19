const hre = require("hardhat");

async function main() {
  console.log("\n=".repeat(60));
  console.log("TESTING CONTRACT DIRECTLY");
  console.log("=".repeat(60));

  const contractAddress = "0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC";
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Signer:", signer.address);
  console.log("Contract:", contractAddress);
  
  // First check if contract exists
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("Contract has code:", code !== "0x" ? "YES" : "NO");
  
  if (code === "0x") {
    console.error("ERROR: No contract at this address!");
    return;
  }
  
  // Get contract instance
  const abi = [
    "function owner() view returns (address)",
    "function calculatePremium(uint256,uint256,uint256) pure returns (uint256)",
    "function purchaseInsurance(address,uint256,uint256,uint256) payable returns (uint256)",
    "function MIN_COVERAGE() view returns (uint256)",
    "function MAX_COVERAGE() view returns (uint256)",
    "function MIN_DURATION() view returns (uint256)",
    "function MAX_DURATION() view returns (uint256)"
  ];
  
  const contract = new hre.ethers.Contract(contractAddress, abi, signer);
  
  try {
    // Test view functions
    console.log("\n1. Testing view functions...");
    
    const owner = await contract.owner();
    console.log("   Owner:", owner);
    
    const minCoverage = await contract.MIN_COVERAGE();
    console.log("   MIN_COVERAGE:", hre.ethers.formatEther(minCoverage), "STT");
    
    const maxCoverage = await contract.MAX_COVERAGE();
    console.log("   MAX_COVERAGE:", hre.ethers.formatEther(maxCoverage), "STT");
    
    const minDuration = await contract.MIN_DURATION();
    console.log("   MIN_DURATION:", minDuration.toString(), "seconds =", Number(minDuration) / 86400, "days");
    
    const maxDuration = await contract.MAX_DURATION();
    console.log("   MAX_DURATION:", maxDuration.toString(), "seconds =", Number(maxDuration) / 86400, "days");
    
  } catch (error) {
    console.error("ERROR reading contract state:", error.message);
    console.log("\nThis might not be the right contract type!");
  }
  
  try {
    // Test premium calculation
    console.log("\n2. Testing premium calculation...");
    
    const coverageAmount = hre.ethers.parseEther("1000"); // Minimum
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds
    const riskScore = 30;
    
    console.log("   Coverage:", hre.ethers.formatEther(coverageAmount), "STT");
    console.log("   Duration:", duration, "seconds (30 days)");
    console.log("   Risk Score:", riskScore);
    
    const premium = await contract.calculatePremium(coverageAmount, duration, riskScore);
    console.log("   Calculated Premium:", hre.ethers.formatEther(premium), "STT");
    
  } catch (error) {
    console.error("ERROR calculating premium:", error.message);
  }
  
  try {
    // Test purchase with minimal params
    console.log("\n3. Testing purchase (dry run - estimate gas)...");
    
    const protocolAddress = "0x0000000000000000000000000000000000000001";
    const coverageAmount = hre.ethers.parseEther("1000");
    const duration = 30 * 24 * 60 * 60;
    const riskScore = 30;
    
    // Calculate premium
    const premium = await contract.calculatePremium(coverageAmount, duration, riskScore);
    console.log("   Premium required:", hre.ethers.formatEther(premium), "STT");
    
    // Try to estimate gas
    console.log("   Estimating gas for purchase...");
    const gasEstimate = await contract.purchaseInsurance.estimateGas(
      protocolAddress,
      coverageAmount,
      duration,
      riskScore,
      { value: premium }
    );
    
    console.log("   ✅ Gas estimate:", gasEstimate.toString());
    console.log("   Transaction should work!");
    
  } catch (error) {
    console.error("\n❌ Purchase will fail!");
    console.error("Error:", error.message);
    
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    
    if (error.data) {
      // Try to decode the error
      try {
        const iface = new hre.ethers.Interface([
          "error InvalidProtocolAddress()",
          "error CoverageOutOfRange(uint256 provided, uint256 min, uint256 max)",
          "error DurationOutOfRange(uint256 provided, uint256 min, uint256 max)",
          "error RiskTooHigh(uint256 riskScore)",
          "error InvalidRiskScore(uint256 riskScore)",
          "error ProtocolAlreadyHasActivePolicy(address protocol)",
          "error InsufficientPayment(uint256 required, uint256 provided)"
        ]);
        
        const decoded = iface.parseError(error.data);
        console.error("Decoded error:", decoded);
      } catch (e) {
        console.error("Could not decode error data");
      }
    }
  }
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });