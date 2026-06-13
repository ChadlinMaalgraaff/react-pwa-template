import React from 'react'
import { Check } from 'lucide-react'
import './ProgressSteps.css'
import '@styles/shared.css'

interface ProgressStepsProps {
  steps: string[]
  currentStep: number
  className?: string
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <ol className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isComplete = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isComplete || isCurrent ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <span className="text-xs font-medium text-neutral-600">{step}</span>
            </div>
            {stepNumber < steps.length && (
              <div className={`mx-2 h-0.5 flex-1 ${isComplete ? 'bg-primary' : 'bg-neutral-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default ProgressSteps
