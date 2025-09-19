'use client'

interface Policy {
  id: number
  contractAddress: string
  coverageAmount: string
  premium: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED'
  riskScore: number
}

interface PolicyDashboardProps {
  account: string
  policies: Policy[]
}

export default function PolicyDashboard({ account, policies }: PolicyDashboardProps) {
  const mockPolicies: Policy[] = [
    {
      id: 1,
      contractAddress: '0x1234...5678',
      coverageAmount: '50000 SOMNIA',
      premium: '125 SOMNIA',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      status: 'ACTIVE',
      riskScore: 45
    }
  ]

  const displayPolicies = policies.length > 0 ? policies : mockPolicies

  return (
    <div className="border-4 border-black bg-white p-8">
      <h3 className="text-2xl font-bold mb-6 uppercase">Your Active Policies</h3>
      
      {displayPolicies.length === 0 ? (
        <p className="font-mono">No active policies found</p>
      ) : (
        <div className="space-y-4">
          {displayPolicies.map((policy) => (
            <div key={policy.id} className="border-3 border-black p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-bold uppercase text-sm">Contract</p>
                  <p className="font-mono">{policy.contractAddress}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-sm">Coverage</p>
                  <p className="font-mono">{policy.coverageAmount}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-sm">Premium Paid</p>
                  <p className="font-mono">{policy.premium}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-sm">Status</p>
                  <span className={`
                    px-3 py-1 font-bold uppercase
                    ${policy.status === 'ACTIVE' ? 'bg-green-500 text-white' : ''}
                    ${policy.status === 'EXPIRED' ? 'bg-gray-500 text-white' : ''}
                    ${policy.status === 'CLAIMED' ? 'bg-orange-500 text-white' : ''}
                  `}>
                    {policy.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <div className="font-mono text-sm">
                    Valid: {policy.startDate} - {policy.endDate}
                  </div>
                  {policy.status === 'ACTIVE' && (
                    <button className="vintage-button text-sm px-4 py-2">
                      SUBMIT CLAIM
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}