'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { cn } from '@/lib/utils';
import {
  Building,
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Camera,
  Key,
  Smartphone,
  Clock,
} from 'lucide-react';
import { SecuritySettings, SubscriptionSettings } from '@/components/settings';

type SettingsTab = 'facility' | 'profile' | 'security' | 'notifications' | 'team' | 'billing';

const tabs = [
  { id: 'facility' as const, label: 'Facility', icon: Building },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'team' as const, label: 'Team', icon: Users },
  { id: 'billing' as const, label: 'Billing', icon: CreditCard },
];

// Mock data
const mockFacility = {
  name: 'K9 Excellence Training',
  phone: '(301) 555-0000',
  email: 'info@k9excellence.com',
  website: 'www.k9excellence.com',
  address: '123 Training Lane',
  city: 'Waldorf',
  state: 'MD',
  zip: '20601',
  logo_url: null,
  timezone: 'America/New_York',
  business_hours: '8:00 AM - 6:00 PM',
};

const mockUser = {
  name: 'Sarah Johnson',
  email: 'sarah@k9excellence.com',
  phone: '(301) 555-1234',
  role: 'owner',
  avatar_url: null,
};

const mockTeam = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@k9excellence.com', role: 'owner', status: 'active' },
  { id: '2', name: 'John Smith', email: 'john@k9excellence.com', role: 'trainer', status: 'active' },
  { id: '3', name: 'Mike Wilson', email: 'mike@k9excellence.com', role: 'trainer', status: 'active' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('facility');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Facility form state
  const [facilityData, setFacilityData] = useState(mockFacility);
  const [facilityLogo, setFacilityLogo] = useState<string | null>(mockFacility.logo_url);

  // Profile form state
  const [profileData, setProfileData] = useState(mockUser);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(mockUser.avatar_url);

  // Notifications state
  const [notifications, setNotifications] = useState({
    email_daily_reports: true,
    email_new_booking: true,
    email_badge_earned: true,
    push_timer_alerts: true,
    push_activity_updates: false,
    push_new_photos: true,
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Settings saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your facility and account settings"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                        activeTab === tab.id
                          ? 'bg-brand-500/10 text-brand-400'
                          : 'text-surface-400 hover:text-white hover:bg-surface-800'
                      )}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Facility Settings */}
          {activeTab === 'facility' && (
            <>
              <Card>
                <CardHeader title="Facility Information" />
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <PhotoUpload
                      value={facilityLogo}
                      onChange={setFacilityLogo}
                      shape="square"
                      size="lg"
                      placeholder={
                        <div className="flex flex-col items-center">
                          <Building size={32} className="text-surface-500" />
                          <span className="text-xs text-surface-500 mt-2">Logo</span>
                        </div>
                      }
                    />
                    <div className="flex-1 space-y-4">
                      <Input
                        value={facilityData.name}
                        onChange={(e) =>
                          setFacilityData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        label="Facility Name"
                        leftIcon={<Building size={16} />}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          value={facilityData.phone}
                          onChange={(e) =>
                            setFacilityData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          label="Phone"
                          leftIcon={<Phone size={16} />}
                        />
                        <Input
                          value={facilityData.email}
                          onChange={(e) =>
                            setFacilityData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          label="Email"
                          leftIcon={<Mail size={16} />}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      value={facilityData.website}
                      onChange={(e) =>
                        setFacilityData((prev) => ({ ...prev, website: e.target.value }))
                      }
                      label="Website"
                      leftIcon={<Globe size={16} />}
                    />
                    <Input
                      value={facilityData.address}
                      onChange={(e) =>
                        setFacilityData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      label="Address"
                      leftIcon={<MapPin size={16} />}
                    />
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3">
                        <Input
                          value={facilityData.city}
                          onChange={(e) =>
                            setFacilityData((prev) => ({ ...prev, city: e.target.value }))
                          }
                          label="City"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          value={facilityData.state}
                          onChange={(e) =>
                            setFacilityData((prev) => ({ ...prev, state: e.target.value }))
                          }
                          label="State"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={facilityData.zip}
                          onChange={(e) =>
                            setFacilityData((prev) => ({ ...prev, zip: e.target.value }))
                          }
                          label="ZIP"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        value={facilityData.timezone}
                        onChange={(e) =>
                          setFacilityData((prev) => ({ ...prev, timezone: e.target.value }))
                        }
                        label="Timezone"
                        leftIcon={<Clock size={16} />}
                      />
                      <Input
                        value={facilityData.business_hours}
                        onChange={(e) =>
                          setFacilityData((prev) => ({ ...prev, business_hours: e.target.value }))
                        }
                        label="Business Hours"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  leftIcon={<Save size={16} />}
                  isLoading={isSubmitting}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader title="Your Profile" />
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <PhotoUpload
                      value={profileAvatar}
                      onChange={setProfileAvatar}
                      shape="circle"
                      size="lg"
                    />
                    <div className="flex-1 space-y-4">
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        label="Full Name"
                        leftIcon={<User size={16} />}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          label="Email"
                          leftIcon={<Mail size={16} />}
                        />
                        <Input
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          label="Phone"
                          leftIcon={<Phone size={16} />}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Security" />
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" leftIcon={<Key size={16} />}>
                      Change Password
                    </Button>
                    <Button variant="outline" leftIcon={<Smartphone size={16} />}>
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  leftIcon={<Save size={16} />}
                  isLoading={isSubmitting}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && <SecuritySettings />}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <>
              <Card>
                <CardHeader title="Email Notifications" />
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { key: 'email_daily_reports', label: 'Daily report summaries' },
                      { key: 'email_new_booking', label: 'New program bookings' },
                      { key: 'email_badge_earned', label: 'Badge achievements' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 cursor-pointer"
                      >
                        <span className="text-white">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-surface-600 bg-surface-700 text-brand-500 focus:ring-brand-500"
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Push Notifications" />
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { key: 'push_timer_alerts', label: 'Activity timer alerts' },
                      { key: 'push_activity_updates', label: 'Real-time activity updates' },
                      { key: 'push_new_photos', label: 'New photos uploaded' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 cursor-pointer"
                      >
                        <span className="text-white">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-surface-600 bg-surface-700 text-brand-500 focus:ring-brand-500"
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  leftIcon={<Save size={16} />}
                  isLoading={isSubmitting}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </>
          )}

          {/* Team Settings */}
          {activeTab === 'team' && (
            <>
              <Card>
                <CardHeader
                  title="Team Members"
                  action={
                    <Button variant="primary" size="sm">
                      Invite Member
                    </Button>
                  }
                />
                <CardContent>
                  <div className="space-y-3">
                    {mockTeam.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar name={member.name} size="md" />
                          <div>
                            <p className="font-medium text-white">{member.name}</p>
                            <p className="text-sm text-surface-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-lg bg-surface-700 text-sm text-surface-300 capitalize">
                            {member.role}
                          </span>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && <SubscriptionSettings />}
        </div>
      </div>
    </div>
  );
}
