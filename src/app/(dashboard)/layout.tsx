'use client';

import { AppLayout } from '@/components/layout';
import { DemoRoleSwitcher } from '@/components/demo/DemoRoleSwitcher';
import { AuthGuard } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
      <DemoRoleSwitcher />
    </AuthGuard>
  );
}
