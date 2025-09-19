'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import insurance component for Somnia testnet
const InsurancePurchase = dynamic(() => import('../components/InsurancePurchase'), {
  ssr: false,
  loading: () => <div className="border-4 border-black bg-gray-50 p-6 animate-pulse">Loading insurance module...</div>
})

const PolicyDashboard = dynamic(() => import('../components/PolicyDashboard'), {
  ssr: false,
  loading: () => <div className="border-4 border-black bg-gray-50 p-6 animate-pulse">Loading policies...</div>
})

export default function InsurancePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">
        Smart Contract Insurance Protocol
      </h1>

      {/* Info Banner */}
      <div className="mb-8 border-4 border-black bg-yellow-50 p-6">
        <h2 className="text-2xl font-bold mb-4 uppercase">Somnia Devnet Insurance</h2>
        <p className="font-mono mb-4">
          Protect your smart contracts with on-chain insurance powered by AI vulnerability detection.
        </p>
        <ul className="space-y-2 font-mono text-sm">
          <li>✓ Coverage up to 10,000,000 STT</li>
          <li>✓ Risk-based premium pricing (2.5% - 10.5% annually)</li>
          <li>✓ Instant claim processing</li>
          <li>✓ 24/7 vulnerability monitoring</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Insurance Purchase - Somnia Testnet */}
        <Suspense fallback={<div>Loading...</div>}>
          <InsurancePurchase />
        </Suspense>

        {/* Policy Dashboard */}
        <Suspense fallback={<div>Loading...</div>}>
          <PolicyDashboard />
        </Suspense>
      </div>

      {/* Insurance Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="border-4 border-black bg-white p-8">
          <h3 className="text-xl font-bold mb-4 uppercase">Coverage Types</h3>
          <ul className="space-y-2 font-mono text-sm">
            <li>✓ REENTRANCY</li>
            <li>✓ ORACLE ATTACKS</li>
            <li>✓ FLASH LOANS</li>
            <li>✓ ACCESS CONTROL</li>
            <li>✓ OVERFLOW/UNDERFLOW</li>
          </ul>
        </div>

        <div className="border-4 border-black bg-white p-8">
          <h3 className="text-xl font-bold mb-4 uppercase">Claim Process</h3>
          <ol className="space-y-2 font-mono text-sm">
            <li>1. DETECT EXPLOIT</li>
            <li>2. SUBMIT CLAIM</li>
            <li>3. AI VERIFICATION</li>
            <li>4. INSTANT PAYOUT</li>
            <li>5. POST-MORTEM</li>
          </ol>
        </div>

        <div className="border-4 border-black bg-white p-8">
          <h3 className="text-xl font-bold mb-4 uppercase">Risk Levels</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border border-black"></div>
              <span className="font-mono text-sm">LOW (0-25)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 border border-black"></div>
              <span className="font-mono text-sm">MEDIUM (26-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 border border-black"></div>
              <span className="font-mono text-sm">HIGH (51-75)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-black"></div>
              <span className="font-mono text-sm">CRITICAL (76+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12 border-4 border-black bg-white p-8">
        <h2 className="text-2xl font-bold mb-6 uppercase text-center">How Insurance Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border-2 border-black">
            <div className="text-3xl font-bold mb-2">1</div>
            <div className="font-bold uppercase mb-2">Scan</div>
            <p className="text-sm font-mono">Analyze contract vulnerabilities</p>
          </div>
          <div className="text-center p-4 border-2 border-black">
            <div className="text-3xl font-bold mb-2">2</div>
            <div className="font-bold uppercase mb-2">Quote</div>
            <p className="text-sm font-mono">Get risk-based premium</p>
          </div>
          <div className="text-center p-4 border-2 border-black">
            <div className="text-3xl font-bold mb-2">3</div>
            <div className="font-bold uppercase mb-2">Purchase</div>
            <p className="text-sm font-mono">Buy coverage with STT</p>
          </div>
          <div className="text-center p-4 border-2 border-black">
            <div className="text-3xl font-bold mb-2">4</div>
            <div className="font-bold uppercase mb-2">Protected</div>
            <p className="text-sm font-mono">24/7 monitoring active</p>
          </div>
        </div>
      </div>
    </div>
  )
}