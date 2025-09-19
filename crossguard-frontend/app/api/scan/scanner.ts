// Vulnerability Scanner Engine - TypeScript Implementation
// Migrated from Python backend for integrated scanning

export interface VulnerabilityDetail {
  probability: number
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  evidence: string[]
}

export interface ScanResult {
  contract_address: string
  network: string
  overall_risk_score: number
  risk_level: string
  vulnerabilities: Record<string, VulnerabilityDetail>
  scan_time_seconds: number
  recommendations: string[]
  contract_info: {
    name?: string
    verified?: boolean
    compiler?: string
    optimization?: string
    chain_id?: number
    explorer_url?: string
    transaction_count?: number
    failure_rate?: string
  }
}

// Network configurations
export const NETWORK_CONFIG = {
  ethereum: {
    api_url: 'https://api.etherscan.io/api',
    api_key: process.env.ETHERSCAN_API_KEY || 'U4VFY3Y5HW7CP3URJVZYY84KJ5WFHH641K',
    explorer_name: 'Etherscan',
    explorer_url: 'https://etherscan.io',
    chain_id: 1
  },
  bsc: {
    api_url: 'https://api.bscscan.com/api',
    api_key: process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY,
    explorer_name: 'BscScan',
    explorer_url: 'https://bscscan.com',
    chain_id: 56
  },
  polygon: {
    api_url: 'https://api.polygonscan.com/api',
    api_key: process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY,
    explorer_name: 'PolygonScan',
    explorer_url: 'https://polygonscan.com',
    chain_id: 137
  },
  avalanche: {
    api_url: 'https://api.snowtrace.io/api',
    api_key: process.env.SNOWTRACE_API_KEY || process.env.ETHERSCAN_API_KEY,
    explorer_name: 'SnowTrace',
    explorer_url: 'https://snowtrace.io',
    chain_id: 43114
  },
  arbitrum: {
    api_url: 'https://api.arbiscan.io/api',
    api_key: process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY,
    explorer_name: 'Arbiscan',
    explorer_url: 'https://arbiscan.io',
    chain_id: 42161
  },
  optimism: {
    api_url: 'https://api-optimistic.etherscan.io/api',
    api_key: process.env.OPTIMISM_API_KEY || process.env.ETHERSCAN_API_KEY,
    explorer_name: 'Optimistic Etherscan',
    explorer_url: 'https://optimistic.etherscan.io',
    chain_id: 10
  },
  somnia: {
    api_url: 'https://shannon-explorer.somnia.network/api',
    api_key: process.env.SOMNIA_API_KEY || 'dummy',
    explorer_name: 'Somnia Shannon Explorer',
    explorer_url: 'https://shannon-explorer.somnia.network',
    chain_id: 50312,
    rpc_url: 'https://dream-rpc.somnia.network/'
  }
} as const

