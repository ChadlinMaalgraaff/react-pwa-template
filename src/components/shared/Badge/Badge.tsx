import React from 'react'
import './Badge.css'
import '@styles/shared.css'

export type BadgeVariant = 'success' | 'accent' | 'neutral' | 'danger'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-primary-light text-primary',
  accent: 'bg-accent-light text-accent',
  neutral: 'bg-neutral-100 text-neutral-700',
  danger: 'bg-danger/10 text-danger',
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
