'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreateTutorialModal } from '../../../components/admin/CreateTutorialModal';
import type { StudioTutorial, StudioBooking } from '../../../lib/services/studioService';

export default function AdminStudioPage() {
  const [activeTab, setActiveTab] = useState<'tutorials' | 'bookings'>('tutorials');

  // Tutorials State
  const [tutorials, setTutorials] = useState<StudioTutorial[]>([]);
  const [tutLoading, setTutLoading] = useState(true);
  const [editingTutorial, setEditingTutorial] = useState<StudioTutorial | null>(null);
  const [tutModalOpen, setTutModalOpen] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTutorials = async () => {
    setTutLoading(true);
    try {
      const res = await fetch('/api/admin/studio/tutorials');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tutorials');
      setTutorials(data.tutorials || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching tutorials');
    } finally {
      setTutLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookLoading(true);
    try {
      const res = await fetch('/api/admin/studio/bookings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.bookings || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching bookings');
    } finally {
      setBookLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
    fetchBookings();
  }, []);

  const handleDeleteTutorial = async (tut: StudioTutorial) => {
    if (!confirm(`Are you sure you want to delete "${tut.title}"?`)) return;
    setActionLoadingId(tut.id);
    try {
      const res = await fetch(`/api/admin/studio/tutorials/${tut.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tutorial');
      setTutorials((prev) => prev.filter((t) => t.id !== tut.id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTutorialSaved = (saved: StudioTutorial) => {
    setTutorials((prev) => {
      const index = prev.findIndex((t) => t.id === saved.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = saved;
        return copy.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  const handleUpdateBookingStatus = async (booking: StudioBooking, status: StudioBooking['status']) => {
    setActionLoadingId(booking.id);
    try {
      const res = await fetch(`/api/admin/studio/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking status');
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? data.booking : b))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBooking = async (booking: StudioBooking) => {
    if (!confirm(`Delete booking appointment for ${booking.clientName}?`)) return;
    setActionLoadingId(booking.id);
    try {
      const res = await fetch(`/api/admin/studio/bookings/${booking.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete booking');
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            <Link href="/admin" className="hover:text-[var(--bb-plum)] transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-[var(--bb-plum)]">Pro Beauty Studio</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Pro Beauty Studio & Artistry Management
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Curate masterclasses, beauty tutorials, and manage VIP makeover & shade consultation appointment requests.
          </p>
        </div>

        {activeTab === 'tutorials' && (
          <button
            onClick={() => {
              setEditingTutorial(null);
              setTutModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <span className="text-sm font-bold">+</span> Add Masterclass
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Live Tutorials</p>
          <p className="mt-1 text-2xl font-black font-serif text-[var(--bb-plum)]">{tutorials.length}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Masterclass video guides</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Bookings</p>
          <p className="mt-1 text-2xl font-black font-serif text-stone-900">{bookings.length}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Makeover appointments</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending Confirmation</p>
          <p className="mt-1 text-2xl font-black font-serif text-amber-600">{pendingBookingsCount}</p>
          <span className="inline-block mt-1 text-[11px] text-amber-600 font-medium">Awaiting studio call</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Confirmed Sessions</p>
          <p className="mt-1 text-2xl font-black font-serif text-emerald-700">{confirmedBookingsCount}</p>
          <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">Booked on calendar</span>
        </div>
      </div>

      {/* Primary Section Switcher */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'tutorials'
              ? 'bg-[var(--bb-plum)] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>🎬 Masterclasses & Tutorials</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{tutorials.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-[var(--bb-plum)] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>💄 Consultation Bookings</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              pendingBookingsCount > 0 ? 'bg-amber-400 text-black font-extrabold' : 'bg-white/20'
            }`}
          >
            {bookings.length}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* TAB 1: TUTORIALS */}
      {activeTab === 'tutorials' && (
        <div className="space-y-4">
          {tutLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : tutorials.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
              <p className="text-base font-serif font-bold text-stone-800">No masterclasses available</p>
              <p className="text-xs text-stone-500 mt-1">Publish beauty tutorials to inspire shoppers.</p>
              <button
                onClick={() => {
                  setEditingTutorial(null);
                  setTutModalOpen(true);
                }}
                className="mt-4 rounded-xl bg-[var(--bb-plum)] text-white px-4 py-2 text-xs font-semibold hover:bg-[#831843] transition-colors"
              >
                Create Tutorial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tutorials.map((tut) => (
                <div
                  key={tut.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-full bg-[var(--bb-blush)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--bb-plum)]">
                        {tut.category}
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">⏱ {tut.duration}</span>
                    </div>

                    <h3 className="text-base font-bold font-serif text-stone-900 mt-1 line-clamp-2">
                      {tut.title}
                    </h3>

                    <p className="text-xs text-stone-500 mt-2 line-clamp-3">
                      {tut.description}
                    </p>

                    {tut.steps && tut.steps.length > 0 && (
                      <div className="mt-3 rounded-xl bg-stone-50 p-2.5 border border-stone-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Key Steps ({tut.steps.length})
                        </span>
                        <p className="text-xs text-stone-700 italic line-clamp-2">
                          1. {tut.steps[0]}
                        </p>
                      </div>
                    )}

                    {tut.productName && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-600">
                        <span className="text-stone-400">Featured:</span>
                        <Link
                          href={`/product/${tut.productSlug || ''}`}
                          target="_blank"
                          className="font-semibold text-[var(--bb-plum)] hover:underline"
                        >
                          {tut.productName} ↗
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-400">
                      Sort: #{tut.sortOrder}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTutorial(tut);
                          setTutModalOpen(true);
                        }}
                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTutorial(tut)}
                        disabled={actionLoadingId === tut.id}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSULTATION BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Booking Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBookingFilter(filter)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  bookingFilter === filter
                    ? 'bg-[var(--bb-plum)] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {bookLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
              <p className="text-base font-serif font-bold text-stone-800">No appointment bookings found</p>
              <p className="text-xs text-stone-500 mt-1">
                {bookingFilter !== 'all' ? `No bookings with "${bookingFilter}" status.` : 'Client appointment bookings will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900 font-serif">
                        {b.clientName}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : b.status === 'completed'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-[11px] font-medium text-stone-400">
                        Requested: {new Date(b.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                      <div>
                        <span className="text-stone-400">Service: </span>
                        <span className="font-semibold text-[var(--bb-plum)]">{b.serviceType}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">Date & Time: </span>
                        <span className="font-semibold text-stone-800">
                          {b.preferredDate} {b.preferredTime ? `at ${b.preferredTime}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400">Phone: </span>
                        <a
                          href={`tel:${b.clientPhone}`}
                          className="font-mono font-semibold text-stone-800 hover:text-[var(--bb-plum)]"
                        >
                          {b.clientPhone}
                        </a>
                      </div>
                      {b.clientEmail && (
                        <div>
                          <span className="text-stone-400">Email: </span>
                          <span className="text-stone-800">{b.clientEmail}</span>
                        </div>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100 mt-1 italic">
                        "{b.notes}"
                      </p>
                    )}
                  </div>

                  {/* Booking Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {/* WhatsApp Direct Chat */}
                    <a
                      href={`https://wa.me/880${(b.clientPhone || '').replace(/^0+/, '')}?text=${encodeURIComponent(
                        `Assalamu Alaikum ${b.clientName || 'Client'}, this is Bee & Beauty Pro Beauty Studio regarding your ${b.serviceType} appointment booking.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>💬 WhatsApp</span>
                    </a>

                    {b.status !== 'confirmed' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b, 'confirmed')}
                        disabled={actionLoadingId === b.id}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Confirm
                      </button>
                    )}

                    {b.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b, 'completed')}
                        disabled={actionLoadingId === b.id}
                        className="rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Complete
                      </button>
                    )}

                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b, 'cancelled')}
                        disabled={actionLoadingId === b.id}
                        className="rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 px-2.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteBooking(b)}
                      disabled={actionLoadingId === b.id}
                      className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tutorial Modal */}
      <CreateTutorialModal
        isOpen={tutModalOpen}
        onClose={() => setTutModalOpen(false)}
        onSaved={handleTutorialSaved}
        initialTutorial={editingTutorial}
      />
    </div>
  );
}
