import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { useToast } from './ui/Toast'
import { TransactionRecord } from '../types'

export default function TransactionHistory() {
  const { transactions, clearHistory } = useTransactionHistory()
  const { addToast } = useToast()

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history?')) {
      clearHistory()
      addToast('History cleared successfully', 'success')
    }
  }

  const getStatusBadge = (status: TransactionRecord['status']) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      success: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
    }
    return styles[status]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast('Copied to clipboard', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-primary">{transactions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Successful</p>
              <p className="text-3xl font-bold text-green-400">
                {transactions.filter((tx) => tx.status === 'success').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Failed</p>
              <p className="text-3xl font-bold text-red-400">
                {transactions.filter((tx) => tx.status === 'failed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Log</CardTitle>
            <Button
              onClick={handleClearHistory}
              variant="ghost"
              size="sm"
              disabled={transactions.length === 0}
            >
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No transactions recorded</p>
              <p className="text-gray-500 text-sm">
                Start monitoring or interact with the contract to see transactions here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Value</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Hash</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.hash} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{tx.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary font-medium">{tx.value}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-gray-300 text-xs bg-gray-900 px-2 py-1 rounded">
                            {tx.hash.slice(0, 8)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(tx.hash)}
                            className="text-gray-400 hover:text-white transition"
                            title="Copy full hash"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => {
                const data = JSON.stringify(transactions, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `transactions-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
                addToast('Downloaded as JSON', 'success')
              }}
              variant="primary"
              disabled={transactions.length === 0}
            >
              Export as JSON
            </Button>
            <Button
              onClick={() => {
                const csv = [
                  ['Type', 'Status', 'Value', 'Hash', 'Timestamp'],
                  ...transactions.map((tx) => [
                    tx.type,
                    tx.status,
                    tx.value,
                    tx.hash,
                    new Date(tx.timestamp).toISOString(),
                  ]),
                ]
                  .map((row) => row.map((cell) => `"${cell}"`).join(','))
                  .join('\n')

                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `transactions-${Date.now()}.csv`
                a.click()
                URL.revokeObjectURL(url)
                addToast('Downloaded as CSV', 'success')
              }}
              variant="primary"
              disabled={transactions.length === 0}
            >
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
