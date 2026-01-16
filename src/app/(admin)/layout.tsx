'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthGuard, AdminSidebar, AdminHeader } from '@/components/admin';

// Pages that don't require full admin layout (auth pages with simple layout)
const authPages = ['/admin/login', '/admin/mfa', '/admin/mfa-setup', '/admin/change-password'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auth pages have their own simpler layout
  if (authPages.includes(pathname)) {
    return (
      <div className="min-h-screen bg-surface-950">
        {children}
      </div>
    );
  }

  // Protected pages get full admin layout
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-surface-950">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="lg:pl-64 min-h-screen flex flex-col">
          <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
