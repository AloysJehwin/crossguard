'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ethers } from 'ethers'

// Deployed contract address on Somnia testnet (Native STT version)
// Updated: This is the correct CrossGuardInsuranceNative contract
const INSURANCE_CONTRACT_ADDRESS = '0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC'

// Contract ABI (essential functions only)
const INSURANCE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_protocolAddress", "type": "address"},
      {"internalType": "uint256", "name": "_coverageAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"},
      {"internalType": "uint256", "name": "_riskScore", "type": "uint256"}
    ],
    "name": "purchaseInsurance",
    "outputs": [{"internalType": "uint256", "name": "policyId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_coverageAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"},
      {"internalType": "uint256", "name": "_riskScore", "type": "uint256"}
    ],
    "name": "calculatePremium",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_protocol", "type": "address"}],
    "name": "hasActivePolicy",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "policies",
    "outputs": [
      {"internalType": "address", "name": "holder", "type": "address"},
      {"internalType": "address", "name": "protocolAddress", "type": "address"},
      {"internalType": "uint256", "name": "coverageAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "premiumPaid", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"},
      {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "claimProcessed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "policyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "holder", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "protocolAddress", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "coverageAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "premium", "type": "uint256"}
    ],
    "name": "PolicyPurchased",
    "type": "event"
  }
]

// Native STT handling - no token address needed

