import React from 'react'
import './Spinner.css'
import '@styles/shared.css'

interface SpinnerProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const Spinner: React.FC<SpinnerProps> = ({ fullScreen = false, size = 'md', className = '' }) => {
  const spinner = (
    <svg
      role="status"
      aria-label="Loading"
      className={`animate-spin text-primary ${sizeStyles[size]} ${className}`}
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  if (fullScreen) {
    return <div className="flex h-full w-full items-center justify-center py-12">{spinner}</div>
  }

  return spinner
}

export default Spinner
