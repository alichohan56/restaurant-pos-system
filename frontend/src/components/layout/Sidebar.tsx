import { ChevronsLeft, UtensilsCrossed } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navigation';

interface NavLinksProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export function NavLinks({ collapsed, onNavigate }: NavLinksProps) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          aria-label={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            [
              'flex items-center rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:focus-visible:ring-white/20',
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
              isActive
                ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10 dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ].join(' ')
          }
        >
          <item.icon
            className="h-[18px] w-[18px] shrink-0"
            aria-hidden="true"
            strokeWidth={1.8}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className={[
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-out lg:flex dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-[250px]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4',
        ].join(' ')}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              RestroPOS
            </p>
            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
              Restaurant Management
            </p>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <NavLinks collapsed={collapsed} />
      </div>

      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'flex w-full items-center rounded-xl text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-white/20',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          ].join(' ')}
        >
          <ChevronsLeft
            className={[
              'h-[18px] w-[18px] shrink-0 transition-transform duration-300',
              collapsed ? 'rotate-180' : '',
            ].join(' ')}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
