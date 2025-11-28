import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
