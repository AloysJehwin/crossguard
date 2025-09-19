'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface InsuranceCalculatorProps {
  riskScore: number
  contractAddress: string
  connected: boolean
  account: string
}

export default function InsuranceCalculator({ 
  riskScore, 
  contractAddress,
  connected,
  account 
}: InsuranceCalculatorProps) {
  const [coverageAmount, setCoverageAmount] = useState(10000)
  const [duration, setDuration] = useState(30)
  const [premium, setPremium] = useState(0)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    // Calculate premium based on risk score
    const basePremium = coverageAmount * 0.025 // 2.5% base
    const riskAdjustment = (riskScore / 100) * 0.08 // Up to 8% risk adjustment
    const calculatedPremium = basePremium * (1 + riskAdjustment) * (duration / 365)
    setPremium(Number(calculatedPremium.toFixed(2)))
  }, [coverageAmount, duration, riskScore])

  const purchaseInsurance = async () => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }

    setPurchasing(true)
    
    try {
      // Contract address on Somnia testnet (CrossGuardInsuranceNative)
      const INSURANCE_CONTRACT = '0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC'
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Insurance contract ABI (minimal)
      const abi = [
        'function purchaseInsurance(address _protocolAddress, uint256 _coverageAmount, uint256 _duration, uint256 _riskScore) external payable'
      ]
      
      const contract = new ethers.Contract(INSURANCE_CONTRACT, abi, signer)
      
      // Convert to Wei (assuming SOMNIA has 18 decimals)
      const premiumWei = ethers.parseEther(premium.toString())
      
      // Purchase insurance
      const tx = await contract.purchaseInsurance(
        contractAddress,
        ethers.parseEther(coverageAmount.toString()),
        duration * 24 * 60 * 60, // Convert days to seconds
        riskScore,
        { value: premiumWei }
      )
      
      await tx.wait()
      alert('Insurance purchased successfully!')
      
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Failed to purchase insurance')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="border-4 border-black bg-white p-8 mb-8">
      <h3 className="text-2xl font-bold mb-6 uppercase">Insurance Calculator</h3>
      
      {/* Contract Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 border-2 border-black">
        <div>
          <span className="font-bold uppercase">Contract:</span>
          <p className="font-mono text-sm">{contractAddress.slice(0, 10)}...</p>
        </div>
        <div>
          <span className="font-bold uppercase">Risk Score:</span>
          <p className="font-mono text-2xl">{riskScore}/100</p>
        </div>
      </div>

      {/* Coverage Amount */}
      <div className="mb-6">
        <label className="block text-lg font-bold mb-2 uppercase">
          Coverage Amount (SOMNIA)
        </label>
        <input 
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={coverageAmount}
          onChange={(e) => setCoverageAmount(Number(e.target.value))}
          className="w-full h-4 bg-gray-300 appearance-none cursor-pointer"
          style={{ borderRadius: '0' }}
        />
        <div className="flex justify-between mt-2 font-mono">
          <span>1,000</span>
          <span className="text-2xl font-bold">{coverageAmount.toLocaleString()} SOMNIA</span>
          <span>100,000</span>
        </div>
      </div>

      {/* Coverage Duration */}
      <div className="mb-6">
        <label className="block text-lg font-bold mb-2 uppercase">
          Coverage Duration (Days)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[30, 90, 180, 365].map((days) => (
            <button
              key={days}
              onClick={() => setDuration(days)}
              className={`
                border-2 border-black p-3 font-bold
                ${duration === days ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}
              `}
            >
              {days} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* Premium Display */}
      <div className="border-3 border-black bg-gray-50 p-6 mb-6">
        <h4 className="text-xl font-bold mb-4 uppercase">Premium Breakdown</h4>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between">
            <span>Base Premium (2.5%):</span>
            <span>{(coverageAmount * 0.025).toFixed(2)} SOMNIA</span>
          </div>
          <div className="flex justify-between">
            <span>Risk Adjustment (+{((riskScore/100)*8).toFixed(1)}%):</span>
            <span>{(premium - (coverageAmount * 0.025 * duration / 365)).toFixed(2)} SOMNIA</span>
          </div>
          <div className="flex justify-between">
            <span>Duration Factor ({duration} days):</span>
            <span>{(duration / 365).toFixed(2)}x</span>
          </div>
          <div className="border-t-2 border-black pt-2 mt-2">
            <div className="flex justify-between text-xl font-bold">
              <span>TOTAL PREMIUM:</span>
              <span>{premium.toFixed(2)} SOMNIA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={purchaseInsurance}
        disabled={!connected || purchasing}
        className="vintage-button w-full text-xl"
      >
        {purchasing ? 'PROCESSING...' : `PURCHASE INSURANCE (${premium.toFixed(2)} SOMNIA)`}
      </button>

      {/* Terms */}
      <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-400">
        <p className="text-xs font-mono uppercase">
          By purchasing insurance, you agree to CrossGuard terms. 
          Coverage begins immediately upon transaction confirmation on Somnia testnet.
        </p>
      </div>
    </div>
  )
}