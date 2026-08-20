import { useEffect, useState } from 'react'
import {
  HeartHandshake,
  Wind,
  Stethoscope,
  X,
  AlertOctagon,
  Phone,
} from 'lucide-react'
import { Button } from './Button'

interface SafetyAlertProps {
  open: boolean
  onDismiss?: () => void
  onCrisisResources?: () => void
  onSafetyBreathing?: () => void
  onProfessionalCare?: () => void
  crisisPhone?: string
  message?: string
}

export function SafetyAlert({
  open,
  onDismiss,
  onCrisisResources,
  onSafetyBreathing,
  onProfessionalCare,
  crisisPhone = '988',
  message = "Let's take a gentle moment together.",
}: SafetyAlertProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      document.body.style.overflow = 'hidden'
      const t = window.setTimeout(() => setVisible(true), 10)
      return () => window.clearTimeout(t)
    } else if (mounted) {
      setVisible(false)
      const t = window.setTimeout(() => {
        setMounted(false)
        document.body.style.overflow = ''
      }, 350)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [open, mounted])

  if (!mounted) return null

  const OptionCard = ({
    icon: Icon,
    title,
    description,
    onClick,
    tint,
  }: {
    icon: typeof HeartHandshake
    title: string
    description: string
    onClick?: () => void
    tint: 'lavender' | 'cyan' | 'green'
  }) => {
    const tintMap: Record<string, string> = {
      lavender:
        'from-accent-lavender/30 to-purple-500/20 hover:from-accent-lavender/40 hover:to-purple-500/25 border-accent-lavender/30',
      cyan: 'from-accent-cyan/30 to-sky-500/20 hover:from-accent-cyan/40 hover:to-sky-500/25 border-accent-cyan/30',
      green:
        'from-accent-green/30 to-emerald-500/20 hover:from-accent-green/40 hover:to-emerald-500/25 border-accent-green/30',
    }
    const textTint: Record<string, string> = {
      lavender: 'text-accent-lavender',
      cyan: 'text-accent-cyan',
      green: 'text-accent-green',
    }
    return (
      <button
        onClick={onClick}
        className={`group relative text-left w-full p-5 rounded-2xl bg-gradient-to-br ${tintMap[tint]} border backdrop-blur-md transition-all duration-300 hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-surface/70 border border-surface-border/60 group-hover:bg-white/10 transition-colors`}
          >
            <Icon
              className={`w-7 h-7 ${textTint[tint]}`}
              strokeWidth={1.9}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-lg font-semibold text-white mb-1">
              {title}
            </h4>
            <p className="text-sm leading-relaxed text-white/75">
              {description}
            </p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="safety-title"
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(10,15,30,0.85) 0%, rgba(0,0,0,0.92) 60%)',
          backdropFilter: 'blur(10px)',
          opacity: visible ? 1 : 0,
        }}
      />
      <div
        className="relative w-full max-w-xl transition-all duration-300 ease-out"
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(16px) scale(0.985)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="absolute -inset-px rounded-[2rem] blur-2xl opacity-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.5), rgba(103,232,249,0.35), rgba(74,222,128,0.35))',
          }}
        />
        <div className="relative rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0f1530]/95 via-[#0c1226]/95 to-[#0a0f1e]/95 backdrop-blur-2xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="px-7 pt-7 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-rose/30 via-accent-lavender/30 to-accent-cyan/25 border border-white/10 flex-shrink-0 animate-[pulse_2.8s_ease-in-out_infinite]">
                  <AlertOctagon
                    className="w-7 h-7 text-white/95"
                    strokeWidth={1.9}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55 mb-1.5">
                    Gentle check-in
                  </p>
                  <h2
                    id="safety-title"
                    className="font-display text-2xl sm:text-[1.7rem] font-bold text-white leading-tight mb-2"
                  >
                    You are not alone in this.
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-white/75">
                    {message} Please take a slow breath and choose what feels
                    most supportive right now.
                  </p>
                </div>
              </div>
              <button
                onClick={onDismiss}
                aria-label="Dismiss"
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/55 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-7 pb-4 flex items-center gap-2.5 flex-wrap">
            <a
              href={`tel:${crisisPhone}`}
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-gradient-to-r from-accent-rose to-pink-500 text-white font-semibold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_24px_rgba(248,113,113,0.3)]"
            >
              <Phone className="w-4.5 h-4.5" />
              Call crisis line — {crisisPhone}
            </a>
            <span className="text-xs text-white/50">
              Free, confidential, 24/7 support
            </span>
          </div>

          <div className="px-7 pb-7 space-y-3">
            <OptionCard
              icon={HeartHandshake}
              title="Crisis resources"
              description="Immediate hotlines, chat lines, and text support in your region."
              onClick={onCrisisResources}
              tint="lavender"
            />
            <OptionCard
              icon={Wind}
              title="Safety breathing"
              description="A guided 2-minute grounding breathing exercise to calm the nervous system."
              onClick={onSafetyBreathing}
              tint="cyan"
            />
            <OptionCard
              icon={Stethoscope}
              title="Connect to professional care"
              description="Browse counsellors, therapists, and psychiatrists available today."
              onClick={onProfessionalCare}
              tint="green"
            />
          </div>

          <div className="px-7 pb-7 pt-1 flex items-center justify-end gap-3 flex-wrap border-t border-white/5">
            <Button
              variant="ghost"
              size="md"
              onClick={onDismiss}
              className="text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
            >
              I'm okay for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
