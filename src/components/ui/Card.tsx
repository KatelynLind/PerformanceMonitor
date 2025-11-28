import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-gray-800 border border-gray-700',
    elevated: 'bg-gray-800 border border-gray-700 shadow-lg shadow-primary/20',
    bordered: 'bg-gray-900 border-2 border-primary',
  }

  return (
    <div className={`rounded-lg p-6 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 pb-4 border-b border-gray-700 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-bold text-white ${className}`}>{children}</h2>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-700 flex gap-4 ${className}`}>
      {children}
    </div>
  )
}