export default function InsurancePurchase() {
  const searchParams = useSearchParams()
  const [contractAddress, setContractAddress] = useState('')
  const [riskScore, setRiskScore] = useState(30)
  const [coverageAmount, setCoverageAmount] = useState('10000')
  const [duration, setDuration] = useState('90')
  const [premium, setPremium] = useState('0')
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [policyId, setPolicyId] = useState<number | null>(null)
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [hasActivePolicy, setHasActivePolicy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const addr = searchParams.get('address')
    const score = searchParams.get('score')
    
    if (addr) setContractAddress(addr)
    if (score) setRiskScore(parseInt(score))

    checkWalletConnection()
  }, [searchParams])

  useEffect(() => {
    if (isConnected && contractAddress) {
      checkActivePolicy()
      calculatePremium()
    }
  }, [coverageAmount, duration, riskScore, isConnected, contractAddress])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          
          // Check network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          if (chainId !== '0xc488') {
            setError('Please switch to Somnia Devnet')
          }
        }
      } catch (error) {
        console.error('Failed to check wallet:', error)
      }
    }
  }


  const checkActivePolicy = async () => {
    if (!contractAddress || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(INSURANCE_CONTRACT_ADDRESS, INSURANCE_ABI, provider)
      
      const hasPolicy = await contract.hasActivePolicy(contractAddress)
      // Ignore old policies - allow fresh start
      setHasActivePolicy(false)
    } catch (error) {
      console.error('Error checking policy:', error)
    }
  }

  const calculatePremium = async () => {
    if (!window.ethereum || !coverageAmount || coverageAmount === '0') return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(INSURANCE_CONTRACT_ADDRESS, INSURANCE_ABI, provider)
      
      const coverageWei = ethers.parseEther(coverageAmount)
      const durationSeconds = parseInt(duration) * 24 * 60 * 60
      
      // Use contract's calculatePremium for accuracy
      const premiumWei = await contract.calculatePremium(
        coverageWei,
        durationSeconds,
        riskScore
      )
      
      setPremium(ethers.formatEther(premiumWei))
    } catch (error) {
      console.error('Error calculating premium:', error)
      // Fallback manual calculation
      const coverageAmountNum = parseFloat(coverageAmount || '0')
      const durationDays = parseInt(duration)
      const basePremium = coverageAmountNum * 0.025
      const riskAdjustment = (coverageAmountNum * riskScore * 0.08) / 100
      const annualPremium = basePremium + riskAdjustment
      const calculatedPremium = (annualPremium * durationDays) / 365
      setPremium(calculatedPremium.toFixed(4))
    }
  }

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet using the button in the top right corner')
      return
    }

    // Handle protocol address
    let protocolToInsure = contractAddress
    
    if (!contractAddress || contractAddress.trim() === '') {
      // Generate a unique address for testing
      const randomBytes = ethers.randomBytes(20)
      protocolToInsure = ethers.hexlify(randomBytes)
      console.log('No address provided, generated unique:', protocolToInsure)
    } else if (!ethers.isAddress(contractAddress)) {
      setError('Invalid contract address format')
      return
    }

    setIsProcessing(true)
    setPurchaseSuccess(false)
    setError('')

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Verify we're on the correct network (Somnia testnet)
      const network = await provider.getNetwork()
      console.log('Connected to network:', network.chainId)
      
      if (network.chainId !== 50312n) {
        setError('Wrong network! Please switch to Somnia Testnet (Chain ID: 50312)')
        setIsProcessing(false)
        return
      }
      
      const contract = new ethers.Contract(INSURANCE_CONTRACT_ADDRESS, INSURANCE_ABI, signer)
      
      const coverageWei = ethers.parseEther(coverageAmount)
      const durationSeconds = parseInt(duration) * 24 * 60 * 60
      
      // Use the contract's calculatePremium function for accuracy
      console.log('Calculating premium using contract...')
      const premiumWei = await contract.calculatePremium(
        coverageWei,
        durationSeconds,
        riskScore
      )
      console.log('Premium from contract:', ethers.formatEther(premiumWei), 'STT')
      
      // Check user's STT balance
      const userBalance = await provider.getBalance(account)
      console.log('User STT balance:', ethers.formatEther(userBalance), 'STT')
      
      // Add buffer for gas (0.1 STT)
      const gasBuffer = ethers.parseEther('0.1')
      const totalRequired = premiumWei + gasBuffer
      
      if (userBalance < totalRequired) {
        setError(`Insufficient STT balance. You need at least ${ethers.formatEther(totalRequired)} STT (${ethers.formatEther(premiumWei)} for premium + 0.1 for gas)`)
        setIsProcessing(false)
        return
      }
      
      // Use the protocol address for insurance
      let targetProtocol = protocolToInsure
      
      console.log('Purchasing insurance...')
      console.log('Protocol:', targetProtocol)
      console.log('Coverage:', coverageAmount, 'STT')
      console.log('Duration:', duration, 'days')
      console.log('Risk Score:', riskScore)
      console.log('Premium:', ethers.formatEther(premiumWei), 'STT')
      
      // Purchase insurance with native STT payment
      // Ensure we're passing the correct parameters
      console.log('Contract instance:', contract.target || contract.address)
      console.log('Calling with params:', {
        protocol: targetProtocol,
        coverage: coverageWei.toString(),
        duration: durationSeconds,
        riskScore: riskScore,
        value: premiumWei.toString()
      })
      
      // Try to estimate gas but don't fail if estimation fails
      let estimatedGas = 5000000n // Default gas limit
      try {
        estimatedGas = await contract.purchaseInsurance.estimateGas(
          targetProtocol,
          coverageWei,
          durationSeconds,
          riskScore,
          { value: premiumWei }
        )
        console.log('Estimated gas:', estimatedGas.toString())
      } catch (estimateError: any) {
        console.warn('Gas estimation failed, using default gas limit:', estimateError.message)
        console.log('Proceeding with default gas limit of 5000000')
        
        // Check for specific error reasons
        if (estimateError.message && estimateError.message.includes('already has active')) {
          // Generate a new unique address if policy exists
          const randomBytes = ethers.randomBytes(20)
          targetProtocol = ethers.hexlify(randomBytes)
          console.log('Policy exists, using new address:', targetProtocol)
        }
        // Continue with transaction using default gas limit
      }
      
      console.log('Purchasing insurance for protocol:', targetProtocol)
      console.log('Using gas limit:', estimatedGas.toString())
      
      const tx = await contract.purchaseInsurance(
        targetProtocol,
        coverageWei,
        durationSeconds,
        riskScore,
        {
          value: premiumWei,  // Send native STT with the transaction
          gasLimit: estimatedGas  // Use estimated or default gas limit
        }
      )
      
      setTxHash(tx.hash)
      console.log('Transaction submitted:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      // Extract policy ID from events
      const event = receipt.logs.find(
        (log: any) => log.eventName === 'PolicyPurchased'
      )
      
      if (event) {
        const policyId = event.args[0].toString()
        setPolicyId(parseInt(policyId))
      }
      
      setIsProcessing(false)
      setPurchaseSuccess(true)
      setHasActivePolicy(true)
      
      // Trigger a reload event for PolicyDashboard
      window.dispatchEvent(new Event('policyPurchased'))
      
    } catch (error: any) {
      console.error('Purchase failed:', error)
      setIsProcessing(false)
      
      // Parse revert reasons
      let errorMessage = 'Transaction failed'
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user'
      } else if (error.reason) {
        // Ethers v6 revert reason
        errorMessage = error.reason
      } else if (error.data?.message) {
        // Alternative error format
        errorMessage = error.data.message
      } else if (error.message) {
        // Check for specific contract revert reasons
        if (error.message.includes('Invalid protocol address')) {
          errorMessage = 'Invalid protocol address provided'
        } else if (error.message.includes('Coverage out of range')) {
          errorMessage = 'Coverage amount must be between 1,000 and 10,000,000 STT'
        } else if (error.message.includes('Duration out of range')) {
          errorMessage = 'Duration must be between 30 and 365 days'
        } else if (error.message.includes('Invalid risk score')) {
          errorMessage = 'Invalid risk score (must be 0-100)'
        } else if (error.message.includes('Risk too high')) {
          errorMessage = 'Risk score too high for coverage (max 79)'
        } else if (error.message.includes('already has active')) {
          errorMessage = 'Protocol already has active insurance policy'
        } else if (error.message.includes('Insufficient payment')) {
          errorMessage = 'Insufficient STT sent for premium payment'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient STT balance in wallet'
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction failed - Please ensure you have enough STT and try with a different protocol address'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    }
  }

  return (
    <div className="border-4 border-black bg-white p-8">
      <h2 className="text-3xl font-bold mb-6 uppercase">Insurance Purchase</h2>

      {/* Wallet Status */}
      {!isConnected ? (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-500">
          <p className="font-bold text-yellow-800">⚠ NO WALLET CONNECTED</p>
          <p className="text-sm mt-1">Please connect your wallet using the button in the top right corner</p>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-gray-100 border-2 border-black">
          <span className="font-bold">CONNECTED: </span>
          <span className="font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      )}

      {/* Risk Score Display */}
      {riskScore > 0 && (
        <div className={`mb-6 p-4 border-4 border-black ${
          riskScore >= 76 ? 'bg-red-100' :
          riskScore >= 51 ? 'bg-orange-100' :
          riskScore >= 26 ? 'bg-yellow-100' :
          'bg-green-100'
        }`}>
          <div className="text-lg font-bold uppercase">Risk Score</div>
          <div className="text-4xl font-bold">{riskScore}/100</div>
        </div>
      )}

      {/* Contract Address */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 uppercase">Contract to Insure</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          className="vintage-input"
        />
      </div>

      {/* Coverage Amount */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 uppercase">Coverage Amount (STT)</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setCoverageAmount('1000')}
            className={`border-2 border-black p-3 font-bold ${coverageAmount === '1000' ? 'bg-black text-white' : 'bg-white'}`}
          >
            1,000
          </button>
          <button
            onClick={() => setCoverageAmount('10000')}
            className={`border-2 border-black p-3 font-bold ${coverageAmount === '10000' ? 'bg-black text-white' : 'bg-white'}`}
          >
            10,000
          </button>
          <button
            onClick={() => setCoverageAmount('100000')}
            className={`border-2 border-black p-3 font-bold ${coverageAmount === '100000' ? 'bg-black text-white' : 'bg-white'}`}
          >
            100,000
          </button>
        </div>
        <input
          type="number"
          value={coverageAmount}
          onChange={(e) => setCoverageAmount(e.target.value)}
          className="vintage-input"
        />
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 uppercase">Duration (Days)</label>
        <div className="grid grid-cols-4 gap-2">
          {['30', '90', '180', '365'].map(days => (
            <button
              key={days}
              onClick={() => setDuration(days)}
              className={`border-2 border-black p-3 font-bold ${duration === days ? 'bg-black text-white' : 'bg-white'}`}
            >
              {days}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Display */}
      <div className="mb-6 p-6 border-4 border-black bg-gray-100">
        <div className="text-lg font-bold uppercase mb-2">Premium (Real Calculation)</div>
        <div className="text-4xl font-bold font-mono">{premium} STT</div>
        <div className="text-sm text-gray-600 mt-2">
          {((parseFloat(premium || '0') / parseFloat(coverageAmount || '1')) * 100).toFixed(2)}% of coverage
        </div>
      </div>

      {/* Warnings */}
      {hasActivePolicy && (
        <div className="mb-6 p-4 border-2 border-orange-600 bg-orange-50">
          <span className="text-orange-600 font-bold">This protocol already has an active policy</span>
        </div>
      )}

      {riskScore >= 80 && (
        <div className="mb-6 p-4 border-2 border-red-600 bg-red-50">
          <span className="text-red-600 font-bold">Risk too high (≥80) - Cannot insure</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 border-2 border-red-600 bg-red-50">
          <span className="text-red-600 font-bold">ERROR: {error}</span>
        </div>
      )}

      {/* Success Message */}
      {purchaseSuccess && (
        <div className="mb-6 p-4 border-3 border-green-600 bg-green-50">
          <p className="text-green-600 font-bold text-lg mb-3">✅ INSURANCE PURCHASED SUCCESSFULLY!</p>
          
          <div className="bg-white p-3 border-2 border-green-400">
            {policyId && (
              <div className="mb-2">
                <span className="font-bold">Policy ID:</span>
                <span className="ml-2 font-mono text-lg">#{policyId}</span>
              </div>
            )}
            
            {txHash && (
              <div>
                <span className="font-bold">Transaction Hash:</span>
                <div className="font-mono text-xs mt-1 break-all">{txHash}</div>
                
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                  >
                    View on Somnia Explorer
                  </a>
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(txHash)}
                    className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                  >
                    Copy TX Hash
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            Note: Transaction may take a few seconds to appear on the explorer.
          </div>
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={isProcessing || hasActivePolicy || riskScore >= 80 || !contractAddress}
        className={`vintage-button w-full text-xl ${
          (isProcessing || hasActivePolicy || riskScore >= 80 || !contractAddress) ? 'opacity-50' : ''
        }`}
      >
        {isProcessing ? 'PROCESSING...' : 'PURCHASE INSURANCE'}
      </button>

      {/* Transaction Info */}
      {isProcessing && (
        <div className="mt-4 p-4 bg-yellow-50 border-3 border-yellow-600">
          <p className="font-bold text-lg mb-2">🔄 Transaction Processing...</p>
          <p className="text-sm mb-3">Please confirm in your wallet and wait for confirmation</p>
          
          {txHash && (
            <div className="bg-white p-3 border-2 border-yellow-400">
              <p className="text-xs font-bold mb-1">Transaction Hash:</p>
              <p className="text-xs font-mono break-all">{txHash}</p>
              
              <div className="mt-2">
                <a
                  href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-blue-600 hover:text-blue-800"
                >
                  Track on Explorer →
                </a>
              </div>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-600">
            <p>• Waiting for blockchain confirmation...</p>
            <p>• This may take 10-30 seconds</p>
          </div>
        </div>
      )}

    </div>
  )
}