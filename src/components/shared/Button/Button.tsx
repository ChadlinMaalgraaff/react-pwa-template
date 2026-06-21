import React from 'react'
import './Button.css'
import '@styles/shared.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

/**
 * Reusable Button Component
 * Supports different variants and sizes
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-semibold transition-colors duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full'

    const variantStyles = {
      primary: 'bg-primary text-white shadow-btn hover:bg-primary-press',
      secondary: 'bg-surface text-ink border border-line-strong shadow-sm hover:bg-neutral-50',
      danger: 'bg-danger text-white hover:bg-danger/90',
    }

    const sizeStyles = {
      sm: 'h-11 px-5 text-sm',
      md: 'h-[52px] px-5 text-[15.5px]',
      lg: 'h-[52px] px-6 text-[15.5px]',
    }

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
