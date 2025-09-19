import { NextRequest, NextResponse } from 'next/server'
import { scanContract, NETWORK_CONFIG } from './scanner'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contract_address, network } = body

    if (!contract_address) {
      return NextResponse.json(
        { error: 'Contract address is required' },
        { status: 400 }
      )
    }

    // Validate network
    const validNetwork = network && network in NETWORK_CONFIG ? network : 'ethereum'

    // Use integrated scanner instead of Python backend
    const scanResult = await scanContract(contract_address, validNetwork)

    // Add insurance-specific data
    const enhancedResponse = {
      ...scanResult,
      insurance_eligible: scanResult.overall_risk_score < 80,
      suggested_coverage: calculateSuggestedCoverage(scanResult.overall_risk_score),
      premium_estimate: calculatePremiumEstimate(scanResult.overall_risk_score)
    }

    return NextResponse.json(enhancedResponse)
  } catch (error: any) {
    console.error('Scan error:', error)
    
    // Check if it's a validation error
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to scan contract: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return list of supported networks
  const networks = Object.entries(NETWORK_CONFIG).map(([key, config]) => ({
    network: key,
    name: config.explorer_name,
    chain_id: config.chain_id,
    explorer_url: config.explorer_url,
    api_configured: !!config.api_key
  }))

  return NextResponse.json({ networks })
}

function calculateSuggestedCoverage(riskScore: number): number {
  if (riskScore < 30) return 100000
  if (riskScore < 50) return 50000
  if (riskScore < 70) return 25000
  return 10000
}

function calculatePremiumEstimate(riskScore: number): number {
  const basePremium = 0.025 // 2.5%
  const riskAdjustment = (riskScore / 100) * 0.08
  return basePremium + riskAdjustment
}

function getMockScanResults(request: any): any {
  return {
    contract_address: request.contract_address || '0x0000000000000000000000000000000000000000',
    network: request.network || 'ethereum',
    overall_risk_score: 45,
    risk_level: 'MEDIUM',
    vulnerabilities: {
      reentrancy: {
        probability: 0.65,
        risk_level: 'HIGH',
        description: 'External calls detected before state changes',
        evidence: ['Found 3 instances of .call()', 'State modifications after external calls']
      },
      oracle_manipulation: {
        probability: 0.35,
        risk_level: 'MEDIUM',
        description: 'Single oracle dependency found',
        evidence: ['Uses Chainlink price feed', 'No TWAP implementation']
      }
    },
    scan_time_seconds: 2.5,
    recommendations: [
      'Implement reentrancy guards',
      'Use multiple price oracles',
      'Add time-weighted average pricing',
      'Implement circuit breakers'
    ],
    contract_info: {
      name: 'Mock Contract',
      verified: true,
      chain_id: 1
    },
    insurance_eligible: true,
    suggested_coverage: 50000,
    premium_estimate: 0.045
  }
}