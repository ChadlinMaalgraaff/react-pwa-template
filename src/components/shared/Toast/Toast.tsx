import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@hooks/redux.hooks'
import { clearNotification } from '@store/slices/ui.slice'
import './Toast.css'
import '@styles/shared.css'

const AUTO_DISMISS_MS = 4000

const variantStyles = {
  success: { container: 'bg-primary text-white', Icon: CheckCircle },
  error: { container: 'bg-danger text-white', Icon: XCircle },
  warning: { container: 'bg-accent text-white', Icon: AlertTriangle },
  info: { container: 'bg-secondary text-white', Icon: Info },
} as const

const Toast: React.FC = () => {
  const dispatch = useAppDispatch()
  const notification = useAppSelector((state) => state.ui.notification)

  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => dispatch(clearNotification()), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [notification, dispatch])

  if (!notification) return null

  const { container, Icon } = variantStyles[notification.type]

  return (
    <div role="alert" className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${container}`}>
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{notification.message}</span>
      <button type="button" aria-label="Dismiss" onClick={() => dispatch(clearNotification())} className="ml-2">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast
