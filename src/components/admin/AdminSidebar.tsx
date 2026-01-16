'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdmin, useAdminRole, canAccessModule, type AdminRole } from '@/stores/adminStore';
import {
  LayoutDashboard,
  BarChart3,
  Award,
  HeadphonesIcon,
  Users,
  CreditCard,
  Shield,
  Server,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TestTube2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  module: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, module: 'dashboard' },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} />, module: 'analytics' },
  { label: 'Badge Review', href: '/admin/badges', icon: <Award size={20} />, module: 'badges' },
  { label: 'Support', href: '/admin/support', icon: <HeadphonesIcon size={20} />, module: 'support' },
  { label: 'Users', href: '/admin/users', icon: <Users size={20} />, module: 'users' },
  { label: 'Billing', href: '/admin/billing', icon: <CreditCard size={20} />, module: 'billing' },
  { label: 'Moderation', href: '/admin/moderate', icon: <Shield size={20} />, module: 'moderate' },
  { label: 'System', href: '/admin/system', icon: <Server size={20} />, module: 'system' },
  { label: 'Audit Log', href: '/admin/audit', icon: <ScrollText size={20} />, module: 'audit' },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} />, module: 'settings' },
  { label: 'Testing', href: '/admin/testing', icon: <TestTube2 size={20} />, module: 'testing' },
];

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  support: 'Support Agent',
  moderator: 'Moderator',
  analytics: 'Analytics',
  billing: 'Billing Admin',
};

const roleColors: Record<AdminRole, string> = {
  super_admin: 'text-red-400 bg-red-500/10',
  support: 'text-blue-400 bg-blue-500/10',
  moderator: 'text-amber-400 bg-amber-500/10',
  analytics: 'text-green-400 bg-green-500/10',
  billing: 'text-purple-400 bg-purple-500/10',
};

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const admin = useAdmin();
  const role = useAdminRole();

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => canAccessModule(role, item.module));

  const handleLogout = () => {
    // Store handles logout
    const { logout } = require('@/stores/adminStore').useAdminStore.getState();
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface-900 border-r border-surface-800 z-40 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        !isOpen && 'hidden lg:flex'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-white">Admin Portal</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={cn(isActive && 'text-red-400')}>{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-surface-800 p-4">
        {/* Admin Profile */}
        {!isCollapsed && admin && (
          <div className="mb-4 p-3 bg-surface-800/50 rounded-lg">
            <p className="text-sm font-medium text-white truncate">{admin.name}</p>
            <p className="text-xs text-surface-500 truncate">{admin.email}</p>
            {role && (
              <span className={cn('inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium', roleColors[role])}>
                {roleLabels[role]}
              </span>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all',
            'text-surface-400 hover:text-red-400 hover:bg-red-500/10'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-full mt-4 p-2 rounded-lg text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
