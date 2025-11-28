export interface PerformanceMetric {
  id: string
  timestamp: number
  metric: string
  value: number
  unit: string
}

export interface TransactionRecord {
  hash: string
  status: 'pending' | 'success' | 'failed'
  timestamp: number
  type: string
  value: string
  from: string
  to: string
  gasUsed?: string
}

export interface MonitoringState {
  isMonitoring: boolean
  metricsCount: number
  lastUpdate: number
  averageValue: number
}

export interface ErrorState {
  code: string
  message: string
  timestamp: number
}
