// Features Registry for Testing Portal
// Comprehensive list of all testable features organized by category

import type { FeatureDefinition } from '@/types/database';

export const FEATURE_CATEGORIES = [
  'Authentication',
  'Dashboard',
  'Dog Management',
  'Family Management',
  'Training Programs',
  'Reports',
  'Messaging',
  'Calendar & Booking',
  'Kennels',
  'Incidents',
  'Badges & Achievements',
  'Skills & Progress',
  'Comparisons',
  'Tags & NFC',
  'Settings',
  'Pet Parent Portal',
  'Admin Portal',
  'Billing',
  'Analytics',
  'Content & Media',
] as const;

export type FeatureCategory = typeof FEATURE_CATEGORIES[number];

export const FEATURES: FeatureDefinition[] = [
  // ============================================================================
  // Authentication
  // ============================================================================
  { id: 'auth.login', name: 'User Login', path: '/login', category: 'Authentication', description: 'Login form with email/password', file: 'src/app/(auth)/login/page.tsx' },
  { id: 'auth.register', name: 'User Registration', path: '/register', category: 'Authentication', description: 'New user signup flow', file: 'src/app/(auth)/register/page.tsx' },
  { id: 'auth.logout', name: 'User Logout', path: '/logout', category: 'Authentication', description: 'Logout and session termination' },
  { id: 'auth.admin.login', name: 'Admin Login', path: '/admin/login', category: 'Authentication', description: 'Admin portal login', file: 'src/app/(admin)/admin/login/page.tsx' },
  { id: 'auth.admin.mfa', name: 'Admin MFA', path: '/admin/mfa', category: 'Authentication', description: 'Multi-factor authentication verification', file: 'src/app/(admin)/admin/mfa/page.tsx' },
  { id: 'auth.admin.mfa-setup', name: 'Admin MFA Setup', path: '/admin/mfa-setup', category: 'Authentication', description: 'MFA setup and configuration', file: 'src/app/(admin)/admin/mfa-setup/page.tsx' },
  { id: 'auth.admin.change-password', name: 'Admin Change Password', path: '/admin/change-password', category: 'Authentication', description: 'Admin password change', file: 'src/app/(admin)/admin/change-password/page.tsx' },

  // ============================================================================
  // Dashboard
  // ============================================================================
  { id: 'dashboard.main', name: 'Dashboard Overview', path: '/dashboard', category: 'Dashboard', description: 'Main dashboard with activity summary', file: 'src/app/(dashboard)/dashboard/page.tsx' },
  { id: 'dashboard.analytics', name: 'Analytics Dashboard', path: '/analytics', category: 'Dashboard', description: 'Business analytics and metrics' },
  { id: 'dashboard.status-feed', name: 'Live Status Feed', path: '/status-feed', category: 'Dashboard', description: 'Real-time activity feed for dogs', file: 'src/app/(dashboard)/status-feed/page.tsx' },

  // ============================================================================
  // Dog Management
  // ============================================================================
  { id: 'dogs.list', name: 'Dogs List', path: '/dogs', category: 'Dog Management', description: 'View all dogs', file: 'src/app/(dashboard)/dogs/page.tsx' },
  { id: 'dogs.view', name: 'Dog Profile', path: '/dogs/[id]', category: 'Dog Management', description: 'View individual dog profile', file: 'src/app/(dashboard)/dogs/[id]/page.tsx' },
  { id: 'dogs.edit', name: 'Edit Dog', path: '/dogs/[id]/edit', category: 'Dog Management', description: 'Edit dog information', file: 'src/app/(dashboard)/dogs/[id]/edit/page.tsx' },
  { id: 'dogs.health', name: 'Dog Health Records', path: '/dogs/[id]/health', category: 'Dog Management', description: 'Health records and vaccinations', file: 'src/app/(dashboard)/dogs/[id]/health/page.tsx' },
  { id: 'dogs.skills', name: 'Dog Skills', path: '/dogs/[id]/skills', category: 'Dog Management', description: 'Skill assessments and progress', file: 'src/app/(dashboard)/dogs/[id]/skills/page.tsx' },

  // ============================================================================
  // Family Management
  // ============================================================================
  { id: 'families.list', name: 'Families List', path: '/families', category: 'Family Management', description: 'View all families' },
  { id: 'families.create', name: 'Create Family', path: '/families/new', category: 'Family Management', description: 'Add new family' },
  { id: 'families.view', name: 'Family Profile', path: '/families/[id]', category: 'Family Management', description: 'View family details' },
  { id: 'families.edit', name: 'Edit Family', path: '/families/[id]/edit', category: 'Family Management', description: 'Edit family information' },

  // ============================================================================
  // Training Programs
  // ============================================================================
  { id: 'programs.list', name: 'Programs List', path: '/programs', category: 'Training Programs', description: 'View all training programs' },
  { id: 'programs.create', name: 'Create Program', path: '/programs/new', category: 'Training Programs', description: 'Create new training program' },

  // ============================================================================
  // Reports
  // ============================================================================
  { id: 'reports.list', name: 'Reports List', path: '/reports', category: 'Reports', description: 'View all daily reports' },
  { id: 'reports.create', name: 'Create Report', path: '/reports/new', category: 'Reports', description: 'Create new daily report' },
  { id: 'reports.edit', name: 'Edit Report', path: '/reports/[id]/edit', category: 'Reports', description: 'Edit existing report' },

  // ============================================================================
  // Messaging
  // ============================================================================
  { id: 'messages.list', name: 'Messages List', path: '/messages', category: 'Messaging', description: 'View all conversations' },
  { id: 'messages.conversation', name: 'Conversation View', path: '/messages/[id]', category: 'Messaging', description: 'View and send messages' },

  // ============================================================================
  // Calendar & Booking
  // ============================================================================
  { id: 'calendar.view', name: 'Calendar View', path: '/calendar', category: 'Calendar & Booking', description: 'View calendar with stays and appointments' },
  { id: 'bookings.list', name: 'Bookings List', path: '/bookings', category: 'Calendar & Booking', description: 'View all bookings' },
  { id: 'bookings.public', name: 'Public Booking Page', path: '/book', category: 'Calendar & Booking', description: 'Public booking form' },

  // ============================================================================
  // Kennels
  // ============================================================================
  { id: 'kennels.management', name: 'Kennel Management', path: '/kennels', category: 'Kennels', description: 'View and manage kennel assignments' },

  // ============================================================================
  // Incidents
  // ============================================================================
  { id: 'incidents.list', name: 'Incidents List', path: '/incidents', category: 'Incidents', description: 'View all incidents' },
  { id: 'incidents.create', name: 'Report Incident', path: '/incidents/new', category: 'Incidents', description: 'Create new incident report' },

  // ============================================================================
  // Badges & Achievements
  // ============================================================================
  { id: 'badges.list', name: 'Badges List', path: '/badges', category: 'Badges & Achievements', description: 'View and manage badges' },
  { id: 'graduations.list', name: 'Graduations List', path: '/graduations', category: 'Badges & Achievements', description: 'View graduation ceremonies' },
  { id: 'graduations.create', name: 'Create Graduation', path: '/graduations/new', category: 'Badges & Achievements', description: 'Create graduation ceremony' },
  { id: 'graduations.view', name: 'View Graduation', path: '/graduations/[id]', category: 'Badges & Achievements', description: 'View graduation details' },

  // ============================================================================
  // Comparisons (Before/After)
  // ============================================================================
  { id: 'comparisons.list', name: 'Comparisons List', path: '/comparisons', category: 'Comparisons', description: 'View before/after comparisons' },
  { id: 'comparisons.create', name: 'Create Comparison', path: '/comparisons/new', category: 'Comparisons', description: 'Create new before/after comparison' },

  // ============================================================================
  // Tags & NFC
  // ============================================================================
  { id: 'tags.designs', name: 'Tag Designs', path: '/tags/designs', category: 'Tags & NFC', description: 'Browse and customize tag designs' },
  { id: 'tags.order', name: 'Order Tags', path: '/tags/order', category: 'Tags & NFC', description: 'Order new NFC tags' },
  { id: 'tags.scan', name: 'Tag Scan', path: '/tag/[code]', category: 'Tags & NFC', description: 'NFC tag scanning page' },

  // ============================================================================
  // Settings
  // ============================================================================
  { id: 'settings.general', name: 'User Settings - General', path: '/settings', category: 'Settings', description: 'General account settings', file: 'src/app/(dashboard)/settings/page.tsx', tab: 'General', section: 'Profile Info' },
  { id: 'settings.billing', name: 'User Settings - Billing', path: '/settings', category: 'Settings', description: 'Subscription and billing settings', file: 'src/app/(dashboard)/settings/page.tsx', tab: 'Billing', section: 'Subscription' },
  { id: 'settings.notifications', name: 'User Settings - Notifications', path: '/settings', category: 'Settings', description: 'Notification preferences', file: 'src/app/(dashboard)/settings/page.tsx', tab: 'Notifications' },
  { id: 'settings.security', name: 'User Settings - Security', path: '/settings', category: 'Settings', description: 'Security and password settings', file: 'src/app/(dashboard)/settings/page.tsx', tab: 'Security' },
  { id: 'settings.business-mode', name: 'Business Mode Settings', path: '/settings/business-mode', category: 'Settings', description: 'Configure business mode', file: 'src/app/(dashboard)/settings/business-mode/page.tsx' },

  // ============================================================================
  // Team Management
  // ============================================================================
  { id: 'team.list', name: 'Team List', path: '/team', category: 'Settings', description: 'View and manage team members' },
  { id: 'manager.dashboard', name: 'Manager Dashboard', path: '/manager', category: 'Settings', description: 'Manager overview' },
  { id: 'manager.trainers', name: 'Manage Trainers', path: '/manager/trainers', category: 'Settings', description: 'View and manage trainers' },
  { id: 'manager.assignments', name: 'Assignments', path: '/manager/assignments', category: 'Settings', description: 'View trainer assignments' },

  // ============================================================================
  // Content & Media
  // ============================================================================
  { id: 'content.library', name: 'Content Library', path: '/content', category: 'Content & Media', description: 'Video and content library' },

  // ============================================================================
  // Pet Parent Portal
  // ============================================================================
  { id: 'parent.dashboard', name: 'Parent Dashboard', path: '/parent', category: 'Pet Parent Portal', description: 'Parent portal home' },
  { id: 'parent.dogs', name: 'My Dogs', path: '/parent/dogs', category: 'Pet Parent Portal', description: 'View owned dogs' },
  { id: 'parent.dog-detail', name: 'Dog Detail', path: '/parent/dogs/[id]', category: 'Pet Parent Portal', description: 'View dog details' },
  { id: 'parent.reports', name: 'View Reports', path: '/parent/reports', category: 'Pet Parent Portal', description: 'View daily reports' },
  { id: 'parent.report-detail', name: 'Report Detail', path: '/parent/reports/[id]', category: 'Pet Parent Portal', description: 'View report details' },
  { id: 'parent.messages', name: 'Parent Messages', path: '/parent/messages', category: 'Pet Parent Portal', description: 'Message trainer' },
  { id: 'parent.homework', name: 'Homework', path: '/parent/homework', category: 'Pet Parent Portal', description: 'View and complete homework' },
  { id: 'parent.gallery', name: 'Photo Gallery', path: '/parent/gallery', category: 'Pet Parent Portal', description: 'View photos and videos' },
  { id: 'parent.achievements', name: 'Achievements', path: '/parent/achievements', category: 'Pet Parent Portal', description: 'View badges and certificates' },
  { id: 'parent.settings', name: 'Parent Settings', path: '/parent/settings', category: 'Pet Parent Portal', description: 'Parent account settings' },
  { id: 'parent.feed', name: 'Activity Feed', path: '/feed', category: 'Pet Parent Portal', description: 'Real-time activity feed' },

  // ============================================================================
  // Billing
  // ============================================================================
  { id: 'billing.overview', name: 'Billing Overview', path: '/billing', category: 'Billing', description: 'View billing dashboard with revenue, invoices, payments', file: 'src/app/(dashboard)/billing/page.tsx', section: 'Main Dashboard' },
  { id: 'billing.invoices', name: 'Billing - Invoices Table', path: '/billing', category: 'Billing', description: 'Invoices data table', file: 'src/app/(dashboard)/billing/page.tsx', section: 'Invoices Table' },
  { id: 'billing.revenue-chart', name: 'Billing - Revenue Chart', path: '/billing', category: 'Billing', description: 'Revenue trends chart', file: 'src/app/(dashboard)/billing/page.tsx', section: 'Revenue Chart' },
  { id: 'billing.new', name: 'New Payment', path: '/billing/new', category: 'Billing', description: 'Add new payment method', file: 'src/app/(dashboard)/billing/new/page.tsx' },

  // ============================================================================
  // Admin Portal
  // ============================================================================
  { id: 'admin.dashboard', name: 'Admin Dashboard', path: '/admin', category: 'Admin Portal', description: 'Admin command center' },
  { id: 'admin.analytics', name: 'Admin Analytics', path: '/admin/analytics', category: 'Admin Portal', description: 'Platform-wide analytics' },
  { id: 'admin.badges', name: 'Badge Review', path: '/admin/badges', category: 'Admin Portal', description: 'Review badge requests' },
  { id: 'admin.support', name: 'Support Queue', path: '/admin/support', category: 'Admin Portal', description: 'Support ticket queue' },
  { id: 'admin.support.ticket', name: 'Support Ticket Detail', path: '/admin/support/[id]', category: 'Admin Portal', description: 'View support ticket' },
  { id: 'admin.users', name: 'User Management', path: '/admin/users', category: 'Admin Portal', description: 'Search and manage users' },
  { id: 'admin.billing', name: 'Admin Billing', path: '/admin/billing', category: 'Admin Portal', description: 'Revenue and payments' },
  { id: 'admin.moderate', name: 'Content Moderation', path: '/admin/moderate', category: 'Admin Portal', description: 'Moderate user content' },
  { id: 'admin.system', name: 'System Health', path: '/admin/system', category: 'Admin Portal', description: 'System monitoring' },
  { id: 'admin.audit', name: 'Audit Log', path: '/admin/audit', category: 'Admin Portal', description: 'Activity audit log' },
  { id: 'admin.settings', name: 'Admin Settings', path: '/admin/settings', category: 'Admin Portal', description: 'System configuration' },
  { id: 'admin.testing', name: 'Testing Portal', path: '/admin/testing', category: 'Admin Portal', description: 'QA testing tools' },

  // ============================================================================
  // Landing & Marketing
  // ============================================================================
  { id: 'landing.hero', name: 'Landing Page - Hero', path: '/', category: 'Dashboard', description: 'Landing page hero section', file: 'src/app/page.tsx', section: 'Hero' },
  { id: 'landing.features', name: 'Landing Page - Features', path: '/', category: 'Dashboard', description: 'Landing page features section', file: 'src/app/page.tsx', section: 'Features' },
  { id: 'landing.pricing', name: 'Landing Page - Pricing', path: '/', category: 'Dashboard', description: 'Landing page pricing section', file: 'src/app/page.tsx', section: 'Pricing' },
  { id: 'landing.footer', name: 'Landing Page - Footer', path: '/', category: 'Dashboard', description: 'Landing page footer', file: 'src/app/page.tsx', section: 'Footer' },

  // ============================================================================
  // Demo & Legal
  // ============================================================================
  { id: 'demo.main', name: 'Demo Mode', path: '/demo', category: 'Settings', description: 'Demo mode landing', file: 'src/app/(dashboard)/demo/page.tsx' },
  { id: 'demo.config', name: 'Demo Config', path: '/demo/config', category: 'Settings', description: 'Demo configuration', file: 'src/app/(dashboard)/demo/config/page.tsx' },
  { id: 'legal.privacy', name: 'Privacy Policy', path: '/privacy', category: 'Settings', description: 'Privacy policy page', file: 'src/app/(legal)/privacy/page.tsx' },
  { id: 'legal.terms', name: 'Terms of Service', path: '/terms', category: 'Settings', description: 'Terms of service page', file: 'src/app/(legal)/terms/page.tsx' },
];

// Get features grouped by category
export function getFeaturesByCategory(): Record<string, FeatureDefinition[]> {
  const grouped: Record<string, FeatureDefinition[]> = {};

  for (const feature of FEATURES) {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  }

  return grouped;
}

// Get all unique categories
export function getAllCategories(): string[] {
  return [...new Set(FEATURES.map(f => f.category))];
}

// Get feature by ID
export function getFeatureById(id: string): FeatureDefinition | undefined {
  return FEATURES.find(f => f.id === id);
}

// Search features
export function searchFeatures(query: string): FeatureDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return FEATURES.filter(
    f =>
      f.name.toLowerCase().includes(lowercaseQuery) ||
      f.path.toLowerCase().includes(lowercaseQuery) ||
      f.category.toLowerCase().includes(lowercaseQuery) ||
      f.description?.toLowerCase().includes(lowercaseQuery)
  );
}
