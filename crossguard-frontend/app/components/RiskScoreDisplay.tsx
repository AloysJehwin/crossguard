'use client'

interface RiskScoreDisplayProps {
  score: number
}

export default function RiskScoreDisplay({ score }: RiskScoreDisplayProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 76) return { level: 'CRITICAL', class: 'risk-critical' }
    if (score >= 51) return { level: 'HIGH', class: 'risk-high' }
    if (score >= 26) return { level: 'MEDIUM', class: 'risk-medium' }
    return { level: 'LOW', class: 'risk-low' }
  }

  const { level, class: riskClass } = getRiskLevel(score)

  return (
    <div className="border-4 border-black bg-white">
      <div className="text-center p-8">
        <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">
          Risk Assessment
        </h3>
        
        {/* Large Score Display */}
        <div className={`text-8xl font-mono font-bold p-8 border-4 border-black ${riskClass}`}>
          {score}
        </div>
        
        {/* Risk Level Label */}
        <div className="text-xl font-bold mt-4 uppercase tracking-wider">
          {level} RISK
        </div>
        
        {/* Visual Meter */}
        <div className="mt-6 border-2 border-black bg-gray-200 h-8">
          <div 
            className={`h-full transition-all duration-500 ${riskClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        {/* Risk Breakdown */}
        <div className="mt-6 text-left">
          <div className="font-bold uppercase mb-2">Risk Factors:</div>
          <div className="space-y-1 font-mono text-sm">
            <div>• SMART CONTRACT AGE</div>
            <div>• CODE COMPLEXITY</div>
            <div>• TRANSACTION VOLUME</div>
            <div>• AUDIT STATUS</div>
          </div>
        </div>
      </div>
    </div>
  )
}