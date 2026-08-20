import { ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-lg bg-surface/85 border border-surface-border backdrop-blur-xl rounded-2xl shadow-glass animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            {title && (
              <h2
                id="modal-title"
                className="font-display text-xl font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover/60 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children && <div className="p-6 pt-4">{children}</div>}
        {footer && (
          <div className="p-6 pt-2 flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
