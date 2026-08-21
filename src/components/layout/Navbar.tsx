import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Wrench,
  BookOpen,
  LineChart,
  Sparkles,
  User,
  Heart,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { logout as supabaseLogout } from '@/services/auth';

const navLinks = [
  { id: 'home', to: '/', label: 'Home', icon: Home },
  { id: 'analysis', to: '/analysis', label: 'Analysis', icon: Search },
  { id: 'tools', to: '/tools', label: 'Tools', icon: Wrench },
  { id: 'journal', to: '/journal', label: 'Journal & Journey', icon: BookOpen },
  { id: 'insights', to: '/insights', label: 'Insights', icon: LineChart },
];

function isActiveLink(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

export function Navbar() {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const session = useAppStore((s) => s.session);
  const clearSession = useAppStore((s) => s.clearSession);
  const navigate = useNavigate();

  // isDemo is the only authoritative guest flag.
  // The legacy `account` field is not used here because it can be non-null
  // for real users who signed up before the Supabase migration.
  const isGuest = session?.isDemo === true;
  const userUid = session?.uid ?? 'Guest';

  const handleAction = async () => {
    setProfileOpen(false);
    if (isGuest) {
      clearSession();
    } else {
      await supabaseLogout();
    }
    // Explicit redirect — defensive in case ProtectedRoute re-render is delayed.
    navigate('/auth/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-bg-primary/80 border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-lavender/25 to-accent-cyan/25 flex items-center justify-center border border-surface-border group-hover:border-accent-lavender/40 transition-all">
            <Heart className="h-4.5 w-4.5 text-accent-lavender" strokeWidth={2.2} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-base text-text-primary leading-tight">
              Wellbeing Hub
            </h1>
            <p className="text-[11px] text-text-muted leading-none">Private &amp; safe</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.to, location.pathname);
            return (
              <NavLink
                key={link.id}
                to={link.to}
                className={[
                  'relative flex items-center gap-2 min-h-[40px] px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender/40',
                  isActive
                    ? 'text-accent-lavender bg-accent-lavender/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-accent-lavender"
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="hidden sm:flex items-center justify-center h-10 w-10 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 transition-all relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-rose" />
          </button>

          <Link
            to="/tool-settings"
            aria-label="Tool settings"
            className="flex items-center justify-center h-10 w-10 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 transition-all"
          >
            <Settings className="h-4.5 w-4.5" />
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label={isGuest ? 'Profile menu — guest session active' : 'Profile menu'}
              aria-expanded={profileOpen}
              className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-surface to-surface-hover border border-surface-border hover:border-accent-lavender/30 transition-all overflow-hidden"
            >
              <User className="h-4.5 w-4.5 text-text-secondary" />
              {/* Session-status indicator dot */}
              <span
                aria-hidden="true"
                title={isGuest ? 'Guest session' : 'Logged in'}
                className={[
                  'absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-bg-primary',
                  isGuest ? 'bg-accent-amber' : 'bg-accent-green',
                ].join(' ')}
              />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-56 glass rounded-2xl p-2 shadow-glow animate-slide-up">
                  <div className="px-3 py-2 border-b border-surface-border mb-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
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
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 transition-all"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/tool-settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Tool Settings</span>
                  </Link>
                  <div className="h-px bg-surface-border my-1" />
                  <button
                    type="button"
                    onClick={handleAction}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent-rose hover:bg-accent-rose/10 transition-all text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isGuest ? 'Exit Guest Mode' : 'Log out'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
