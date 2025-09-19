'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavigationProps {
  onAccountChange?: (account: string) => void
}

export default function Navigation({ onAccountChange }: NavigationProps = {}) {
  const pathname = usePathname()
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (account && onAccountChange) {
      onAccountChange(account)
    }
  }, [account, onAccountChange])

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0])
      setIsConnected(true)
    } else {
      setAccount('')
      setIsConnected(false)
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16))
    window.location.reload()
  }

  const checkConnection = async () => {
    if (!window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      setChainId(parseInt(chainId, 16))
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const switchWallet = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      })
    } catch (error) {
      console.error('Error switching wallet:', error)
    }
  }

  const switchToSomnia = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xc4b8' }], // 50312 in hex
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xc4b8',
              chainName: 'Somnia Testnet',
              nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18
              },
              rpcUrls: ['https://dream-rpc.somnia.network/'],
              blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
            }]
          })
        } catch (addError) {
          console.error('Error adding Somnia network:', addError)
        }
      }
    }
  }

  const isCorrectNetwork = chainId === 50312

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/scan', label: 'SCANNER' },
    { href: '/insurance', label: 'INSURANCE' },
    { href: '/monitor', label: 'MONITOR' },
  ]

  return (
    <nav className="border-b-4 relative z-50" style={{
      borderColor: '#2C2C2C',
      background: '#FAFAFA',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold tracking-wider">
              CROSSGUARD
            </div>
            <div className="ml-4 text-sm uppercase tracking-wide text-gray-600">
              Security Protocol
            </div>
          </div>

          {/* Navigation Tabs and Wallet */}
          <div className="flex items-center">
            <div className="flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-6 py-3 border-2 font-bold tracking-wider
                    transition-all duration-200
                    ${item.href !== '/' ? 'border-l-0' : ''}
                  `}
                  style={{
                    borderColor: '#2C2C2C',
                    background: pathname === item.href 
                      ? '#2C2C2C'
                      : '#FAFAFA',
                    color: pathname === item.href ? '#FAFAFA' : '#2C2C2C'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.background = '#E8E8E8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.background = '#FAFAFA'
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Wallet Button - Integrated with Navigation Style */}
              <div className="relative">
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="px-6 py-3 border-2 border-l-0 font-bold tracking-wider transition-all duration-200"
                    style={{
                      borderColor: '#2C2C2C',
                      background: '#9A8C98',
                      color: '#FAFAFA'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#C8B6DB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#9A8C98'
                    }}
                  >
                    WALLET
                  </button>
                ) : (
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="px-6 py-3 border-2 border-l-0 font-bold tracking-wider transition-all duration-200"
                    style={{
                      borderColor: '#2C2C2C',
                      background: !isCorrectNetwork
                        ? '#C97575'
                        : '#A8C4A2',
                      color: !isCorrectNetwork ? '#FAFAFA' : '#2C2C2C'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{account.slice(0, 4)}...{account.slice(-3)}</span>
                      <span className="text-xs">{isCorrectNetwork ? 'OK' : 'ERR'}</span>
                    </div>
                  </button>
                )}
                
                {/* Wallet Dropdown Menu */}
                {showWalletMenu && isConnected && (
                  <div className="absolute top-full right-0 mt-1 w-64 border-3 z-50" style={{
                    borderColor: '#2C2C2C',
                    background: 'linear-gradient(135deg, #F5E6D3 0%, #FAFAFA 100%)',
                    boxShadow: '4px 4px 0 #D4D4D4'
                  }}>
                    {/* Network Status */}
                    <div className="px-4 py-3 border-b-2" style={{borderColor: '#D4D4D4'}}>
                      <div className="font-bold uppercase text-xs mb-1" style={{color: '#9A8C98'}}>Network</div>
                      <div className="font-mono text-sm" style={{
                        color: isCorrectNetwork ? '#A8C4A2' : '#C97575'
                      }}>
                        {isCorrectNetwork ? 'SOMNIA TESTNET' : `WRONG NETWORK (${chainId})`}
                      </div>
                    </div>
                    
                    {/* Switch Network Button if needed */}
                    {!isCorrectNetwork && (
                      <button
                        onClick={switchToSomnia}
                        className="w-full px-4 py-3 text-left border-b-2 font-bold uppercase transition-all"
                        style={{
                          borderColor: '#D4D4D4',
                          color: '#D4A574'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FFD4B2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        SWITCH TO SOMNIA
                      </button>
                    )}
                    
                    {/* Switch Account */}
                    <button
                      onClick={switchWallet}
                      className="w-full px-4 py-3 text-left border-b-2 font-bold uppercase transition-all"
                      style={{
                        borderColor: '#D4D4D4',
                        color: '#9A8C98'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#C8B6DB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      SWITCH ACCOUNT
                    </button>
                    
                    {/* Copy Address */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(account)
                        alert('Address copied!')
                        setShowWalletMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left border-b-2 transition-all"
                      style={{
                        borderColor: '#D4D4D4'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#B8D4DE'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="font-bold uppercase" style={{color: '#9A8C98'}}>COPY ADDRESS</div>
                      <div className="font-mono text-xs mt-1" style={{color: '#2C2C2C'}}>{account}</div>
                    </button>
                    
                    {/* Disconnect */}
                    <button
                      onClick={() => {
                        setAccount('')
                        setIsConnected(false)
                        setShowWalletMenu(false)
                        alert('Disconnected from app. To fully disconnect, use MetaMask settings.')
                      }}
                      className="w-full px-4 py-3 text-left font-bold uppercase transition-all"
                      style={{color: '#C97575'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F4C2C2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      DISCONNECT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}