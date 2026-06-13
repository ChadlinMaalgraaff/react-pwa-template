import React from 'react'
import './Select.css'
import '@styles/shared.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className, id, required, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`input-base ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="input-error-text">{error}</p>}
        {helperText && !error && <p className="input-helper-text">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
