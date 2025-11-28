import React, { ReactNode, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
          <Card variant="bordered" className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-red-400">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              {this.state.error && (
                <details className="text-xs text-gray-400 bg-gray-900 p-3 rounded border border-gray-700">
                  <summary className="cursor-pointer font-mono">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-4">
                <Button onClick={this.resetError} variant="primary" className="flex-1">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="flex-1"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
