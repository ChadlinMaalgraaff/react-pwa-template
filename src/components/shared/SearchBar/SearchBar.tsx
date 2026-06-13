import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import './SearchBar.css'
import '@styles/shared.css'

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  onSearch: (value: string) => void
  debounceMs?: number
  filterAction?: React.ReactNode
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  defaultValue = '',
  onSearch,
  debounceMs = 300,
  filterAction,
  className,
}) => {
  const [value, setValue] = useState(defaultValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setValue(newValue)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => onSearch(newValue), debounceMs)
    },
    [onSearch, debounceMs]
  )

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          role="searchbox"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="input-base pl-9"
        />
      </div>
      {filterAction}
    </div>
  )
}

export default SearchBar
