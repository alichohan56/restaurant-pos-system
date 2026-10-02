import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileSidebar from '../components/layout/MobileSidebar';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);

  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((previous) => !previous)}
      />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((previous) => !previous)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
