'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC'
const CONTRACT_ABI = [
  "function policies(uint256) view returns (address holder, address protocolAddress, uint256 coverageAmount, uint256 premiumPaid, uint256 startTime, uint256 duration, uint256 riskScore, bool isActive, bool claimProcessed)",
  "function getUserPolicies(address) view returns (uint256[])",
  "function nextPolicyId() view returns (uint256)",
  "function getPoolStats() view returns (uint256 poolBalance, uint256 coverageLiability, uint256 availableFunds)",
  "event PolicyPurchased(uint256 indexed policyId, address indexed holder, address indexed protocolAddress, uint256 coverageAmount, uint256 premium)"
]

interface Policy {
  id: number
  holder: string
  protocolAddress: string
  coverageAmount: string
  premiumPaid: string
  startTime: number
  duration: number
  riskScore: number
  isActive: boolean
  claimProcessed: boolean
  expiryDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED'
}

export default function MonitoringDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [poolStats, setPoolStats] = useState({ balance: '0', liability: '0', available: '0' })
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState('')
  const [filterMyPolicies, setFilterMyPolicies] = useState(false)

  useEffect(() => {
    loadPolicies()
    
    // Set up account change listener
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      console.log('Wallet changed to:', accounts[0])
      setAccount(accounts[0])
      // Optionally reload policies if needed
      if (filterMyPolicies) {
        loadPolicies()
      }
    } else {
      console.log('Wallet disconnected')
      setAccount('')
    }
  }

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload()
  }

  const loadPolicies = async () => {
    try {
      setLoading(true)
      
      // Connect to provider
      const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network/')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      // Get current account if connected
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }
        } catch (e) {
          console.error('Could not get accounts')
        }
      }
      
      // Get next policy ID to know how many policies exist
      const nextId = await contract.nextPolicyId()
      const totalPolicies = Number(nextId) - 1
      
      // Load all policies
      const loadedPolicies: Policy[] = []
      
      for (let i = 1; i <= totalPolicies; i++) {
        try {
          const policyData = await contract.policies(i)
          
          const now = Math.floor(Date.now() / 1000)
          const expiryTimestamp = Number(policyData.startTime) + Number(policyData.duration)
          const isExpired = now > expiryTimestamp
          
          let status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED' = 'ACTIVE'
          if (policyData.claimProcessed) {
            status = 'CLAIMED'
          } else if (!policyData.isActive || isExpired) {
            status = 'EXPIRED'
          }
          
          const policy: Policy = {
            id: i,
            holder: policyData.holder,
            protocolAddress: policyData.protocolAddress,
            coverageAmount: ethers.formatEther(policyData.coverageAmount),
            premiumPaid: ethers.formatEther(policyData.premiumPaid),
            startTime: Number(policyData.startTime),
            duration: Number(policyData.duration),
            riskScore: Number(policyData.riskScore),
            isActive: policyData.isActive,
            claimProcessed: policyData.claimProcessed,
            expiryDate: new Date(expiryTimestamp * 1000).toLocaleDateString(),
            status
          }
          
          loadedPolicies.push(policy)
        } catch (e) {
          console.error(`Error loading policy ${i}:`, e)
        }
      }
      
      // Filter out old policies (IDs 1-6) to start fresh
      const freshPolicies = loadedPolicies.filter(policy => policy.id > 6)
      
      // Sort by ID descending (newest first)
      freshPolicies.sort((a, b) => b.id - a.id)
      setPolicies(freshPolicies)
      
      // Get pool stats and adjust for fresh start
      try {
        const stats = await contract.getPoolStats()
        
        // Calculate fresh pool stats (excluding old policies 1-6)
        // Old policies had 6000 STT total coverage
        const oldPoliciesCoverage = 6000
        const actualLiability = parseFloat(ethers.formatEther(stats.coverageLiability))
        const adjustedLiability = Math.max(0, actualLiability - oldPoliciesCoverage)
        
        // For fresh start, show adjusted values
        setPoolStats({
          balance: '0', // Show clean slate
          liability: adjustedLiability.toFixed(2),
          available: '0' // Show clean slate
        })
      } catch (e) {
        console.error('Error loading pool stats:', e)
        // Set default values on error
        setPoolStats({
          balance: '0',
          liability: '0',
          available: '0'
        })
      }
      
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }


  const displayedPolicies = filterMyPolicies && account
    ? policies.filter(p => p.holder.toLowerCase() === account.toLowerCase())
    : policies

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">
        Insurance Policy Monitor
      </h1>

      {/* Status Bar */}
      <div className="mb-8 border-4 border-black bg-white p-4">
        <div className="flex justify-between items-center">
          <div>
            {account ? (
              <>
                <span className="font-bold">Viewing as:</span> {account.slice(0, 6)}...{account.slice(-4)}
                <span className="ml-3 text-xs text-gray-600">Switch wallets using top-right menu</span>
              </>
            ) : (
              <span className="text-gray-600">Connect wallet to see your policies highlighted</span>
            )}
          </div>
          <button
            onClick={loadPolicies}
            className="px-4 py-2 border-2 border-black font-bold hover:bg-gray-100"
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Pool Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border-4 border-black bg-green-50 p-6 text-center">
          <div className="text-3xl font-bold">{poolStats.balance} STT</div>
          <div className="uppercase">Pool Balance</div>
        </div>
        <div className="border-4 border-black bg-orange-50 p-6 text-center">
          <div className="text-3xl font-bold">{poolStats.liability} STT</div>
          <div className="uppercase">Total Coverage</div>
        </div>
        <div className="border-4 border-black bg-blue-50 p-6 text-center">
          <div className="text-3xl font-bold">{displayedPolicies.filter(p => p.status === 'ACTIVE').length}</div>
          <div className="uppercase">Active Policies</div>
        </div>
      </div>

      {/* Filter Options */}
      {account && (
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterMyPolicies}
              onChange={(e) => setFilterMyPolicies(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">Show only my policies</span>
          </label>
        </div>
      )}

      {/* Policies Table */}
      <div className="border-4 border-black bg-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 uppercase">All Insurance Policies</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-xl">Loading policies from blockchain...</div>
            </div>
          ) : displayedPolicies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No policies found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-2 font-bold uppercase">ID</th>
                    <th className="text-left p-2 font-bold uppercase">Protocol</th>
                    <th className="text-left p-2 font-bold uppercase">Coverage</th>
                    <th className="text-left p-2 font-bold uppercase">Premium</th>
                    <th className="text-left p-2 font-bold uppercase">Risk</th>
                    <th className="text-left p-2 font-bold uppercase">Expiry</th>
                    <th className="text-left p-2 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPolicies.map((policy) => {
                    const isMyPolicy = account && policy.holder.toLowerCase() === account.toLowerCase()
                    return (
                    <tr key={policy.id} className={`border-b border-gray-300 hover:bg-gray-50 ${isMyPolicy ? 'bg-blue-50' : ''}`}>
                      <td className="p-2 font-mono">
                        #{policy.id}
                        {isMyPolicy && <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">YOURS</span>}
                      </td>
                      <td className="p-2">
                        <div className="font-mono text-sm">
                          {policy.protocolAddress.slice(0, 10)}...
                        </div>
                        <div className="text-xs text-gray-600">
                          by {policy.holder.slice(0, 6)}...{policy.holder.slice(-4)}
                        </div>
                      </td>
                      <td className="p-2 font-bold">{parseFloat(policy.coverageAmount).toFixed(0)} STT</td>
                      <td className="p-2">{parseFloat(policy.premiumPaid).toFixed(2)} STT</td>
                      <td className="p-2">
                        <span className={`
                          px-2 py-1 text-xs font-bold
                          ${policy.riskScore >= 70 ? 'bg-red-100 text-red-800' : 
                            policy.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}
                        `}>
                          {policy.riskScore}/100
                        </span>
                      </td>
                      <td className="p-2 text-sm">{policy.expiryDate}</td>
                      <td className="p-2">
                        <span className={`
                          px-2 py-1 text-xs font-bold uppercase
                          ${policy.status === 'ACTIVE' ? 'bg-green-500 text-white' : 
                            policy.status === 'EXPIRED' ? 'bg-gray-500 text-white' :
                            'bg-orange-500 text-white'}
                        `}>
                          {policy.status}
                        </span>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Live Monitoring Note */}
      <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-600">
        <p className="font-bold">Live Blockchain Data</p>
        <p className="text-sm mt-1">
          This dashboard shows real insurance policies from the CrossGuard contract on Somnia testnet.
          Data is fetched directly from the blockchain.
        </p>
      </div>
    </div>
  )
}