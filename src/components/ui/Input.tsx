import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      id,
      className = '',
      disabled,
      containerClassName = '',
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? props.name

    const wrapperBase =
      'group relative flex items-center h-12 min-h-[44px] rounded-xl transition-all duration-200 border backdrop-blur-sm bg-bg-primary/55'
    const baseState = error
      ? 'border-accent-rose/50 focus-within:border-accent-rose focus-within:ring-2 focus-within:ring-accent-rose/25 shadow-[0_0_0_1px_rgba(248,113,113,0.1)]'
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

        <div
          className={`${wrapperBase} ${baseState} ${disabledState}`}
        >
          {leftIcon && (
            <div
              className="pl-4 pr-1 flex items-center justify-center text-text-muted group-focus-within:text-accent-lavender transition-colors flex-shrink-0 pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              error ? `${inputId}-error` : props['aria-describedby']
            }
            className={`flex-1 min-w-0 w-full h-full bg-transparent text-text-primary placeholder:text-text-muted/70 text-sm px-4 outline-none focus:outline-none disabled:cursor-not-allowed ${
              leftIcon ? 'pl-1' : ''
            } ${rightIcon || error ? 'pr-1' : ''}`}
            {...props}
          />
          {(rightIcon || error) && (
            <div
              className={`pl-1 pr-4 flex items-center justify-center flex-shrink-0 gap-2 ${
                error ? 'text-accent-rose' : 'text-text-muted'
              } transition-colors pointer-events-none`}
              aria-hidden="true"
            >
              {error && <AlertCircle className="w-4.5 h-4.5" />}
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-xs font-medium text-accent-rose leading-relaxed flex items-start gap-1.5"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
