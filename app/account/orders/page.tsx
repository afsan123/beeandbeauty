'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../../../lib/formatters.ts';

interface AccountOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ productTitle: string; quantity: number }>;
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/account/orders')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/account/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load orders.');
        setOrders(data.orders || []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to load orders.');
      });
  }, [router]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 font-sans">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">Customer account</p>
      <h1 className="text-3xl font-serif text-[#6A1B6D] mb-6">Your orders</h1>
      {error && <p className="text-sm text-rose-700 mb-4">{error}</p>}
      {orders.length === 0 && !error ? (
        <p className="text-sm text-neutral-600">
          No orders are linked to this account yet. Guest orders can be tracked from{' '}
          <Link href="/track-order" className="underline text-[#6A1B6D]">Track order</Link>.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[#F0E6DD] bg-white p-5">
              <div className="flex justify-between gap-3 mb-2">
                <h2 className="font-mono font-bold text-[#6A1B6D]">{order.orderNumber}</h2>
                <span className="text-xs uppercase tracking-wider text-[#3E6351]">{order.orderStatus}</span>
              </div>
              <p className="text-sm text-neutral-600 mb-2">
                {formatPrice(order.totalAmount)} · {order.paymentStatus} · {new Date(order.createdAt).toLocaleDateString('en-BD')}
              </p>
              <p className="text-xs text-neutral-500">
                {order.items.map((item) => `${item.productTitle} × ${item.quantity}`).join(', ')}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