// Vulnerability patterns
const VULNERABILITY_PATTERNS = {
  reentrancy: {
    patterns: [
      /\.call\{value:/gi,
      /\.call\.value\(/gi,
      /\.send\(/gi,
      /\.transfer\(/gi,
      /address\(.*?\)\.call/gi,
      /payable\(.*?\)\.call/gi
    ],
    state_change_patterns: [
      /balances\[.*?\]\s*=/gi,
      /balances\[.*?\]\s*-=/gi,
      /balances\[.*?\]\s*\+=/gi,
      /state\s*=/gi,
      /storage\[.*?\]\s*=/gi
    ],
    guards: [
      /nonReentrant/gi,
      /ReentrancyGuard/gi,
      /mutex/gi,
      /locked/gi
    ]
  },
  oracle_manipulation: {
    patterns: [
      /getPrice\(\)/gi,
      /latestAnswer\(\)/gi,
      /latestRoundData\(\)/gi,
      /consult\(/gi,
      /quote\(/gi,
      /getAmountOut/gi,
      /getReserves\(\)/gi,
      /price0CumulativeLast/gi,
      /UniswapV2/gi,
      /UniswapV3/gi,
      /PancakeSwap/gi,
      /QuickSwap/gi,
      /TraderJoe/gi,
      /SushiSwap/gi
    ],
    protections: [
      /TWAP/gi,
      /timeWeighted/gi,
      /priceFeed/gi,
      /Chainlink/gi,
      /multiple.*oracle/gi,
      /oracle.*aggregat/gi
    ]
  },
  flash_loan: {
    patterns: [
      /flashLoan/gi,
      /flashBorrow/gi,
      /flashMint/gi,
      /maxFlashLoan/gi,
      /flashFee/gi,
      /onFlashLoan/gi,
      /IERC3156/gi,
      /executeOperation/gi,
      /AAVE.*Flash/gi,
      /dYdX.*Flash/gi
    ],
    protections: [
      /flashLoanGuard/gi,
      /noFlashLoan/gi,
      /requireNoFlashLoan/gi
    ]
  },
  access_control: {
    patterns: [
      /onlyOwner/gi,
      /onlyAdmin/gi,
      /onlyRole/gi,
      /require\(.*msg\.sender.*==.*owner/gi,
      /require\(.*owner.*==.*msg\.sender/gi,
      /modifier\s+only/gi,
      /AccessControl/gi,
      /Ownable/gi
    ],
    vulnerable_functions: [
      /function\s+(mint|burn|pause|unpause|upgrade|destroy|kill|setOwner|transferOwnership|withdraw|emergency)/gi,
      /selfdestruct\(/gi,
      /delegatecall\(/gi,
      /suicide\(/gi
    ]
  },
  integer_overflow: {
    patterns: [
      /\+\+/g,
      /\-\-/g,
      /\+=/g,
      /\-=/g,
      /\*=/g,
      /\/=/g,
      /\*\*/g
    ],
    protections: [
      /SafeMath/gi,
      /using.*SafeMath/gi,
      /checked/gi,
      /pragma solidity.*0\.8/gi,
      /unchecked\s*\{/gi
    ]
  },
  unchecked_return: {
    patterns: [
      /\.call\(/gi,
      /\.send\(/gi,
      /\.transfer\(/gi,
      /\.delegatecall\(/gi,
      /\.staticcall\(/gi
    ],
    checks: [
      /require\(/gi,
      /assert\(/gi,
      /if\s*\(/gi,
      /bool\s+success/gi
    ]
  }
}

// Network-specific DEX patterns
const NETWORK_DEX_PATTERNS: Record<string, string[]> = {
  bsc: ['PancakeSwap', 'BakerySwap', 'BiSwap'],
  polygon: ['QuickSwap', 'SushiSwap', 'Balancer'],
  avalanche: ['TraderJoe', 'Pangolin', 'SushiSwap'],
  arbitrum: ['SushiSwap', 'Uniswap', 'GMX'],
  optimism: ['Velodrome', 'Uniswap', 'SushiSwap'],
  fantom: ['SpookySwap', 'SpiritSwap', 'Beethoven'],
  cronos: ['VVS Finance', 'MMFinance', 'CronaSwap'],
  base: ['BaseSwap', 'Uniswap', 'SushiSwap'],
  somnia: ['SomniaSwap', 'DreamDEX', 'Uniswap']
}

// Fetch contract source code from explorer
export async function fetchContractCode(address: string, network: string) {
  const config = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
  if (!config) throw new Error(`Unsupported network: ${network}`)

  const params = new URLSearchParams({
    module: 'contract',
    action: 'getsourcecode',
    address: address,
    apikey: config.api_key
  })

  try {
    const response = await fetch(`${config.api_url}?${params}`)
    const data = await response.json()

    if (data.status === '1' && data.result && data.result[0]) {
      const contract = data.result[0]
      return {
        source_code: contract.SourceCode || '',
        contract_name: contract.ContractName || 'Unknown',
        compiler_version: contract.CompilerVersion || 'Unknown',
        optimization: contract.OptimizationUsed || 'Unknown',
        abi: contract.ABI || '',
        verified: !!contract.SourceCode,
        network: network,
        explorer_url: `${config.explorer_url}/address/${address}`
      }
    }
  } catch (error) {
    console.error(`Error fetching from ${config.explorer_name}:`, error)
  }

  return null
}

// Fetch transaction statistics
export async function fetchTransactionStats(address: string, network: string) {
  const config = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
  if (!config) return {}

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '100',
    sort: 'desc',
    apikey: config.api_key
  })

  try {
    const response = await fetch(`${config.api_url}?${params}`)
    const data = await response.json()

    if (data.status === '1' && data.result) {
      const transactions = data.result
      const failed_txs = transactions.filter((tx: any) => tx.isError === '1')
      const total_txs = transactions.length
      const failure_rate = total_txs > 0 ? failed_txs.length / total_txs : 0

      return {
        total_transactions: total_txs,
        failed_transactions: failed_txs.length,
        failure_rate: failure_rate,
        recent_activity: transactions.slice(0, 10)
      }
    }
  } catch (error) {
    console.error(`Error fetching transactions:`, error)
  }

  return {}
}

// Analyze source code for vulnerabilities
export function analyzeSourceCode(sourceCode: string, network: string): { 
  vulnerabilities: Record<string, VulnerabilityDetail>, 
  recommendations: string[] 
} {
  const vulnerabilities: Record<string, VulnerabilityDetail> = {}
  const recommendations = new Set<string>()

  if (!sourceCode) {
    return { 
      vulnerabilities: {
        unverified_contract: {
          probability: 1.0,
          risk_level: 'MEDIUM',
          description: 'Contract source code not verified on explorer',
          evidence: ['Cannot analyze without source code']
        }
      }, 
      recommendations: ['Verify contract on blockchain explorer'] 
    }
  }

  // Clean source code if it's in JSON format
  if (sourceCode.startsWith('{')) {
    try {
      const parsed = JSON.parse(sourceCode)
      if (parsed.sources) {
        sourceCode = Object.values(parsed.sources)
          .map((src: any) => src.content || '')
          .join('\n')
      }
    } catch {}
  }

  // 1. Reentrancy Detection
  let reentrancyScore = 0
  const reentrancyEvidence: string[] = []

  for (const pattern of VULNERABILITY_PATTERNS.reentrancy.patterns) {
    const matches = sourceCode.match(pattern)
    if (matches) {
      reentrancyScore += matches.length * 0.15
      reentrancyEvidence.push(`Found ${matches.length} instances of: ${pattern.source.slice(0, 20)}...`)
    }
  }

  for (const pattern of VULNERABILITY_PATTERNS.reentrancy.state_change_patterns) {
    if (pattern.test(sourceCode)) {
      reentrancyScore += 0.2
      reentrancyEvidence.push(`State change detected: ${pattern.source.slice(0, 20)}...`)
    }
  }

  let hasReentrancyGuard = false
  for (const guard of VULNERABILITY_PATTERNS.reentrancy.guards) {
    if (guard.test(sourceCode)) {
      hasReentrancyGuard = true
      reentrancyScore *= 0.3
      break
    }
  }

  if (reentrancyScore > 0.1) {
    vulnerabilities.reentrancy = {
      probability: Math.min(0.95, reentrancyScore),
      risk_level: reentrancyScore > 0.7 ? 'CRITICAL' : reentrancyScore > 0.4 ? 'HIGH' : 'MEDIUM',
      description: `Contract on ${network} contains external calls vulnerable to reentrancy`,
      evidence: reentrancyEvidence.slice(0, 3)
    }
    if (!hasReentrancyGuard) {
      recommendations.add('Implement reentrancy guards (ReentrancyGuard)')
      recommendations.add('Follow checks-effects-interactions pattern')
    }
  }

  // 2. Oracle Manipulation Detection
  let oracleScore = 0
  const oracleEvidence: string[] = []

  for (const pattern of VULNERABILITY_PATTERNS.oracle_manipulation.patterns) {
    const matches = sourceCode.match(pattern)
    if (matches) {
      oracleScore += matches.length * 0.2
      oracleEvidence.push(`Oracle function found: ${pattern.source.slice(0, 20)}...`)
    }
  }

  // Check for network-specific DEXs
  const networkDexes = NETWORK_DEX_PATTERNS[network]
  if (networkDexes) {
    for (const dex of networkDexes) {
      if (new RegExp(dex, 'gi').test(sourceCode)) {
        oracleScore += 0.15
        oracleEvidence.push(`${dex} integration detected on ${network}`)
      }
    }
  }

  let hasOracleProtection = false
  for (const protection of VULNERABILITY_PATTERNS.oracle_manipulation.protections) {
    if (protection.test(sourceCode)) {
      hasOracleProtection = true
      oracleScore *= 0.4
      break
    }
  }

  if (oracleScore > 0.1) {
    vulnerabilities.oracle_manipulation = {
      probability: Math.min(0.9, oracleScore),
      risk_level: oracleScore > 0.6 ? 'HIGH' : oracleScore > 0.3 ? 'MEDIUM' : 'LOW',
      description: `Price oracle vulnerability on ${network} network`,
      evidence: oracleEvidence.slice(0, 3)
    }
    if (!hasOracleProtection) {
      recommendations.add(`Use Chainlink oracles available on ${network}`)
      recommendations.add('Implement TWAP (Time-Weighted Average Price)')
    }
  }

  // 3. Flash Loan Vulnerability
  let flashLoanScore = 0
  const flashLoanEvidence: string[] = []

  for (const pattern of VULNERABILITY_PATTERNS.flash_loan.patterns) {
    if (pattern.test(sourceCode)) {
      flashLoanScore += 0.3
      flashLoanEvidence.push(`Flash loan pattern: ${pattern.source}`)
    }
  }

  if (/borrow|lend|loan|collateral|liquidat/gi.test(sourceCode)) {
    flashLoanScore += 0.2
    flashLoanEvidence.push('Lending/borrowing functionality')
  }

  if (flashLoanScore > 0.2) {
    vulnerabilities.flash_loan = {
      probability: Math.min(0.85, flashLoanScore),
      risk_level: flashLoanScore > 0.5 ? 'HIGH' : 'MEDIUM',
      description: `Flash loan vulnerability on ${network}`,
      evidence: flashLoanEvidence.slice(0, 3)
    }
    recommendations.add('Add flash loan protection')
    recommendations.add('Implement proper collateralization checks')
  }

  // 4. Access Control Issues
  let accessScore = 0
  const accessEvidence: string[] = []

  const accessModifiers = sourceCode.match(/modifier\s+(\w+)/gi) || []
  const hasAccessControl = accessModifiers.some(mod => mod.toLowerCase().includes('only'))

  for (const pattern of VULNERABILITY_PATTERNS.access_control.vulnerable_functions) {
    const matches = sourceCode.match(pattern)
    if (matches) {
      accessScore += matches.length * 0.25
      accessEvidence.push(`Sensitive function: ${matches[0].slice(0, 30)}...`)
    }
  }

  if (!hasAccessControl && accessScore > 0) {
    accessScore *= 1.5
    accessEvidence.push('No access control modifiers')
  }

  if (accessScore > 0.2) {
    vulnerabilities.access_control = {
      probability: Math.min(0.9, accessScore),
      risk_level: accessScore > 0.7 ? 'CRITICAL' : accessScore > 0.4 ? 'HIGH' : 'MEDIUM',
      description: 'Missing or inadequate access control',
      evidence: accessEvidence.slice(0, 3)
    }
    recommendations.add('Implement proper access control')
    recommendations.add("Use OpenZeppelin's AccessControl")
  }

  // 5. Integer Overflow/Underflow
  let overflowScore = 0
  const overflowEvidence: string[] = []

  const versionMatch = sourceCode.match(/pragma solidity\s+[\^~]?(0\.(\d+))/i)
  if (versionMatch) {
    const minorVersion = parseInt(versionMatch[2])
    if (minorVersion < 8) {
      overflowScore += 0.3
      overflowEvidence.push(`Solidity < 0.8 (version 0.${minorVersion})`)
    }
  }

  for (const pattern of VULNERABILITY_PATTERNS.integer_overflow.patterns) {
    const matches = sourceCode.match(pattern)
    if (matches) {
      overflowScore += matches.length * 0.05
    }
  }

  const hasSafeMath = VULNERABILITY_PATTERNS.integer_overflow.protections.some(pattern => 
    pattern.test(sourceCode)
  )
  if (hasSafeMath) {
    overflowScore *= 0.2
    overflowEvidence.push('SafeMath protection detected')
  }

  if (overflowScore > 0.15) {
    vulnerabilities.integer_overflow = {
      probability: Math.min(0.8, overflowScore),
      risk_level: overflowScore > 0.5 ? 'HIGH' : overflowScore > 0.3 ? 'MEDIUM' : 'LOW',
      description: 'Potential integer overflow/underflow',
      evidence: overflowEvidence.slice(0, 3)
    }
    if (!hasSafeMath) {
      recommendations.add('Upgrade to Solidity 0.8+ or use SafeMath')
    }
  }

  // 6. Unchecked Return Values
  let uncheckedScore = 0
  const uncheckedEvidence: string[] = []

  for (const pattern of VULNERABILITY_PATTERNS.unchecked_return.patterns) {
    const matches = sourceCode.match(pattern)
    if (matches) {
      matches.slice(0, 5).forEach(() => {
        const hasCheck = VULNERABILITY_PATTERNS.unchecked_return.checks.some(check =>
          check.test(sourceCode)
        )
        if (!hasCheck) {
          uncheckedScore += 0.2
          uncheckedEvidence.push(`Unchecked call: ${pattern.source.slice(0, 20)}...`)
        }
      })
    }
  }

  if (uncheckedScore > 0.2) {
    vulnerabilities.unchecked_return = {
      probability: Math.min(0.7, uncheckedScore),
      risk_level: uncheckedScore > 0.4 ? 'MEDIUM' : 'LOW',
      description: 'External calls without return value checking',
      evidence: uncheckedEvidence.slice(0, 3)
    }
    recommendations.add('Check return values from external calls')
    recommendations.add('Use require() to validate call success')
  }

  return {
    vulnerabilities,
    recommendations: Array.from(recommendations).slice(0, 5)
  }
}

// Calculate overall risk score
export function calculateRiskScore(
  vulnerabilities: Record<string, VulnerabilityDetail>,
  txStats: any
): { score: number, level: string } {
  if (Object.keys(vulnerabilities).length === 0) {
    return { score: 10, level: 'LOW' }
  }

  const weights = {
    reentrancy: 0.25,
    oracle_manipulation: 0.20,
    flash_loan: 0.20,
    access_control: 0.15,
    integer_overflow: 0.10,
    unchecked_return: 0.10
  }

  let totalScore = 0
  for (const [vulnType, details] of Object.entries(vulnerabilities)) {
    const weight = weights[vulnType as keyof typeof weights] || 0.1
    totalScore += details.probability * weight * 100
  }

  // Add penalty for failed transactions
  if (txStats && txStats.failure_rate > 0.1) {
    totalScore += 10
  }

  const score = Math.min(100, Math.round(totalScore))
  
  let level: string
  if (score >= 76) level = 'CRITICAL'
  else if (score >= 51) level = 'HIGH'
  else if (score >= 26) level = 'MEDIUM'
  else level = 'LOW'

  return { score, level }
}

// Main scan function
export async function scanContract(
  contractAddress: string,
  network: string = 'ethereum'
): Promise<ScanResult> {
  const startTime = Date.now()

  // Validate address
  if (!contractAddress || !contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid contract address format')
  }

  // Fetch contract data
  const contractData = await fetchContractCode(contractAddress, network)
  
  // Get transaction statistics
  const txStats = await fetchTransactionStats(contractAddress, network)
  
  // Analyze source code
  const { vulnerabilities, recommendations } = analyzeSourceCode(
    contractData?.source_code || '',
    network
  )
  
  // Calculate risk score
  const { score, level } = calculateRiskScore(vulnerabilities, txStats)
  
  // Prepare result
  const result: ScanResult = {
    contract_address: contractAddress,
    network: network,
    overall_risk_score: score,
    risk_level: level,
    vulnerabilities: vulnerabilities,
    scan_time_seconds: (Date.now() - startTime) / 1000,
    recommendations: recommendations,
    contract_info: {
      name: contractData?.contract_name,
      compiler: contractData?.compiler_version,
      verified: contractData?.verified,
      optimization: contractData?.optimization,
      chain_id: NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]?.chain_id,
      explorer_url: contractData?.explorer_url,
      transaction_count: txStats.total_transactions || 0,
      failure_rate: txStats.failure_rate ? `${(txStats.failure_rate * 100).toFixed(1)}%` : '0%'
    }
  }

  return result
}