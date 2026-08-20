import { HTMLAttributes, ReactNode } from 'react'

type TagVariant =
  | 'default'
  | 'lavender'
  | 'cyan'
  | 'green'
  | 'rose'
  | 'amber'

type TagSize = 'sm' | 'md'

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  size?: TagSize
  children?: ReactNode
}

const variantClasses: Record<TagVariant, string> = {
  default:
    'bg-surface-hover/60 text-text-secondary border-surface-border/70 hover:bg-surface-hover/80 hover:text-text-primary',
  lavender:
    'bg-accent-lavender/15 text-accent-lavender border-accent-lavender/25 hover:bg-accent-lavender/22',
  cyan:
    'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25 hover:bg-accent-cyan/22',
  green:
    'bg-accent-green/15 text-accent-green border-accent-green/25 hover:bg-accent-green/22',
  rose:
    'bg-accent-rose/15 text-accent-rose border-accent-rose/25 hover:bg-accent-rose/22',
  amber:
    'bg-accent-amber/15 text-accent-amber border-accent-amber/25 hover:bg-accent-amber/22',
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
}

export function Tag({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}: TagProps) {
  const base =
    'inline-flex items-center font-medium border backdrop-blur-sm transition-colors duration-200 whitespace-nowrap select-none'

  return (
    <span
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
