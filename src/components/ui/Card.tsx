import { forwardRef, HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  isEmpty?: boolean
  children?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ isEmpty = false, className = '', children, ...props }, ref) => {
    const base =
      'rounded-2xl border backdrop-blur-xl shadow-glass transition-all duration-300'
    const normal = 'bg-surface/80 border-surface-border'
    const empty =
      'bg-surface/40 border-surface-border/60 border-dashed min-h-[200px] flex items-center justify-center'

    return (
      <div
        ref={ref}
        className={`${base} ${isEmpty ? empty : normal} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pb-4 space-y-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-display text-xl font-semibold text-text-primary ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
)

CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-text-secondary leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  )
)

CardDescription.displayName = 'CardDescription'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-0 flex items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'
