'use client'

import { useState, useEffect } from 'react'

interface ContractSelectorProps {
  onSelectContract: (address: string) => void
  selectedNetwork: string
}

export default function SimpleContractSelector({ onSelectContract, selectedNetwork }: ContractSelectorProps) {
  const [selectedContract, setSelectedContract] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setUserAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to check connection:', error)
      }
    }
  }

  const handleSelectContract = (address: string) => {
    setSelectedContract(address)
    onSelectContract(address)
  }

  const handleManualSubmit = () => {
    if (manualAddress && manualAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      handleSelectContract(manualAddress)
      setShowManualInput(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="vintage-card">
        <h3 className="text-xl font-bold mb-4 uppercase">Connect Wallet First</h3>
        <p className="font-mono">Please connect your wallet to scan contracts</p>
      </div>
    )
  }

  return (
    <div className="vintage-card">
      <h3 className="text-xl font-bold mb-4 uppercase">Contract Address</h3>
      
      {/* User Address Display */}
      <div className="mb-4 p-3 bg-gray-100 border-2 border-black font-mono text-sm">
        <span className="font-bold">WALLET: </span>
        {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
      </div>

      {/* Manual Input Toggle */}
      <button
        onClick={() => setShowManualInput(!showManualInput)}
        className="vintage-button w-full"
      >
        {showManualInput ? 'HIDE MANUAL INPUT' : 'ENTER CONTRACT MANUALLY'}
      </button>

      {/* Manual Input */}
      {showManualInput && (
        <div className="mt-4">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="0x..."
            className="vintage-input mb-3"
          />
          <button
            onClick={handleManualSubmit}
            className="vintage-button w-full"
          >
            USE THIS CONTRACT
          </button>
        </div>
      )}

      {/* Selected Contract Display */}
      {selectedContract && (
        <div className="mt-4 p-3 bg-green-50 border-2 border-green-600">
          <span className="text-green-600 font-bold">SELECTED: </span>
          <span className="font-mono text-sm">{selectedContract}</span>
        </div>
      )}
    </div>
  )
}