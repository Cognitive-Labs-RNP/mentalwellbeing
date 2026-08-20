import { Outlet, NavLink, useParams } from 'react-router-dom'
import { Heart, Wrench, Music } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function ConditionHub() {
  const { conditionId } = useParams()

  const tabs = [
    {
      to: `/${conditionId ?? 'condition'}/immediate-support`,
      label: 'Immediate Support',
      icon: Heart,
    },
    {
      to: `/${conditionId ?? 'condition'}/tools`,
      label: 'Tools',
      icon: Wrench,
    },
    {
      to: `/${conditionId ?? 'condition'}/sounds`,
      label: 'Sounds',
      icon: Music,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/20 border border-surface-border/60">
              <Heart className="w-6 h-6 text-accent-lavender" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Condition Support Hub
              </p>
              <h2 className="font-display text-2xl font-semibold text-text-primary capitalize">
                {conditionId ?? 'Support'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed ml-14">
            Tailored support, resources, and tools for this experience.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="flex gap-2 p-1.5 bg-bg-primary/50 rounded-2xl border border-surface-border/60 backdrop-blur-sm overflow-x-auto">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end
                className={({ isActive }) => `
                  group relative flex-1 min-w-[140px] flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${isActive
                    ? 'bg-gradient-to-r from-accent-lavender/25 to-accent-cyan/20 text-text-primary border border-accent-lavender/30 shadow-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 border border-transparent hover:border-surface-border'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <tab.icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-accent-lavender' : 'text-text-muted group-hover:text-accent-lavender'}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-gradient-to-r from-accent-lavender to-accent-cyan shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </Card>

      <Outlet />
    </div>
  )
}
