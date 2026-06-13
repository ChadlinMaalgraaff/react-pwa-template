import React from 'react'
import { LucideIcon, Inbox } from 'lucide-react'
import Button from '../Button/Button'
import './EmptyState.css'
import '@styles/shared.css'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-12 text-center ${className}`}>
      <Icon className="h-10 w-10 text-neutral-400" />
      <p className="text-base font-medium text-neutral-700">{title}</p>
      {message && <p className="text-sm text-neutral-500">{message}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
