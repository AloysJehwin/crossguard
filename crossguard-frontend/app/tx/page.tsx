'use client'

import TransactionChecker from '../components/TransactionChecker'

export default function TransactionPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Transaction Explorer</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-600">
        <h2 className="font-bold text-lg mb-2">Check Your Transaction</h2>
        <p>This tool fetches transaction data directly from the Somnia RPC endpoint.</p>
        <p className="mt-2">Your transaction: <code className="font-mono text-sm">0x494984156eccd3630fe175ee9ae2f4e13315b9d05f22ca1ac38fbde5a54bacf9</code></p>
      </div>
      
      <TransactionChecker />
      
      <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-400">
        <h3 className="font-bold mb-2">About Somnia Explorer:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>The Somnia testnet explorer might be slow or temporarily unavailable</li>
          <li>Transactions can take a few seconds to be indexed</li>
          <li>This tool fetches data directly from the RPC, bypassing the explorer</li>
          <li>If the transaction shows as successful here, it was processed correctly</li>
        </ul>
      </div>
    </main>
  )
}