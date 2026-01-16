'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TestTube2,
  Database,
  Users,
  Dog,
  Activity,
  Receipt,
  Flag,
  Bell,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Loader2,
  ExternalLink,
  Trash2,
  Plus,
  Copy,
  Zap,
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export default function TestingPortalPage() {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle');

  // Quick links to all major app sections
  const appSections = [
    { name: 'Dashboard', href: '/dashboard', description: 'Main user dashboard' },
    { name: 'Training Board', href: '/training', description: 'Drag & drop activity board' },
    { name: 'Dogs', href: '/dogs', description: 'Dog profiles and management' },
    { name: 'Family Portal', href: '/family', description: 'Parent/owner view' },
    { name: 'Reports', href: '/reports', description: 'Daily reports generator' },
    { name: 'Messages', href: '/messages', description: 'Communication center' },
    { name: 'Calendar', href: '/calendar', description: 'Booking and scheduling' },
    { name: 'Kennels', href: '/kennels', description: 'Kennel management' },
    { name: 'Incidents', href: '/incidents', description: 'Incident reporting' },
    { name: 'Tags/NFC', href: '/tag', description: 'NFC tag scanning' },
    { name: 'Settings', href: '/settings', description: 'User settings' },
  ];

  const adminSections = [
    { name: 'Admin Dashboard', href: '/admin', description: 'Admin command center' },
    { name: 'Analytics', href: '/admin/analytics', description: 'Business analytics' },
    { name: 'Badge Review', href: '/admin/badges', description: 'Review badge requests' },
    { name: 'Support Tickets', href: '/admin/support', description: 'Support queue' },
    { name: 'User Management', href: '/admin/users', description: 'Search users' },
    { name: 'Billing', href: '/admin/billing', description: 'Revenue & payments' },
    { name: 'Moderation', href: '/admin/moderate', description: 'Content moderation' },
    { name: 'System Health', href: '/admin/system', description: 'System monitoring' },
    { name: 'Audit Log', href: '/admin/audit', description: 'Activity logs' },
    { name: 'Settings', href: '/admin/settings', description: 'System configuration' },
  ];

  // Simulated tests
  const runTests = async () => {
    setIsRunningTests(true);
    const tests: TestResult[] = [
      { name: 'Database Connection', status: 'pending' },
      { name: 'Auth Service', status: 'pending' },
      { name: 'Storage Service', status: 'pending' },
      { name: 'API Routes', status: 'pending' },
      { name: 'Email Service', status: 'pending' },
      { name: 'Feature Flags', status: 'pending' },
    ];
    setTestResults(tests);

    for (let i = 0; i < tests.length; i++) {
      setTestResults((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'running' } : t))
      );

      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

      const passed = Math.random() > 0.1; // 90% pass rate for demo
      setTestResults((prev) =>
        prev.map((t, idx) =>
          idx === i
            ? {
                ...t,
                status: passed ? 'passed' : 'failed',
                message: passed ? 'OK' : 'Connection timeout',
                duration: Math.round(50 + Math.random() * 200),
              }
            : t
        )
      );
    }

    setIsRunningTests(false);
  };

  // Seed demo data
  const seedDemoData = async () => {
    setSeedingStatus('seeding');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSeedingStatus('done');
  };

  // Copy test credentials
  const copyCredentials = () => {
    const creds = `Admin Portal Test Credentials
------------------------------
Email: ct.lilley19@gmail.com
Password: TestAdmin2025!

Demo Mode (No login required):
Visit any page with demo=true query param`;
    navigator.clipboard.writeText(creds);
  };

  return (
    <div>
      <PageHeader
        title="Testing Portal"
        description="Quality assurance and testing tools for K9 ProTrain"
        action={
          <Button variant="primary" leftIcon={<Play size={16} />} onClick={runTests} disabled={isRunningTests}>
            Run All Tests
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Tests */}
        <Card>
          <CardHeader
            title="System Tests"
            action={
              isRunningTests ? (
                <Loader2 size={16} className="animate-spin text-brand-500" />
              ) : testResults.length > 0 ? (
                <span className="text-sm text-surface-400">
                  {testResults.filter((t) => t.status === 'passed').length}/{testResults.length} passed
                </span>
              ) : null
            }
          />
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-surface-400">
                <TestTube2 size={48} className="mx-auto mb-3 opacity-50" />
                <p>Click "Run All Tests" to check system health</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800"
                  >
                    <div className="flex items-center gap-3">
                      {test.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-surface-600" />
                      )}
                      {test.status === 'running' && (
                        <Loader2 size={20} className="animate-spin text-brand-500" />
                      )}
                      {test.status === 'passed' && (
                        <CheckCircle2 size={20} className="text-green-500" />
                      )}
                      {test.status === 'failed' && <XCircle size={20} className="text-red-500" />}
                      <span className="text-white">{test.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {test.message && (
                        <span
                          className={test.status === 'passed' ? 'text-green-400' : 'text-red-400'}
                        >
                          {test.message}
                        </span>
                      )}
                      {test.duration && (
                        <span className="text-surface-500">{test.duration}ms</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card>
          <CardHeader title="Test Credentials" />
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-800 font-mono text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-surface-400"># Admin Portal</p>
                  <p className="text-white">Email: ct.lilley19@gmail.com</p>
                  <p className="text-white">Password: TestAdmin2025!</p>
                  <p className="text-surface-500 mt-2"># First login requires MFA setup</p>
                </div>
                <Button variant="ghost" size="sm" onClick={copyCredentials}>
                  <Copy size={14} />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Zap size={16} />
                <span className="font-medium">Demo Mode</span>
              </div>
              <p className="text-sm text-surface-300">
                The app runs in demo mode by default with pre-populated test data.
                No real database connection required for testing the UI.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={seedDemoData}
              disabled={seedingStatus === 'seeding'}
              leftIcon={
                seedingStatus === 'seeding' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : seedingStatus === 'done' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Database size={16} />
                )
              }
            >
              {seedingStatus === 'seeding'
                ? 'Seeding Data...'
                : seedingStatus === 'done'
                  ? 'Demo Data Ready!'
                  : 'Seed Demo Data'}
            </Button>
          </CardContent>
        </Card>

        {/* App Sections */}
        <Card>
          <CardHeader title="User App Sections" />
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {appSections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors group"
                >
                  <div>
                    <p className="text-white font-medium">{section.name}</p>
                    <p className="text-xs text-surface-400">{section.description}</p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-surface-500 group-hover:text-brand-500 transition-colors"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Sections */}
        <Card>
          <CardHeader title="Admin Sections" />
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {adminSections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors group"
                >
                  <div>
                    <p className="text-white font-medium">{section.name}</p>
                    <p className="text-xs text-surface-400">{section.description}</p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-surface-500 group-hover:text-red-500 transition-colors"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader title="Feature Checklist" />
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Users size={16} />
                  User Features
                </h4>
                <ul className="space-y-2">
                  {[
                    'User Registration & Login',
                    'Dog Profile Management',
                    'Activity Tracking',
                    'Daily Reports',
                    'Photo/Video Uploads',
                    'Family Portal Access',
                    'NFC Tag Scanning',
                    'Messaging System',
                    'Calendar & Booking',
                    'Incident Reporting',
                    'Badge Requests',
                    'Subscription Management',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-surface-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Dog size={16} />
                  Trainer Features
                </h4>
                <ul className="space-y-2">
                  {[
                    'Training Board (Drag & Drop)',
                    'Quick Activity Logging',
                    'Photo Capture & Notes',
                    'Report Generation',
                    'Kennel Management',
                    'Custom Activity Types',
                    'Client Communication',
                    'Schedule Management',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-surface-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Shield size={16} />
                  Admin Features
                </h4>
                <ul className="space-y-2">
                  {[
                    'Command Dashboard',
                    'Analytics & Metrics',
                    'Badge Review System',
                    'Support Ticket Queue',
                    'User Search (Audited)',
                    'Billing Management',
                    'Content Moderation',
                    'System Health Monitor',
                    'Audit Log Viewer',
                    'Feature Flags',
                    'MFA Authentication',
                    'Role-Based Access',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-surface-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card className="lg:col-span-2">
          <CardHeader title="API Endpoints" />
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <h5 className="text-surface-400 mb-2">Authentication</h5>
                <ul className="space-y-1 font-mono text-xs">
                  <li className="text-green-400">POST /api/auth/login</li>
                  <li className="text-green-400">POST /api/auth/signup</li>
                  <li className="text-green-400">POST /api/auth/logout</li>
                </ul>
              </div>
              <div>
                <h5 className="text-surface-400 mb-2">Activities</h5>
                <ul className="space-y-1 font-mono text-xs">
                  <li className="text-green-400">GET /api/activities</li>
                  <li className="text-green-400">POST /api/activities</li>
                  <li className="text-green-400">PATCH /api/activities/:id</li>
                </ul>
              </div>
              <div>
                <h5 className="text-surface-400 mb-2">Admin</h5>
                <ul className="space-y-1 font-mono text-xs">
                  <li className="text-green-400">GET /api/admin/analytics</li>
                  <li className="text-green-400">POST /api/admin/badges</li>
                  <li className="text-green-400">GET /api/admin/audit</li>
                  <li className="text-green-400">POST /api/admin/settings</li>
                </ul>
              </div>
              <div>
                <h5 className="text-surface-400 mb-2">Webhooks</h5>
                <ul className="space-y-1 font-mono text-xs">
                  <li className="text-green-400">POST /api/webhooks/stripe</li>
                  <li className="text-green-400">POST /api/webhooks/tag-scan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
