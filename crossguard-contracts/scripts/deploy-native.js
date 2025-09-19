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
  const insurance = await CrossGuardInsuranceNative.deploy({
    gasPrice: hre.ethers.parseUnits("50", "gwei"),
    gasLimit: 5000000
  });

  await insurance.waitForDeployment();
  const contractAddress = await insurance.getAddress();

  console.log("CrossGuardInsuranceNative deployed to:", contractAddress);
  console.log("Transaction hash:", insurance.deploymentTransaction().hash);
  
  // Optional: Deposit initial funds to the contract
  console.log("\nDepositing initial funds to insurance pool...");
  const depositAmount = hre.ethers.parseEther("10"); // 10 STT
  const depositTx = await insurance.depositFunds({
    value: depositAmount,
    gasPrice: hre.ethers.parseUnits("50", "gwei")
  });
  await depositTx.wait();
  console.log("Deposited", hre.ethers.formatEther(depositAmount), "STT to insurance pool");
  
  console.log("\nContract ready for insurance purchases with native STT!");
  console.log("Update RealInsurancePurchase component with address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });