'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import type { StoredSubscriber } from '../../../lib/services/newsletterService.ts';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<StoredSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/subscribers');
      if (!res.ok) throw new Error('Failed to load subscribers');
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading VIP subscribers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleCopyAllEmails = () => {
    const emailList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Email', 'Status', 'Date Joined'],
      ...subscribers.map((s) => [s.email, s.isActive ? 'Active' : 'Unsubscribed', s.createdAt]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bee_and_beauty_vip_subscribers_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        onToggleSidebar={() => {}}
        title="VIP Newsletter Inner Circle"
        subtitle="Manage and export email subscribers for beauty drops and promotional campaigns."
        actionButton={{
          label: copiedAll ? '✓ Copied to Clipboard!' : 'Copy All Emails',
          onClick: handleCopyAllEmails,
          icon: <span className="text-base">📋</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bb-plum)] text-amber-300 font-serif font-bold">
            💌
          </span>
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-900">
              {subscribers.length} VIP Subscribers Registered
            </h3>
            <p className="text-xs text-stone-500">
              Customers opted-in to exclusive product launches & beauty masterclasses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span>📥 Export CSV</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-3 px-4 font-bold uppercase">Subscriber Email</th>
                <th className="py-3 px-4 font-bold uppercase">Status</th>
                <th className="py-3 px-4 font-bold uppercase">Date Joined</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-500 font-medium">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400">
                    No newsletter subscribers registered yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((s, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900 font-mono">
                      {s.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {s.isActive ? 'Active Subscriber' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {new Date(s.createdAt).toLocaleString('en-BD', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.email);
                        }}
                        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                        title="Copy email address"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
