import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  asChild?: boolean
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent-lavender to-purple-500 text-white shadow-glow hover:from-purple-500 hover:to-accent-lavender transition-all duration-300',
  secondary:
    'bg-surface/80 text-text-primary border border-surface-border hover:bg-surface-hover/90 backdrop-blur-xl transition-all duration-300',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface/60 hover:text-text-primary transition-all duration-300',
  danger:
    'bg-transparent text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/10 transition-all duration-300',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-11 px-4 text-sm rounded-xl gap-2',
  md: 'h-12 px-6 text-base rounded-xl gap-2.5',
  lg: 'h-14 px-8 text-lg rounded-2xl gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lavender/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none min-w-[44px]'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
