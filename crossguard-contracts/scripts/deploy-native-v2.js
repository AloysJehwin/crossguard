const hre = require("hardhat");

async function main() {
  console.log("Deploying CrossGuardInsuranceNative to Somnia testnet...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "STT");

  // Deploy contract (no constructor arguments needed for native version)
  const CrossGuardInsuranceNative = await hre.ethers.getContractFactory("CrossGuardInsuranceNative");
  
  console.log("Deploying contract...");
  const insurance = await CrossGuardInsuranceNative.deploy({
    gasPrice: hre.ethers.parseUnits("10", "gwei"),
    gasLimit: 3000000
  });

  // Get deployment transaction
  const deployTx = insurance.deploymentTransaction();
  console.log("Deployment transaction hash:", deployTx.hash);
  
  // Wait for confirmation
  console.log("Waiting for deployment confirmation...");
  const receipt = await deployTx.wait();
  
  // Get contract address from receipt
  const contractAddress = receipt.contractAddress;
  console.log("CrossGuardInsuranceNative deployed to:", contractAddress);
  
  // Verify deployment
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code !== "0x") {
    console.log("Contract deployment verified!");
    
    // Get deployed contract instance
    const deployedContract = await hre.ethers.getContractAt("CrossGuardInsuranceNative", contractAddress);
    
    // Optional: Deposit initial funds
    console.log("\nDepositing initial funds to insurance pool...");
    const depositAmount = hre.ethers.parseEther("5"); // 5 STT
    const depositTx = await deployedContract.depositFunds({
      value: depositAmount,
      gasPrice: hre.ethers.parseUnits("10", "gwei")
    });
    await depositTx.wait();
    console.log("Deposited", hre.ethers.formatEther(depositAmount), "STT to insurance pool");
    
    console.log("\n✅ Contract ready for insurance purchases with native STT!");
    console.log("Contract Address:", contractAddress);
    console.log("\nUpdate RealInsurancePurchase component with this address!");
  } else {
    console.log("Warning: Contract may not have been deployed correctly");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });