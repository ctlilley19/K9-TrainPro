'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Dog,
  Home,
  FileText,
  Image,
  Award,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Activity,
  MessageSquare,
} from 'lucide-react';

// Mock user data for pet parent
const mockPetParent = {
  id: '1',
  name: 'John Anderson',
  email: 'anderson@email.com',
  avatar_url: null,
  family_name: 'Anderson Family',
  dogs: [
    { id: 'a', name: 'Max', photo_url: null },
    { id: 'b', name: 'Bella', photo_url: null },
  ],
};

const navItems = [
  { href: '/parent', label: 'Dashboard', icon: Home },
  { href: '/parent/feed', label: 'Live Feed', icon: Activity },
  { href: '/parent/dogs', label: 'My Dogs', icon: Dog },
  { href: '/parent/homework', label: 'Homework', icon: BookOpen },
  { href: '/parent/messages', label: 'Messages', icon: MessageSquare },
  { href: '/parent/reports', label: 'Daily Reports', icon: FileText },
  { href: '/parent/gallery', label: 'Photo Gallery', icon: Image },
  { href: '/parent/achievements', label: 'Achievements', icon: Award },
];

export default function PetParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = mockPetParent;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-900/95 backdrop-blur border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/parent" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Dog size={24} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">K9 TrainPro</span>
                <span className="text-xs text-surface-500 block -mt-1">Pet Parent Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href !== '/parent' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-surface-700">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 hover:bg-surface-700/50 border-b border-surface-700/50">
                          <p className="text-sm text-white">Max completed a training session!</p>
                          <p className="text-xs text-surface-500 mt-1">2 hours ago</p>
                        </div>
                        <div className="p-4 hover:bg-surface-700/50 border-b border-surface-700/50">
                          <p className="text-sm text-white">New photos added for Bella</p>
                          <p className="text-xs text-surface-500 mt-1">5 hours ago</p>
                        </div>
                        <div className="p-4 hover:bg-surface-700/50">
                          <p className="text-sm text-white">Daily report ready for Max</p>
                          <p className="text-xs text-surface-500 mt-1">Yesterday</p>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-surface-700 bg-surface-800/50">
                        <Link
                          href="/parent/notifications"
                          className="text-sm text-brand-400 hover:text-brand-300"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <Avatar name={user.name} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.family_name}</p>
                  </div>
                  <ChevronDown size={16} className="text-surface-500 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-surface-700">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-surface-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/parent/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-700 hover:text-white"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <button
                          onClick={() => {/* Handle logout */}}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-700 hover:text-white w-full"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-800 bg-surface-900">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href !== '/parent' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800'
                    )}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-500">
              © 2025 K9 TrainPro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/parent/help" className="text-sm text-surface-500 hover:text-white">
                Help & Support
              </Link>
              <Link href="/parent/privacy" className="text-sm text-surface-500 hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
