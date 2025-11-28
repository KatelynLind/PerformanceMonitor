import { useState, useCallback } from 'react'
import { useContractWrite } from 'wagmi'
import { useToast } from '../components/ui/Toast'
import { ErrorState } from '../types'

interface UseContractInteractionOptions {
  onSuccess?: () => void
  onError?: (error: ErrorState) => void
}

export function useContractInteraction(options?: UseContractInteractionOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const { addToast } = useToast()

  const handleError = useCallback(
    (err: unknown) => {
      const errorState: ErrorState = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        timestamp: Date.now(),
      }

      if (err instanceof Error) {
        errorState.message = err.message
        if (err.message.includes('insufficient')) {
          errorState.code = 'INSUFFICIENT_BALANCE'
        } else if (err.message.includes('network')) {
          errorState.code = 'NETWORK_ERROR'
        } else if (err.message.includes('user')) {
          errorState.code = 'USER_REJECTED'
        }
      }

      setError(errorState)
      addToast(errorState.message, 'error')
      options?.onError?.(errorState)
    },
    [addToast, options]
  )

  const handleSuccess = useCallback(() => {
    setError(null)
    addToast('Transaction successful!', 'success')
    options?.onSuccess?.()
  }, [addToast, options])

  return {
    isLoading,
    error,
    setIsLoading,
    setError,
    handleError,
    handleSuccess,
    clearError: () => setError(null),
  }
}
