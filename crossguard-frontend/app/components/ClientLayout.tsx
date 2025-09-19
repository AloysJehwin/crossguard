'use client'

import Navigation from './Navigation'
import { useState } from 'react'
import { WalletContext } from '../contexts/WalletContext'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  return (
    <WalletContext.Provider value={{ account, isConnected }}>
      <Navigation onAccountChange={setAccount} />
      <main className="min-h-screen">
        {children}
      </main>
    </WalletContext.Provider>
  )
}