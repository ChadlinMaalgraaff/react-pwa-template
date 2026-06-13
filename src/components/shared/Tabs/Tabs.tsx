import React from 'react'
import './Tabs.css'
import '@styles/shared.css'

export interface TabOption {
  value: string
  label: string
}

interface TabsProps {
  tabs: TabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, className = '' }) => {
  return (
    <div role="tablist" className={`inline-flex rounded-lg bg-neutral-100 p-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-surface text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
