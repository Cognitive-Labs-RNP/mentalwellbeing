import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Wrench,
  BookOpen,
  LineChart,
  UserSearch,
  User,
  Heart,
} from 'lucide-react';
import { NavbarDynamicTab } from './NavbarDynamicTab';
import { UrgentHelpButton } from './UrgentHelpButton';

interface NavLinkItem {
  id: string;
  to: string;
  label: string;
  icon: React.ReactNode;
}

const baseNavLinks: NavLinkItem[] = [
  { id: 'home', to: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'analysis', to: '/analysis', label: 'Analysis', icon: <Search className="h-5 w-5" /> },
  { id: 'tools', to: '/tools', label: 'Tools', icon: <Wrench className="h-5 w-5" /> },
  { id: 'journal', to: '/journal', label: 'Journal & Journey', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'insights', to: '/insights', label: 'Insights', icon: <LineChart className="h-5 w-5" /> },
  { id: 'recommendations', to: '/recommendations', label: 'Recommendations', icon: <UserSearch className="h-5 w-5" /> },
  { id: 'profile', to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

function getNavLinks(): NavLinkItem[] {
  const dynamicTab = NavbarDynamicTab();
  if (!dynamicTab) return baseNavLinks;

  const analysisIndex = baseNavLinks.findIndex((l) => l.id === 'analysis');
  const toolsIndex = baseNavLinks.findIndex((l) => l.id === 'tools');

  const dynamicItem: NavLinkItem = {
    id: dynamicTab.id,
    to: dynamicTab.to,
    label: dynamicTab.label,
    icon: dynamicTab.icon,
  };

  return [
    ...baseNavLinks.slice(0, analysisIndex + 1),
    dynamicItem,
    ...baseNavLinks.slice(toolsIndex),
  ];
}

function isActiveLink(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

export function Sidebar() {
  const location = useLocation();
  const navLinks = getNavLinks();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col glass border-r border-surface-border z-20"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-lavender/20 to-accent-cyan/20 flex items-center justify-center border border-surface-border">
          <Heart className="h-5 w-5 text-accent-lavender" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-text-primary leading-tight">
            Wellbeing Hub
          </h1>
          <p className="text-xs text-text-muted">Private &amp; safe</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.to, location.pathname);
            return (
              <li key={link.id}>
                <NavLink
                  to={link.to}
                  className={[
                    'group relative flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender/40',
                    isActive
                      ? 'text-accent-lavender bg-accent-lavender/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
                  ].join(' ')}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent-lavender"
                    />
                  )}
                  <span
                    className={[
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-accent-lavender' : 'text-text-muted group-hover:text-text-secondary',
                    ].join(' ')}
                  >
                    {link.icon}
                  </span>
                  <span className="truncate">{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-surface-border">
        <UrgentHelpButton variant="sidebar" />
      </div>
    </aside>
  );
}
