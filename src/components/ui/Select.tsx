import {
  forwardRef,
  SelectHTMLAttributes,
  useId,
} from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options: SelectOption[]
  error?: string
  placeholder?: string
  containerClassName?: string
  onChange?: (value: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      placeholder = 'Select an option',
      id,
      className = '',
      disabled,
      required,
      onChange,
      containerClassName = '',
      value,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const inputId = id ?? `select-${autoId}`
    const hasValue = value !== undefined && value !== null && value !== ''

    const wrapperBase =
      'group relative flex items-center h-12 min-h-[44px] rounded-xl transition-all duration-200 border backdrop-blur-sm bg-bg-primary/55'
    const baseState = error
      ? 'border-accent-rose/50 focus-within:border-accent-rose focus-within:ring-2 focus-within:ring-accent-rose/25'
      : 'border-surface-border/70 focus-within:border-accent-lavender/70 focus-within:ring-2 focus-within:ring-accent-lavender/25 hover:border-surface-border'
    const disabledState = disabled
      ? 'opacity-60 cursor-not-allowed bg-surface-hover/40'
      : ''

    return (
      <div className={`w-full ${containerClassName}`}>
        {(label || required) && (
          <div className="flex items-baseline justify-between mb-2">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-text-secondary"
              >
                {label}
              </label>
            )}
            {required && !label && (
              <span className="text-xs font-medium text-accent-rose">
                * Required
              </span>
            )}
          </div>
        )}

        <div className={`${wrapperBase} ${baseState} ${disabledState} relative`}>
          <select
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              error ? `${inputId}-error` : props['aria-describedby']
            }
            value={hasValue ? value : ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`relative z-10 flex-1 min-w-0 w-full h-full bg-transparent text-sm px-4 pr-11 outline-none focus:outline-none appearance-none cursor-pointer disabled:cursor-not-allowed ${
              hasValue ? 'text-text-primary' : 'text-text-muted/80'
            } ${className}`}
            {...props}
          >
            <option value="" disabled={required} hidden={required}>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-bg-primary text-text-primary"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-accent-lavender transition-colors"
            aria-hidden="true"
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-xs font-medium text-accent-rose leading-relaxed"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
