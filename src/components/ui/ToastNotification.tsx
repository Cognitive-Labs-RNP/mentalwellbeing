import { useEffect } from 'react'
import {
  Shield,
  Phone,
  Wind,
  Stethoscope,
  X,
  HeartHandshake,
} from 'lucide-react'
import { Button } from './Button'

interface SafetyAlertProps {
  open: boolean
  onDismiss?: () => void
  onCrisisResources?: () => void
  onSafetyBreathing?: () => void
  onProfessionalCare?: () => void
  message?: string
  className?: string
}

export function SafetyAlert({
  open,
  onDismiss,
  onCrisisResources,
  onSafetyBreathing,
  onProfessionalCare,
  message = "We care about you. If you're in distress, gentle support is available right now.",
  className = '',
}: SafetyAlertProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in ${className}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="safety-title"
      aria-describedby="safety-desc"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-bg-primary/85 via-bg-primary/90 to-bg-primary/95 backdrop-blur-md"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl">
        <button
          onClick={onDismiss}
          aria-label="Dismiss safety message"
          className="absolute -top-3 -right-3 z-10 w-11 h-11 flex items-center justify-center rounded-xl bg-surface/90 backdrop-blur-xl border border-surface-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all shadow-glass"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-surface/85 backdrop-blur-2xl border border-accent-lavender/30 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-accent-lavender/35 via-accent-cyan/25 to-accent-green/20 border border-accent-lavender/30 flex items-center justify-center shadow-[0_0_40px_rgba(167,139,250,0.25)] animate-float">
              <HeartHandshake
                className="w-10 h-10 text-accent-lavender"
                strokeWidth={1.8}
              />
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-accent-green" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent-green/15 text-accent-green border border-accent-green/30">
                Gentle check-in
              </span>
            </div>

            <h2
              id="safety-title"
              className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-3"
            >
              You're not alone in this.
            </h2>
            <p
              id="safety-desc"
              className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-lg mx-auto"
            >
              {message}
            </p>
          </div>

          <div className="px-6 sm:px-8 pb-8 grid gap-3 sm:grid-cols-3">
            <button
              onClick={onCrisisResources}
              className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-accent-rose/15 to-pink-500/10 border border-accent-rose/30 hover:border-accent-rose/50 hover:shadow-[0_0_32px_rgba(248,113,113,0.18)] transition-all duration-300 text-left min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-rose/25 text-accent-rose border border-accent-rose/30 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-base font-semibold text-text-primary">
                  Crisis resources
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  24/7 helplines and immediate support contacts for your
                  region.
                </p>
              </div>
            </button>

            <button
              onClick={onSafetyBreathing}
              className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-accent-cyan/15 to-sky-500/10 border border-accent-cyan/30 hover:border-accent-cyan/50 hover:shadow-[0_0_32px_rgba(103,232,249,0.18)] transition-all duration-300 text-left min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/30 group-hover:scale-105 transition-transform animate-pulse">
                <Wind className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-base font-semibold text-text-primary">
                  Safety breathing
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  A short guided 4-7-8 breathing exercise to ground you right
                  now.
                </p>
              </div>
            </button>

            <button
              onClick={onProfessionalCare}
              className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-accent-lavender/15 to-purple-500/10 border border-accent-lavender/30 hover:border-accent-lavender/50 hover:shadow-[0_0_32px_rgba(167,139,250,0.18)] transition-all duration-300 text-left min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-lavender/25 text-accent-lavender border border-accent-lavender/30 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-base font-semibold text-text-primary">
                  Professional care
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Browse licensed providers and book an appointment at your
                  pace.
                </p>
              </div>
            </button>
          </div>

          <div className="px-8 pb-8 pt-0 flex items-center justify-center">
            <Button variant="ghost" size="md" onClick={onDismiss}>
              I'm okay for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
