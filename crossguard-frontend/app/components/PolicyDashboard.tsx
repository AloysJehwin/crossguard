'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC'
const CONTRACT_ABI = [
  "function getUserPolicies(address) view returns (uint256[])",
  "function policies(uint256) view returns (address holder, address protocolAddress, uint256 coverageAmount, uint256 premiumPaid, uint256 startTime, uint256 duration, uint256 riskScore, bool isActive, bool claimProcessed)"
]

interface Policy {
  id: number
  protocolAddress: string
  coverageAmount: string
  premium: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED'
  riskScore: number
}

export default function PolicyDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState('')

  useEffect(() => {
    // Check initial connection
    checkConnection()

    // Set up account change listener
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    // Listen for policy purchase events
    const handlePolicyPurchased = () => {
      if (account) {
        console.log('New policy purchased, reloading...')
        setTimeout(() => loadUserPolicies(account), 2000) // Small delay to ensure blockchain has updated
      }
    }
    window.addEventListener('policyPurchased', handlePolicyPurchased)

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
      window.removeEventListener('policyPurchased', handlePolicyPurchased)
    }
  }, [account])

  useEffect(() => {
    // Load policies whenever account changes
    if (account) {
      loadUserPolicies(account)
    } else {
      setPolicies([]) // Clear policies when no account
    }
  }, [account])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      console.log('Wallet changed to:', accounts[0])
      setAccount(accounts[0])
    } else {
      console.log('Wallet disconnected')
      setAccount('')
      setPolicies([])
    }
  }

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload()
  }

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const loadUserPolicies = async (userAddress: string) => {
    if (!userAddress) return

    setLoading(true)
    setPolicies([]) // Clear previous policies
    
    try {
      const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network/')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      console.log('Loading policies for:', userAddress)
      
      // Get user's policy IDs
      const policyIds = await contract.getUserPolicies(userAddress)
      console.log('Found policy IDs:', policyIds.map((id: any) => id.toString()))
      
      const loadedPolicies: Policy[] = []
      
      for (const policyId of policyIds) {
        try {
          const policyData = await contract.policies(policyId)
          
          // Only include policies that belong to this user
          if (policyData.holder.toLowerCase() !== userAddress.toLowerCase()) {
            continue
          }
          
          const now = Math.floor(Date.now() / 1000)
          const startTime = Number(policyData.startTime)
          const duration = Number(policyData.duration)
          const expiryTimestamp = startTime + duration
          const isExpired = now > expiryTimestamp
          
          let status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED' = 'ACTIVE'
          if (policyData.claimProcessed) {
            status = 'CLAIMED'
          } else if (!policyData.isActive || isExpired) {
            status = 'EXPIRED'
          }
          
          const policy: Policy = {
            id: Number(policyId),
            protocolAddress: policyData.protocolAddress,
            coverageAmount: ethers.formatEther(policyData.coverageAmount),
            premium: ethers.formatEther(policyData.premiumPaid),
            startDate: new Date(startTime * 1000).toLocaleDateString(),
            endDate: new Date(expiryTimestamp * 1000).toLocaleDateString(),
            status,
            riskScore: Number(policyData.riskScore)
          }
          
          loadedPolicies.push(policy)
        } catch (e) {
          console.error(`Error loading policy ${policyId}:`, e)
        }
      }
      
      // Filter out old policies (IDs 1-6) to start fresh
      const freshPolicies = loadedPolicies.filter(policy => policy.id > 6)
      
      // Sort by ID descending (newest first)
      freshPolicies.sort((a, b) => b.id - a.id)
      setPolicies(freshPolicies)
      
      console.log(`Loaded ${loadedPolicies.length} policies for ${userAddress}`)
      
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPolicies = () => {
    if (account) {
      loadUserPolicies(account)
    }
  }

  // Calculate total coverage and active policies
  const activePolicies = policies.filter(p => p.status === 'ACTIVE')
  const totalCoverage = activePolicies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0)
  const totalPremiums = policies.reduce((sum, p) => sum + parseFloat(p.premium), 0)

  if (!account) {
    return (
      <div className="border-4 border-black bg-white p-8">
        <h3 className="text-2xl font-bold mb-6 uppercase">Your Policies</h3>
        <div className="text-center py-8">
          <div className="mb-4">
            <p className="text-lg font-bold mb-2">No Wallet Connected</p>
            <p className="text-sm text-gray-600">Please connect your wallet using the button in the top right corner</p>
            <p className="text-xs text-gray-500 mt-2">Your insurance policies will appear here once connected</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-4 border-black bg-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold uppercase">Your Policies</h3>
          <p className="text-sm text-gray-600 mt-1">
            Wallet: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        <button
          onClick={refreshPolicies}
          disabled={loading}
          className="px-4 py-2 border-2 border-black font-bold text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'LOADING...' : 'REFRESH'}
        </button>
      </div>

      {/* Statistics */}
      {policies.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-black p-3 bg-blue-50">
            <div className="text-2xl font-bold">{policies.length}</div>
            <div className="text-xs uppercase">Total Policies</div>
          </div>
          <div className="border-2 border-black p-3 bg-green-50">
            <div className="text-2xl font-bold">{activePolicies.length}</div>
            <div className="text-xs uppercase">Active</div>
          </div>
          <div className="border-2 border-black p-3 bg-yellow-50">
            <div className="text-2xl font-bold">{totalCoverage.toFixed(0)}</div>
            <div className="text-xs uppercase">Total STT Coverage</div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl font-mono animate-pulse">Loading your policies...</div>
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
          <p className="font-bold text-lg mb-2">No Policies Found</p>
          <p className="text-sm text-gray-600">
            Purchase insurance to protect your smart contracts
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {policies.map((policy) => {
            // Determine risk level category
            const riskLevel = policy.riskScore >= 70 ? 'HIGH' : 
                            policy.riskScore >= 40 ? 'MEDIUM' : 'LOW'
            const riskColor = policy.riskScore >= 70 ? 'border-red-500' : 
                            policy.riskScore >= 40 ? 'border-yellow-500' : 'border-green-500'
            
            return (
            <div key={policy.id} className={`border-4 ${riskColor} p-6 hover:shadow-xl transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-bold text-xl">Policy #{policy.id}</span>
                  <span className={`ml-3 px-4 py-2 text-sm font-bold uppercase
                    ${policy.status === 'ACTIVE' ? 'bg-green-500 text-white' : 
                      policy.status === 'EXPIRED' ? 'bg-gray-500 text-white' :
                      'bg-orange-500 text-white'}`}>
                    {policy.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`px-4 py-2 text-lg font-bold
                    ${policy.riskScore >= 70 ? 'bg-red-100 text-red-800 border-2 border-red-500' : 
                      policy.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500' :
                      'bg-green-100 text-green-800 border-2 border-green-500'}`}>
                    RISK LEVEL: {riskLevel}
                  </div>
                  <div className="text-2xl font-bold mt-1">{policy.riskScore}/100</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-4 border-2 border-black">
                <div>
                  <p className="font-bold uppercase text-xs text-gray-600 mb-2">Protocol Address</p>
                  <p className="font-mono text-sm font-bold">{policy.protocolAddress.slice(0, 10)}...</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs text-gray-600 mb-2">Coverage Amount</p>
                  <p className="font-bold text-xl">{parseFloat(policy.coverageAmount).toFixed(0)} STT</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs text-gray-600 mb-2">Premium Paid</p>
                  <p className="font-bold text-lg">{parseFloat(policy.premium).toFixed(2)} STT</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs text-gray-600 mb-2">Expiry Date</p>
                  <p className="font-mono text-sm font-bold">{policy.endDate}</p>
                </div>
              </div>

              {/* Risk Details Section */}
              <div className="mt-4 p-4 bg-gray-100 border-2 border-black">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase mb-1">Risk Category</p>
                    <p className="font-bold">
                      {riskLevel === 'LOW' && 'LOW RISK'}
                      {riskLevel === 'MEDIUM' && 'MEDIUM RISK'}
                      {riskLevel === 'HIGH' && 'HIGH RISK'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase mb-1">Protection Status</p>
                    <p className="font-bold">
                      {policy.status === 'ACTIVE' ? 'PROTECTED' : 'NOT ACTIVE'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase mb-1">Coverage Info</p>
                    <p className="text-sm">
                      {policy.status === 'ACTIVE' ? 'Your protocol is insured' : 'Coverage expired'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {policies.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Premiums Paid:</span>
            <span className="font-bold">{totalPremiums.toFixed(2)} STT</span>
          </div>
        </div>
      )}
    </div>
  )
}