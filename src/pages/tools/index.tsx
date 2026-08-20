import { Card } from '../../components/shared/Card';
import { NavLink } from 'react-router-dom';

const TOOL_LINKS = [
  { to: '/tools/mood-check',     label: 'Mood Check' },
  { to: '/tools/cognitive-load', label: 'Cognitive Load' },
  { to: '/tools/lifestyle',      label: 'Lifestyle' },
  { to: '/tools/calm',           label: 'Calm' },
  { to: '/tools/sleep',          label: 'Sleep' },
  { to: '/tools/sounds',         label: 'Sound Library' },
];

const linkClass =
  'min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium ' +
  'hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors ' +
  'data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender ' +
  'flex items-center justify-center text-center';

export default function Tools() {
  return (
    <Card
      title="Tools"
      subtitle="Evidence-based tools to support your wellbeing"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {TOOL_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>
    </Card>
  );
}
