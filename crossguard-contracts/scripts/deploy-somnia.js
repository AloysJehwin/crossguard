const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("DEPLOYING CROSSGUARD INSURANCE TO SOMNIA TESTNET");
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance using provider (ethers v6 syntax)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "STT");

  // For Somnia testnet, we'll use a placeholder token address
  // In production, this would be the wrapped STT token address
  const SOMNIA_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000001"; // Placeholder address

  console.log("\nDeploying CrossGuardInsurance contract...");
  
  // Deploy CrossGuardInsurance
  const CrossGuardInsurance = await hre.ethers.getContractFactory("CrossGuardInsurance");
  const insurance = await CrossGuardInsurance.deploy(SOMNIA_TOKEN_ADDRESS);

  // Wait for deployment (ethers v6 syntax)
  await insurance.waitForDeployment();
  const insuranceAddress = await insurance.getAddress();

  console.log("\n✅ CrossGuardInsurance deployed to:", insuranceAddress);
  
  // Get deployment transaction
  const deployTx = insurance.deploymentTransaction();
  if (deployTx) {
    console.log("Transaction hash:", deployTx.hash);
    
    // Wait for confirmations
    console.log("\nWaiting for confirmations...");
    await deployTx.wait(3);
  }

  console.log("\n=".repeat(60));
  console.log("DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("CrossGuardInsurance:", insuranceAddress);
  console.log("\nNetwork: Somnia Testnet (Chain ID: 50312)");
  console.log("Explorer: https://somnia-devnet.socialscan.io/address/" + insuranceAddress);
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "somnia-testnet",
    chainId: 50312,
    contracts: {
      CrossGuardInsurance: insuranceAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "./deployment-somnia.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to deployment-somnia.json");
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Update the contract address in your frontend:");
  console.log("   File: crossguard-frontend/app/components/MockInsurancePurchase.tsx");
  console.log("   Replace INSURANCE_CONTRACT_ADDRESS with:", insuranceAddress);
  console.log("\n2. Verify contract on explorer (if available)");
  console.log("3. Test the insurance purchase feature");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });