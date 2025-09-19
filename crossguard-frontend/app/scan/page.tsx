'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import VulnerabilityScanner from '../components/VulnerabilityScanner'
import RiskScoreDisplay from '../components/RiskScoreDisplay'
import VulnerabilityTable from '../components/VulnerabilityTable'

// Dynamically import SimpleContractSelector to avoid SSR issues
const ContractSelector = dynamic(() => import('../components/SimpleContractSelector'), {
  ssr: false,
  loading: () => <div className="border-4 border-black bg-gray-50 p-6 animate-pulse">Loading wallet contracts...</div>
})

export default function ScannerDashboard() {
  const [scanResults, setScanResults] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedContractAddress, setSelectedContractAddress] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">
        Contract Security Scanner
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Selector */}
        <ContractSelector 
          onSelectContract={setSelectedContractAddress}
          selectedNetwork={selectedNetwork}
        />

        {/* Scanner Input Section */}
        <VulnerabilityScanner 
          onScanComplete={setScanResults}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          prefilledAddress={selectedContractAddress}
        />
      </div>

      {/* Results Display */}
      {scanResults && (
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Risk Score */}
            <div className="lg:col-span-1">
              <RiskScoreDisplay score={scanResults.overall_risk_score} />
            </div>

            {/* Vulnerability Details */}
            <div className="lg:col-span-2">
              <VulnerabilityTable vulnerabilities={scanResults.vulnerabilities} />
            </div>
          </div>

          {/* Recommendations */}
          {scanResults.recommendations && (
            <div className="mt-8 border-4 border-black bg-white p-8">
              <h3 className="text-2xl font-bold mb-4 uppercase">Security Recommendations</h3>
              <ul className="space-y-2 font-mono">
                {scanResults.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-3 text-xl">▶</span>
                    <span>{rec.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.location.href = `/insurance?address=${scanResults.contract_address}&score=${scanResults.overall_risk_score}`}
                className="vintage-button mt-6"
              >
                GET INSURANCE QUOTE
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}