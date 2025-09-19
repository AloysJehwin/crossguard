const hre = require("hardhat");

async function main() {
  const txHash = "0x494984156eccd3630fe175ee9ae2f4e13315b9d05f22ca1ac38fbde5a54bacf9";
  
  console.log("\nChecking transaction:", txHash);
  console.log("=".repeat(60));

  try {
    const provider = hre.ethers.provider;
    
    // Get transaction
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      console.log("Transaction not found!");
      return;
    }
    
    console.log("\nTransaction Details:");
    console.log("  From:", tx.from);
    console.log("  To:", tx.to);
    console.log("  Value:", hre.ethers.formatEther(tx.value), "STT");
    console.log("  Gas Limit:", tx.gasLimit.toString());
    console.log("  Gas Price:", tx.gasPrice ? hre.ethers.formatUnits(tx.gasPrice, "gwei") + " gwei" : "N/A");
    console.log("  Nonce:", tx.nonce);
    
    // Get receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      console.log("\nTransaction Receipt:");
      console.log("  Status:", receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED");
      console.log("  Block Number:", receipt.blockNumber);
      console.log("  Gas Used:", receipt.gasUsed.toString());
      console.log("  Events:", receipt.logs.length);
      
      // If it's to our insurance contract
      if (tx.to === "0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC") {
        console.log("\n✅ This is an insurance purchase transaction!");
        
        // Try to decode
        try {
          const iface = new hre.ethers.Interface([
            "function purchaseInsurance(address,uint256,uint256,uint256) payable returns (uint256)",
            "event PolicyPurchased(uint256 indexed policyId, address indexed holder, address indexed protocolAddress, uint256 coverageAmount, uint256 premium)"
          ]);
          
          const decoded = iface.parseTransaction({ data: tx.data });
          console.log("\nPurchase Details:");
          console.log("  Protocol:", decoded.args[0]);
          console.log("  Coverage:", hre.ethers.formatEther(decoded.args[1]), "STT");
          console.log("  Duration:", Number(decoded.args[2]) / 86400, "days");
          console.log("  Risk Score:", decoded.args[3].toString());
          
          // Parse events
          for (const log of receipt.logs) {
            try {
              const event = iface.parseLog(log);
              if (event && event.name === "PolicyPurchased") {
                console.log("\n🎉 Policy Created!");
                console.log("  Policy ID:", event.args[0].toString());
                console.log("  Holder:", event.args[1]);
                console.log("  Protocol:", event.args[2]);
                console.log("  Coverage:", hre.ethers.formatEther(event.args[3]), "STT");
                console.log("  Premium:", hre.ethers.formatEther(event.args[4]), "STT");
              }
            } catch (e) {
              // Not our event
            }
          }
        } catch (e) {
          console.log("Could not decode transaction data");
        }
      }
    } else {
      console.log("\nTransaction is still pending...");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("Explorer URLs:");
    console.log("1. https://somnia-devnet.socialscan.io/tx/" + txHash);
    console.log("2. https://shannon-explorer.somnia.network/tx/" + txHash);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });