import { useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { NavbarDynamicTab } from './NavbarDynamicTab';
import { UrgentHelpButton } from './UrgentHelpButton';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Wrench,
  BookOpen,
  LineChart,
  UserSearch,
  User,
} from 'lucide-react';

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
  { id: 'journal', to: '/journal', label: 'Journal', icon: <BookOpen className="h-5 w-5" /> },
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

export function MobileTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navLinks = getNavLinks();

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 glass border-b border-surface-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            className="min-h-[44px] min-w-[44px] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-lavender/20 to-accent-cyan/20 flex items-center justify-center border border-surface-border">
              <Heart className="h-4 w-4 text-accent-lavender" />
            </div>
            <span className="font-display font-semibold text-text-primary">Wellbeing Hub</span>
          </div>

          <UrgentHelpButton variant="topbar" />
        </div>
      </header>

      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] glass border-r border-surface-border animate-slide-up overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-lavender/20 to-accent-cyan/20 flex items-center justify-center border border-surface-border">
                  <Heart className="h-5 w-5 text-accent-lavender" />
                </div>
                <span className="font-display font-bold text-text-primary">Wellbeing Hub</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-3">
              <ul className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = isActiveLink(link.to, location.pathname);
                  return (
                    <li key={link.id}>
                      <NavLink
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={[
                          'relative flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender/40',
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
                            'flex-shrink-0',
                            isActive ? 'text-accent-lavender' : 'text-text-muted',
                          ].join(' ')}
                        >
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-surface-border">
              <UrgentHelpButton variant="sidebar" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
