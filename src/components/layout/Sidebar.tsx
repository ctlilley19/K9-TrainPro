'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useUserRole } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import {
  LayoutDashboard,
  Dog,
  Users,
  Calendar,
  Award,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  BarChart3,
  Home,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Training Board',
    href: '/training',
    icon: <ClipboardList size={20} />,
    roles: ['owner', 'admin', 'trainer'],
  },
  {
    label: 'Dogs',
    href: '/dogs',
    icon: <Dog size={20} />,
  },
  {
    label: 'Families',
    href: '/families',
    icon: <Users size={20} />,
    roles: ['owner', 'admin', 'trainer'],
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: <Calendar size={20} />,
  },
  {
    label: 'Badges',
    href: '/badges',
    icon: <Award size={20} />,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <FileText size={20} />,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 size={20} />,
    roles: ['owner', 'admin'],
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings size={20} />,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const user = useUser();
  const userRole = useUserRole();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-surface-900 border-r border-surface-800',
        'flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Dog size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              K9 TrainPro
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-surface-800',
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-surface-400 hover:text-white',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn(isActive && 'text-brand-400')}>{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-surface-800">
        {/* Bottom Nav Items */}
        <div className="py-2 px-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-surface-800',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-surface-400 hover:text-white',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-surface-800">
          <div
            className={cn(
              'flex items-center gap-3',
              isCollapsed && 'justify-center'
            )}
          >
            <Avatar
              src={user?.avatar_url}
              name={user?.name}
              size="sm"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-surface-500 truncate capitalize">
                  {userRole || 'Member'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center justify-center py-3',
            'text-surface-500 hover:text-white hover:bg-surface-800',
            'transition-colors duration-200 border-t border-surface-800'
          )}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}
