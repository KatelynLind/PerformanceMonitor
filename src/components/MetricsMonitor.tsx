import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Loading, Skeleton } from './ui/Loading'
import { useToast } from './ui/Toast'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { PerformanceMetric } from '../types'

export default function MetricsMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    max: 0,
    min: 0,
  })
  const { addToast } = useToast()
  const { addTransaction } = useTransactionHistory()

  const generateMockMetric = (): PerformanceMetric => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    metric: ['CPU Usage', 'Memory Usage', 'Disk I/O', 'Network Latency'][
      Math.floor(Math.random() * 4)
    ],
    value: Math.floor(Math.random() * 100),
    unit: ['%', 'MB', 'MB/s', 'ms'][Math.floor(Math.random() * 4)],
  })

  const calculateStats = (metricsData: PerformanceMetric[]) => {
    if (metricsData.length === 0) return
    const values = metricsData.map((m) => m.value)
    setStats({
      total: metricsData.length,
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      max: Math.max(...values),
      min: Math.min(...values),
    })
  }

  const startMonitoring = async () => {
    setIsLoading(true)
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newMetric = generateMockMetric()
      setMetrics((prev) => [newMetric, ...prev].slice(0, 50))
      calculateStats([newMetric, ...metrics].slice(0, 50))

      addTransaction({
        hash: Math.random().toString(36).substr(2, 9),
        status: 'success',
        timestamp: Date.now(),
        type: 'Metric Recorded',
        value: newMetric.value.toString(),
        from: 'Monitor Contract',
        to: 'Storage',
      })

      setIsMonitoring(true)
      addToast('Monitoring started successfully', 'success')
    } catch (error) {
      addToast('Failed to start monitoring', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    addToast('Monitoring stopped', 'info')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isMonitoring) {
      interval = setInterval(() => {
        const newMetric = generateMockMetric()
        setMetrics((prev) => [newMetric, ...prev].slice(0, 50))
        calculateStats([newMetric, ...metrics].slice(0, 50))
      }, 3000)
    }

    return () => clearInterval(interval)
  }, [isMonitoring, metrics])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Stats Cards */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Metrics</p>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Average</p>
            <p className="text-3xl font-bold text-secondary">{stats.average}%</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Maximum</p>
            <p className="text-3xl font-bold text-accent">{stats.max}%</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Minimum</p>
            <p className="text-3xl font-bold text-blue-400">{stats.min}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card variant="bordered" className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Monitoring Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={startMonitoring}
              isLoading={isLoading}
              disabled={isMonitoring}
              variant="primary"
              size="lg"
            >
              Start Monitoring
            </Button>
            <Button
              onClick={stopMonitoring}
              disabled={!isMonitoring}
              variant="danger"
              size="lg"
            >
              Stop Monitoring
            </Button>
          </div>
          {isMonitoring && (
            <div className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Monitoring Active</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics List */}
      <Card variant="default" className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No metrics recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-400">Metric</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-400">Value</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 10).map((metric) => (
                    <tr key={metric.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-2">{metric.metric}</td>
                      <td className="px-4 py-2">
                        <span className="text-primary font-medium">
                          {metric.value}
                          {metric.unit}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
