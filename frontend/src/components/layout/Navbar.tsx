import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, PanelLeft, Search, Settings, User as UserIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import ThemeToggle from './ThemeToggle';
import { findNavItem } from './navigation';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return initials || '?';
}

export default function Navbar({
  collapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = findNavItem(location.pathname)?.label ?? 'Dashboard';

  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/85">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <Menu className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 lg:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <PanelLeft className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-white">
          {title}
        </h1>
      </div>

      <div className="relative hidden md:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search..."
          className="h-9 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:w-56 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 lg:w-56 lg:focus:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:bg-slate-900 dark:focus:ring-white/10"
        />
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      <ThemeToggle />

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 pl-1 pr-2 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
              {getInitials(user.name)}
            </span>
            <span className="hidden min-w-0 flex-col items-start leading-tight xl:flex">
              <span className="max-w-[120px] truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                {user.name}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {user.role}
              </span>
            </span>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform xl:block ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                <span className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {user.role}
                </span>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <UserIcon className="h-4 w-4" aria-hidden="true" />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Account Settings
                </button>
              </div>

              <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
