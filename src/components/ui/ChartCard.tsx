import { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { BarChart3 } from 'lucide-react'

interface ChartCardProps {
  title: string
  description?: string
  children?: ReactNode
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  isEmpty = false,
  emptyTitle = 'No data yet',
  emptyDescription = 'Check back after completing some activities to see your trends.',
  className = '',
}: ChartCardProps) {
  return (
    <div
      className={`bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl shadow-glass overflow-hidden ${className}`}
    >
      <div className="px-6 pt-6 pb-4 border-b border-surface-border/60">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="p-6">
        {isEmpty ? (
          <EmptyState
            icon={BarChart3}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          children
        )}
      </div>
    </div>
  )
}
