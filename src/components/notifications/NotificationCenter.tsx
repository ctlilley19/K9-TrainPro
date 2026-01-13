'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Dog,
  Award,
  FileText,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Settings,
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  category: 'activity' | 'badge' | 'report' | 'timer' | 'system';
  title: string;
  message: string;
  dog_id?: string;
  dog_name?: string;
  link?: string;
  created_at: string;
  read: boolean;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    category: 'timer',
    title: 'Timer Alert',
    message: 'Rocky has been in kennel for over 3 hours',
    dog_id: 'd',
    dog_name: 'Rocky',
    link: '/training',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    category: 'badge',
    title: 'Badge Earned!',
    message: 'Max earned the Gold Sit Master badge',
    dog_id: 'a',
    dog_name: 'Max',
    link: '/dogs/a',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'info',
    category: 'report',
    title: 'Daily Report Ready',
    message: "Bella's daily report has been generated",
    dog_id: 'b',
    dog_name: 'Bella',
    link: '/reports',
    created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    read: false,
  },
  {
    id: '4',
    type: 'warning',
    category: 'activity',
    title: 'Potty Reminder',
    message: "Luna hasn't had a potty break in 2 hours",
    dog_id: 'c',
    dog_name: 'Luna',
    link: '/training',
    created_at: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    read: true,
  },
  {
    id: '5',
    type: 'info',
    category: 'system',
    title: 'New Family Added',
    message: 'Thompson Family has been added to your facility',
    link: '/families',
    created_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    read: true,
  },
];

const typeIcons = {
  info: <Info size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  alert: <AlertCircle size={16} />,
};

const typeColors = {
  info: 'text-blue-400 bg-blue-500/10',
  success: 'text-green-400 bg-green-500/10',
  warning: 'text-yellow-400 bg-yellow-500/10',
  alert: 'text-red-400 bg-red-500/10',
};

const categoryIcons = {
  activity: <Clock size={14} />,
  badge: <Award size={14} />,
  report: <FileText size={14} />,
  timer: <AlertCircle size={14} />,
  system: <Info size={14} />,
};

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter((n) => !n.read);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className={cn(
                    'text-xs px-2 py-1 rounded transition-colors',
                    filter === 'unread'
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-surface-400 hover:text-white'
                  )}
                >
                  {filter === 'all' ? 'Show Unread' : 'Show All'}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-surface-400 hover:text-white"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell size={32} className="mx-auto text-surface-600 mb-3" />
                  <p className="text-surface-400">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative group',
                      !notification.read && 'bg-surface-800/50'
                    )}
                  >
                    <Link
                      href={notification.link || '#'}
                      onClick={() => {
                        markAsRead(notification.id);
                        setIsOpen(false);
                      }}
                      className="flex gap-3 p-4 hover:bg-surface-700/50 transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          typeColors[notification.type]
                        )}
                      >
                        {typeIcons[notification.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <p className="text-sm text-surface-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-surface-500">
                            {formatDate(notification.created_at, 'relative')}
                          </span>
                          {notification.dog_name && (
                            <>
                              <span className="text-surface-600">•</span>
                              <span className="text-xs text-surface-500 flex items-center gap-1">
                                <Dog size={10} />
                                {notification.dog_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Actions (on hover) */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            markAsRead(notification.id);
                          }}
                          className="p-1 rounded hover:bg-surface-600 text-surface-400 hover:text-white"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 rounded hover:bg-surface-600 text-surface-400 hover:text-red-400"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700 bg-surface-800/50">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-brand-400 hover:text-brand-300"
                >
                  View all notifications
                </Link>
                <button
                  onClick={clearAll}
                  className="text-xs text-surface-500 hover:text-surface-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Notification toast for real-time updates
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-80 p-4 rounded-xl border shadow-xl',
        'bg-surface-800 border-surface-700',
        'animate-in slide-in-from-right-full duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            typeColors[notification.type]
          )}
        >
          {typeIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white">{notification.title}</p>
          <p className="text-sm text-surface-400 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-surface-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      {notification.link && (
        <Link
          href={notification.link}
          onClick={onClose}
          className="mt-3 block text-sm text-brand-400 hover:text-brand-300"
        >
          View details →
        </Link>
      )}
    </div>
  );
}
