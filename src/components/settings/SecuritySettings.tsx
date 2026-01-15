'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import {
  getPinAuthState,
  getUserSessions,
  invalidateSession,
  invalidateAllSessions,
  type PinAuthState,
} from '@/services/supabase/pin-auth';
import { PinSetup } from '@/components/auth/PinSetup';
import {
  Key,
  Smartphone,
  Shield,
  Monitor,
  Trash2,
  AlertTriangle,
  Check,
  Clock,
  MapPin,
} from 'lucide-react';

interface Session {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  last_activity: string;
  last_full_login: string;
  is_active: boolean;
}

export function SecuritySettings() {
  const { user, isDemoModeActive } = useAuthStore();
  const [pinState, setPinState] = useState<PinAuthState | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showChangePinConfirm, setShowChangePinConfirm] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState<string | null>(null);

  // Load PIN state and sessions
  useEffect(() => {
    if (!user || isDemoModeActive) return;

    async function load() {
      const [state, userSessions] = await Promise.all([
        getPinAuthState(user!.id),
        getUserSessions(user!.id),
      ]);
      setPinState(state);
      setSessions(userSessions);
      setIsLoadingSessions(false);
    }

    load();
  }, [user, isDemoModeActive]);

  const handlePinSetupComplete = async () => {
    setShowPinSetup(false);
    if (user) {
      const state = await getPinAuthState(user.id);
      setPinState(state);
    }
  };

  const handleInvalidateSession = async (sessionId: string) => {
    setIsInvalidating(sessionId);
    const success = await invalidateSession(sessionId);
    if (success) {
      setSessions(sessions.filter((s) => s.id !== sessionId));
    }
    setIsInvalidating(null);
  };

  const handleInvalidateAllSessions = async () => {
    if (!user) return;
    setIsInvalidating('all');
    await invalidateAllSessions(user.id);
    setSessions([]);
    setIsInvalidating(null);
    // Redirect to login since all sessions are invalidated
    window.location.href = '/login?reason=sessions_cleared';
  };

  const formatLastActive = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  // Demo mode
  if (isDemoModeActive) {
    return (
      <Card>
        <CardHeader title="Security" subtitle="Manage your account security settings" />
        <CardContent>
          <div className="text-center py-8 text-surface-400">
            <Shield size={48} className="mx-auto mb-4 opacity-50" />
            <p>Security settings are disabled in demo mode</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PIN Setup Modal
  if (showPinSetup && user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface-900 rounded-2xl max-w-md w-full mx-4 overflow-hidden">
          <PinSetup
            userId={user.id}
            onComplete={handlePinSetupComplete}
            onSkip={() => setShowPinSetup(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PIN Settings */}
      <Card>
        <CardHeader
          title="Quick PIN Access"
          subtitle="Set up a PIN for faster, secure access to your account"
        />
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                pinState?.hasPin ? 'bg-green-500/20' : 'bg-surface-700'
              }`}>
                {pinState?.hasPin ? (
                  <Check className="text-green-400" size={24} />
                ) : (
                  <Key className="text-surface-400" size={24} />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {pinState?.hasPin ? 'PIN Enabled' : 'No PIN Set'}
                </p>
                <p className="text-surface-400 text-sm">
                  {pinState?.hasPin
                    ? 'You can use your PIN for quick access'
                    : 'Set up a PIN for faster login'}
                </p>
              </div>
            </div>
            <Button
              variant={pinState?.hasPin ? 'outline' : 'primary'}
              onClick={() => setShowPinSetup(true)}
            >
              {pinState?.hasPin ? 'Change PIN' : 'Set Up PIN'}
            </Button>
          </div>

          {pinState?.hasPin && (
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-400 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium">How PIN authentication works</p>
                  <ul className="mt-2 text-blue-200/80 space-y-1">
                    <li>• First login requires email & password</li>
                    <li>• Quick PIN access for the next 30 days</li>
                    <li>• Full re-authentication required every 90 days</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader
          title="Active Sessions"
          subtitle="Devices where you're currently signed in"
          action={
            sessions.length > 1 ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={() => setShowChangePinConfirm(true)}
                isLoading={isInvalidating === 'all'}
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                Sign out all
              </Button>
            ) : undefined
          }
        />
        <CardContent>
          {isLoadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
                  <div className="w-12 h-12 rounded-full bg-surface-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-surface-700 rounded" />
                    <div className="h-3 w-24 bg-surface-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-surface-400">
              <Monitor size={48} className="mx-auto mb-4 opacity-50" />
              <p>No active sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isCurrentDevice = session.device_id === localStorage.getItem('k9-device-id');
                const DeviceIcon = session.device_type === 'mobile' ? Smartphone : Monitor;

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      isCurrentDevice ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-surface-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrentDevice ? 'bg-brand-500/20' : 'bg-surface-700'
                      }`}>
                        <DeviceIcon className={isCurrentDevice ? 'text-brand-400' : 'text-surface-400'} size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">
                            {session.device_name || `${session.browser} on ${session.os}`}
                          </p>
                          {isCurrentDevice && (
                            <span className="px-2 py-0.5 text-xs bg-brand-500/20 text-brand-300 rounded-full">
                              This device
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-surface-400 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatLastActive(session.last_activity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isCurrentDevice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInvalidateSession(session.id)}
                        isLoading={isInvalidating === session.id}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        Sign out
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Sign Out All Modal */}
      {showChangePinConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sign out all devices?</h3>
                <p className="text-surface-400 text-sm">
                  This will sign you out from all devices including this one.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowChangePinConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleInvalidateAllSessions}
                isLoading={isInvalidating === 'all'}
              >
                Sign out all
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
