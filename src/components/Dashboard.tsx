import { useAccount, useConnectModal } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import MetricsMonitor from './MetricsMonitor'
import TransactionHistory from './TransactionHistory'
import { useState } from 'react'

export default function Dashboard() {
  const { address, isConnecting } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [activeTab, setActiveTab] = useState<'metrics' | 'history'>('metrics')

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome to Performance Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Connect your wallet to start monitoring system performance metrics on the Sepolia testnet.
            </p>
            <Button
              onClick={openConnectModal}
              isLoading={isConnecting}
              className="w-full"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Performance Monitor</h1>
          <p className="text-gray-400">
            Track and analyze system performance metrics with blockchain verification
          </p>
        </div>

        {/* User Info */}
        <Card variant="bordered" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Connected Address</p>
              <p className="text-white font-mono text-sm md:text-base break-all">
                {address}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transaction History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'metrics' && <MetricsMonitor />}
        {activeTab === 'history' && <TransactionHistory />}
      </div>
    </div>
  )
}
