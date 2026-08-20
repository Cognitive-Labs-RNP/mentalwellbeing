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
import { NavbarDynamicTab } from './NavbarDynamicTab';

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
  { id: 'recommendations', to: '/recommendations', label: 'Recs', icon: <UserSearch className="h-5 w-5" /> },
  { id: 'profile', to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

function getBottomNavLinks(): NavLinkItem[] {
  const links = [...baseNavLinks];
  const dynamicTab = NavbarDynamicTab();

  if (dynamicTab) {
    const dynamicItem: NavLinkItem = {
      id: dynamicTab.id,
      to: dynamicTab.to,
      label: dynamicTab.label.length > 8 ? 'Condition' : dynamicTab.label,
      icon: dynamicTab.icon,
    };
    links.splice(3, 0, dynamicItem);
  }

  return links.slice(0, 6);
}

function isActiveLink(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

export function BottomNav() {
  const location = useLocation();
  const navLinks = getBottomNavLinks();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-surface-border"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-flow-col auto-cols-fr">
        {navLinks.map((link) => {
          const isActive = isActiveLink(link.to, location.pathname);
          return (
            <li key={link.id}>
              <NavLink
                to={link.to}
                className={[
                  'relative flex flex-col items-center justify-center gap-1 min-h-[60px] px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lavender/40 focus:ring-inset',
                  isActive ? 'text-accent-lavender' : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
              >
                <span className="relative flex items-center justify-center">
                  {link.icon}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent-lavender"
                    />
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none truncate max-w-full">
                  {link.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div
        aria-hidden="true"
        className="h-[env(safe-area-inset-bottom,0px)]"
      />
    </nav>
  );
}
