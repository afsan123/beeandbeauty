'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.tsx';
import { AdminUIProvider, useAdminUI } from '../../components/admin/AdminUIContext.tsx';
import type { AdminUser } from '../../lib/services/adminAuth.ts';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useAdminUI();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [telemetryCounts, setTelemetryCounts] = useState({
    pendingOrders: 0,
    openInquiries: 0,
  });

  const isLoginPage = pathname === '/admin/login';

  // Check authentication session on mount / path change
  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    let isMounted = true;
    fetch('/api/admin/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            router.replace('/admin/login');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace('/admin/login');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // Fetch quick telemetry badges for sidebar
  useEffect(() => {
    if (user && !isLoginPage) {
      fetch('/api/admin/dashboard')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.metrics && data?.counts) {
            setTelemetryCounts({
              pendingOrders: data.metrics.pendingCount || 0,
              openInquiries: data.counts.openInquiries || 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [user, isLoginPage, pathname]);

  // If on /admin/login, render clean auth canvas
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#1F0422] text-stone-100">{children}</div>;
  }

  // If checking authentication for protected admin routes, show discreet loading barrier
  if (isCheckingAuth && !user) {
    return (
      <div className="min-h-screen bg-[var(--bb-ivory)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent" />
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Verifying Executive Access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bb-ivory)] text-stone-900 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrdersCount={telemetryCounts.pendingOrders}
        openInquiriesCount={telemetryCounts.openInquiries}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminUIProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminUIProvider>
  );
}
