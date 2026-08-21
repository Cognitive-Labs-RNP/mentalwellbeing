import { useState } from 'react';
import { Menu, X, Heart, LogOut } from 'lucide-react';
import { NavbarDynamicTab } from './NavbarDynamicTab';
import { UrgentHelpButton } from './UrgentHelpButton';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { logout as supabaseLogout } from '@/services/auth';
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
  const navigate = useNavigate();

  const session = useAppStore((s) => s.session);
  const clearSession = useAppStore((s) => s.clearSession);

  const isGuest = session?.isDemo === true;
  const userUid = session?.uid ?? 'Guest';

  const handleAction = async () => {
    setIsMenuOpen(false);
    if (isGuest) {
      clearSession();
    } else {
      await supabaseLogout();
    }
    navigate('/auth/login', { replace: true });
  };

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

            {/* Session footer */}
            <div className="mx-3 mb-3 rounded-xl border border-surface-border bg-surface/40 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-surface-border">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-surface to-surface-hover border border-surface-border flex items-center justify-center flex-shrink-0">
                  <User className="h-3.5 w-3.5 text-text-secondary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={[
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        isGuest ? 'bg-accent-amber' : 'bg-accent-green',
                      ].join(' ')}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      {isGuest ? 'Guest Session' : 'Private Account'}
                    </p>
                  </div>
                  <p className="text-xs font-mono font-bold text-text-secondary truncate">
                    {userUid}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAction}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all text-left',
                  isGuest
                    ? 'text-accent-amber hover:bg-accent-amber/10'
                    : 'text-accent-rose hover:bg-accent-rose/10',
                ].join(' ')}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>{isGuest ? 'Exit Guest Mode' : 'Log out'}</span>
              </button>
            </div>

            <div className="p-4 border-t border-surface-border">
              <UrgentHelpButton variant="sidebar" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
