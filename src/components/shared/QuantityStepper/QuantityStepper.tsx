import React from 'react'
import { Minus, Plus } from 'lucide-react'
import './QuantityStepper.css'
import '@styles/shared.css'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
  className = '',
}) => {
  const decrement = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100))
  const increment = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100))

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[3rem] text-center text-sm font-medium text-neutral-900">
        {value}
        {unit ? ` ${unit}` : ''}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default QuantityStepper
