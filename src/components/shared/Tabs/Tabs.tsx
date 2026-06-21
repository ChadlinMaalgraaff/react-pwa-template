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
    <div role="tablist" className={`flex bg-surface border border-line rounded-[14px] p-1 gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`flex-1 h-10 rounded-[10px] text-sm font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-[0_4px_10px_-4px_rgba(30,92,69,.5)]' : 'text-ink-soft hover:text-ink'
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
