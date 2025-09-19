'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

export default function TransactionChecker() {
  const [txHash, setTxHash] = useState('0x494984156eccd3630fe175ee9ae2f4e13315b9d05f22ca1ac38fbde5a54bacf9')
  const [txData, setTxData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkTransaction = async () => {
    setLoading(true)
    setError('')
    setTxData(null)

    try {
      // Connect to Somnia RPC directly
      const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network/')
      
      console.log('Fetching transaction:', txHash)
      
      // Get transaction details
      const tx = await provider.getTransaction(txHash)
      
      if (!tx) {
        setError('Transaction not found. It might still be pending or the hash is incorrect.')
        return
      }
      
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash)
      
      const data = {
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasLimit: tx.gasLimit?.toString(),
          gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') + ' gwei' : 'N/A',
          nonce: tx.nonce,
          data: tx.data?.slice(0, 66) + '...' // Truncate data
        },
        receipt: receipt ? {
          status: receipt.status === 1 ? '✅ Success' : '❌ Failed',
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          gasUsed: receipt.gasUsed?.toString(),
          effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') + ' gwei' : 'N/A',
          logs: receipt.logs.length + ' event(s)',
          contractAddress: receipt.contractAddress || 'N/A'
        } : null
      }
      
      setTxData(data)
      
      // Try to decode if it's an insurance purchase
      if (tx.to === '0x03acf2A8D1AA62d24B54B46041B75b0e3ceC02aC') {
        try {
          const iface = new ethers.Interface([
            "function purchaseInsurance(address,uint256,uint256,uint256) payable returns (uint256)"
          ])
          const decoded = iface.parseTransaction({ data: tx.data })
          if (decoded) {
            data.decoded = {
              function: decoded.name,
              protocol: decoded.args[0],
              coverage: ethers.formatEther(decoded.args[1]) + ' STT',
              duration: (Number(decoded.args[2]) / 86400) + ' days',
              riskScore: decoded.args[3].toString()
            }
          }
        } catch (e) {
          console.log('Could not decode as insurance purchase')
        }
      }
      
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Failed to fetch transaction')
    } finally {
      setLoading(false)
    }
  }

  const explorerUrls = [
    { name: 'Somnia Explorer', url: `https://shannon-explorer.somnia.network/tx/${txHash}` },
    { name: 'Alternative Explorer', url: `https://shannon-explorer.somnia.network/tx/${txHash}` },
    { name: 'Somnia Explorer', url: `https://explorer.somnia.network/tx/${txHash}` }
  ]

  return (
    <div className="border-4 border-black bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Checker</h2>
      
      <div className="mb-4">
        <label className="block font-bold mb-2">Transaction Hash:</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          className="w-full p-2 border-2 border-black font-mono text-xs"
          placeholder="0x..."
        />
      </div>
      
      <button
        onClick={checkTransaction}
        disabled={loading}
        className="mb-4 px-6 py-2 bg-black text-white font-bold disabled:bg-gray-500"
      >
        {loading ? 'Checking...' : 'Check Transaction'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-600">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {txData && (
        <div className="mb-4 space-y-4">
          <div className="p-4 bg-gray-50 border-2 border-gray-400">
            <h3 className="font-bold mb-2">Transaction Details:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>From:</strong> {txData.transaction.from}</p>
              <p><strong>To:</strong> {txData.transaction.to}</p>
              <p><strong>Value:</strong> {txData.transaction.value} STT</p>
              <p><strong>Gas Limit:</strong> {txData.transaction.gasLimit}</p>
              <p><strong>Gas Price:</strong> {txData.transaction.gasPrice}</p>
              <p><strong>Nonce:</strong> {txData.transaction.nonce}</p>
            </div>
          </div>
          
          {txData.receipt && (
            <div className="p-4 bg-green-50 border-2 border-green-600">
              <h3 className="font-bold mb-2">Receipt:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Status:</strong> {txData.receipt.status}</p>
                <p><strong>Block:</strong> {txData.receipt.blockNumber}</p>
                <p><strong>Gas Used:</strong> {txData.receipt.gasUsed}</p>
                <p><strong>Events:</strong> {txData.receipt.logs}</p>
              </div>
            </div>
          )}
          
          {txData.decoded && (
            <div className="p-4 bg-blue-50 border-2 border-blue-600">
              <h3 className="font-bold mb-2">Insurance Purchase Details:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Function:</strong> {txData.decoded.function}</p>
                <p><strong>Protocol:</strong> {txData.decoded.protocol}</p>
                <p><strong>Coverage:</strong> {txData.decoded.coverage}</p>
                <p><strong>Duration:</strong> {txData.decoded.duration}</p>
                <p><strong>Risk Score:</strong> {txData.decoded.riskScore}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-600">
        <h3 className="font-bold mb-2">Explorer Links:</h3>
        <div className="space-y-2">
          {explorerUrls.map((explorer, i) => (
            <div key={i}>
              <a 
                href={explorer.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                {explorer.name} →
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs mt-2 text-gray-600">
          If links don't work, the explorer might be down or use a different format
        </p>
      </div>
    </div>
  )
}