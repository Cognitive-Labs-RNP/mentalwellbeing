import { Card } from '../../components/shared/Card';
import { NavLink } from 'react-router-dom';

export default function Tools() {
  return (
    <Card
      title="Tools"
      subtitle="Evidence-based tools to support your wellbeing"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        <NavLink
          to="/tools/mood-check"
          className="min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender flex items-center justify-center text-center"
        >
          Mood Check
        </NavLink>
        <NavLink
          to="/tools/cognitive-load"
          className="min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender flex items-center justify-center text-center"
        >
          Cognitive Load
        </NavLink>
        <NavLink
          to="/tools/lifestyle"
          className="min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender flex items-center justify-center text-center"
        >
          Lifestyle
        </NavLink>
        <NavLink
          to="/tools/calm"
          className="min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender flex items-center justify-center text-center"
        >
          Calm
        </NavLink>
        <NavLink
          to="/tools/sleep"
          className="min-h-[56px] px-3 py-2 rounded-xl bg-surface text-text-secondary text-xs font-medium hover:bg-surface-hover hover:text-text-primary border border-surface-border transition-colors data-[active=true]:bg-accent-lavender/20 data-[active=true]:text-accent-lavender flex items-center justify-center text-center col-span-2 sm:col-span-1"
        >
          Sleep
        </NavLink>
      </div>
    </Card>
  );
}
