const hre = require("hardhat");

async function main() {
  console.log("Deploying CrossGuardInsuranceNative...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy contract
  const CrossGuardInsuranceNative = await hre.ethers.getContractFactory("CrossGuardInsuranceNative");
  
  console.log("Sending deployment transaction...");
  const insurance = await CrossGuardInsuranceNative.deploy();

  // Get the address immediately after deployment
  const contractAddress = await insurance.getAddress();
  console.log("Contract deployed to:", contractAddress);
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "somnia-testnet",
    chainId: 50312,
    contracts: {
      CrossGuardInsuranceNative: contractAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployment-native-somnia.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("Contract address:", contractAddress);
  console.log("\nUpdate your frontend with this address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });