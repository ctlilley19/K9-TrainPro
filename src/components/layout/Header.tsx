'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFacility, useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const user = useUser();
  const facility = useFacility();
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
          )}

          {/* Search */}
          <div className="hidden sm:block w-64 lg:w-80">
            <Input
              placeholder="Search dogs, families..."
              leftIcon={<Search size={16} />}
              className="h-9 bg-surface-800/50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 animate-scale-in">
                  <div className="p-3 border-b border-surface-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="p-4 text-center text-surface-400 text-sm">
                    No new notifications
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                'hover:bg-surface-800 transition-colors duration-200'
              )}
            >
              <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-surface-500">
                  {facility?.name || 'Facility'}
                </p>
              </div>
              <ChevronDown size={16} className="text-surface-500 hidden md:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 animate-scale-in overflow-hidden">
                  {/* User Info */}
                  <div className="p-3 border-b border-surface-700">
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-surface-400">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-surface-700 py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-surface-700 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
