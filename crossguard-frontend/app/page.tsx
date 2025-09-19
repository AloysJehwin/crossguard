'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-12 relative z-10">
      <div className="retro-grid"></div>
      
      {/* Hero Section */}
      <section className="vintage-card mb-12">
        <h1 className="vintage-header">
          CROSSGUARD SECURITY PROTOCOL
        </h1>
        <p className="text-lg text-center mb-8 font-mono uppercase tracking-wide text-gray-700">
          AI-Powered Smart Contract Vulnerability Detection & Insurance
        </p>
        <div className="text-center">
          <button
            onClick={() => router.push('/scan')}
            className="vintage-button text-xl px-12 py-4"
          >
            SCAN YOUR PROTOCOL
          </button>
        </div>
      </section>

      {/* Stats Section - Matte Boxes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="vintage-card">
          <div className="text-4xl font-bold mb-2">$730M+</div>
          <div className="text-sm uppercase tracking-wide text-gray-600">Saved from Vulnerabilities</div>
        </div>
        <div className="vintage-card">
          <div className="text-4xl font-bold mb-2">149+</div>
          <div className="text-sm uppercase tracking-wide text-gray-600">Attack Patterns Detected</div>
        </div>
        <div className="vintage-card">
          <div className="text-4xl font-bold mb-2">10+</div>
          <div className="text-sm uppercase tracking-wide text-gray-600">Chains Supported</div>
        </div>
      </section>

      {/* How It Works - Matte Steps */}
      <section className="vintage-card">
        <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-wide">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border-2 border-black p-6 bg-gray-50">
            <div className="text-5xl font-bold mb-4 text-center">1</div>
            <h3 className="text-lg font-bold mb-2 uppercase">Submit Contract</h3>
            <p className="font-mono text-sm">Enter your smart contract address for analysis</p>
          </div>
          
          {/* Step 2 */}
          <div className="border-2 border-black p-6 bg-gray-50">
            <div className="text-5xl font-bold mb-4 text-center">2</div>
            <h3 className="text-lg font-bold mb-2 uppercase">AI Analysis</h3>
            <p className="font-mono text-sm">Scans 149+ vulnerability patterns in 30 seconds</p>
          </div>
          
          {/* Step 3 */}
          <div className="border-2 border-black p-6 bg-gray-50">
            <div className="text-5xl font-bold mb-4 text-center">3</div>
            <h3 className="text-lg font-bold mb-2 uppercase">Get Coverage</h3>
            <p className="font-mono text-sm">Receive risk score & purchase insurance on Somnia</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="vintage-card">
          <h3 className="text-xl font-bold mb-4 uppercase">Real-Time Detection</h3>
          <ul className="space-y-2 font-mono text-sm">
            <li>• REENTRANCY ATTACKS</li>
            <li>• ORACLE MANIPULATION</li>
            <li>• FLASH LOAN EXPLOITS</li>
            <li>• ACCESS CONTROL ISSUES</li>
            <li>• INTEGER OVERFLOWS</li>
          </ul>
        </div>
        
        <div className="vintage-card">
          <h3 className="text-xl font-bold mb-4 uppercase">Insurance Coverage</h3>
          <ul className="space-y-2 font-mono text-sm">
            <li>• RISK-BASED PRICING</li>
            <li>• SOMNIA TESTNET DEPLOYMENT</li>
            <li>• INSTANT CLAIMS PROCESSING</li>
            <li>• UP TO $10M COVERAGE</li>
            <li>• 24/7 MONITORING</li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center mt-16 p-12 border-3 border-black bg-black text-white">
        <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">
          Protect Your Protocol Today
        </h2>
        <p className="text-lg mb-8 font-mono">
          Join 1000+ protocols secured by CrossGuard
        </p>
        <button
          onClick={() => router.push('/scan')}
          className="bg-white text-black px-12 py-4 font-bold uppercase tracking-wider hover:bg-gray-200 transition-all border-2 border-white"
        >
          START FREE SCAN
        </button>
      </section>
    </div>
  )
}