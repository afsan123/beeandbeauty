'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import type { StoredInquiry } from '../../../lib/services/inquiryService.ts';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInquiries = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/inquiries'
          : `/api/admin/inquiries?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load inquiries');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading inquiries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (
    inquiry: StoredInquiry,
    newStatus: 'new' | 'in_progress' | 'resolved'
  ) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiry.id ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
    }
  };

  const cleanPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    const raw = phone.replace(/[\s\-\+]/g, '');
    return raw.startsWith('88') ? raw : `88${raw}`;
  };

  const getStatusBadge = (status: StoredInquiry['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'new':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        onToggleSidebar={() => {}}
        title="Customer Support Desk"
        subtitle="Review, reply to, and resolve inquiries submitted via the Bee & Beauty contact portal."
        actionButton={{
          label: 'Refresh Tickets',
          onClick: fetchInquiries,
          icon: <span className="text-base">💬</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'new', 'in_progress', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
              statusFilter === st
                ? 'bg-[var(--bb-plum)] text-white shadow-sm ring-1 ring-[var(--bb-gold)]/40'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-stone-500 font-medium">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
            Loading customer tickets...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-400">
            No customer support inquiries in this queue.
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-[var(--bb-gold)]/50 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[var(--bb-plum)] bg-[var(--bb-plum)]/10 px-2.5 py-1 rounded-lg">
                    #{inquiry.ticketNumber}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {inquiry.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                      inquiry.status
                    )}`}
                  >
                    {inquiry.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(inquiry.createdAt).toLocaleString('en-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <span className="font-bold text-stone-900">👤 {inquiry.fullName}</span>
                <span>✉ {inquiry.email}</span>
                {inquiry.phone && <span>📞 {inquiry.phone}</span>}
              </div>

              {/* Message */}
              <div className="rounded-xl bg-stone-50 p-4 text-xs leading-relaxed text-stone-800 border border-stone-100 font-sans">
                {inquiry.message}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-500">
                    Update Status:
                  </label>
                  <select
                    value={inquiry.status}
                    onChange={(e) =>
                      handleUpdateStatus(inquiry, e.target.value as any)
                    }
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none"
                  >
                    <option value="new">New (Unresolved)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {inquiry.phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        inquiry.phone
                      )}?text=${encodeURIComponent(
                        `Assalamu Alaikum ${inquiry.fullName},\nRegarding your Bee & Beauty inquiry #${inquiry.ticketNumber}: "${inquiry.subject}". How may we assist you today?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      💬 Reply via WhatsApp
                    </a>
                  )}

                  <a
                    href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                      `Bee & Beauty Support: Re: [${inquiry.ticketNumber}] ${inquiry.subject}`
                    )}`}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    ✉ Reply via Email
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
