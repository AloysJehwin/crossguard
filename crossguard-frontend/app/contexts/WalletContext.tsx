'use client'

import { createContext } from 'react'

interface WalletContextType {
  account: string
  isConnected: boolean
}

export const WalletContext = createContext<WalletContextType>({
  account: '',
  isConnected: false
})