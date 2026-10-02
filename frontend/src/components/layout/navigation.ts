import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Tags,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'POS', path: '/pos', icon: UtensilsCrossed },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Tags },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Employees', path: '/employees', icon: UserCog },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Expenses', path: '/expenses', icon: Wallet },
  { label: 'Reports', path: '/reports', icon: TrendingUp },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.path === pathname);
}
