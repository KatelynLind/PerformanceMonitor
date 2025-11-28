import { useState, useCallback, useEffect } from 'react'
import { TransactionRecord } from '../types'

const STORAGE_KEY = 'pm_transaction_history'
const MAX_HISTORY = 100

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setTransactions(JSON.parse(saved))
      } catch {
        // Ignore corrupted data
      }
    }
  }, [])

  const addTransaction = useCallback((tx: TransactionRecord) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateTransaction = useCallback((hash: string, updates: Partial<TransactionRecord>) => {
    setTransactions((prev) => {
      const updated = prev.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setTransactions([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearHistory,
  }
}
