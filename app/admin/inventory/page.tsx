'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import type { Product, Shade } from '../../../data/types.ts';
import { formatPrice } from '../../../lib/formatters.ts';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'in_stock' | 'out_of_stock' | 'shades_only'>('all');
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to load inventory data');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleToggleProductStock = async (product: Product) => {
    const newStock = !product.inStock;
    setUpdatingKey(product.id);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          inStock: newStock,
        }),
      });
      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleToggleShadeStock = async (product: Product, shade: Shade) => {
    const currentShadesStock: Record<string, boolean> = {};
    product.shades?.forEach((s) => {
      currentShadesStock[s.id] = s.inStock;
    });
    currentShadesStock[shade.id] = !shade.inStock;

    const key = `${product.id}-${shade.id}`;
    setUpdatingKey(key);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          shadesStock: currentShadesStock,
        }),
      });
      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch (err) {
      console.error('Error toggling shade stock:', err);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleBulkShadesStock = async (product: Product, targetStock: boolean) => {
    const currentShadesStock: Record<string, boolean> = {};
    product.shades?.forEach((s) => {
      currentShadesStock[s.id] = targetStock;
    });

    setUpdatingKey(product.id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          shadesStock: currentShadesStock,
          inStock: targetStock ? true : product.inStock,
        }),
      });
      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch (err) {
      console.error('Error in bulk shade update:', err);
    } finally {
      setUpdatingKey(null);
    }
  };

  // Metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const totalShades = products.reduce((acc, p) => acc + (p.shades?.length || 0), 0);
  const inStockShades = products.reduce(
    (acc, p) => acc + (p.shades?.filter((s) => s.inStock).length || 0),
    0
  );

  const filtered = products.filter((p) => {
    const matchesQuery =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shades?.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (filterMode === 'in_stock') return p.inStock;
    if (filterMode === 'out_of_stock') return !p.inStock;
    if (filterMode === 'shades_only') return (p.shades?.length || 0) > 0;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        title="Stock & Inventory Control Center"
        subtitle="Real-time stock statuses, out-of-stock badges, shade-level inventory matrix, and restock actions."
        actionButton={{
          label: 'Refresh Stock',
          onClick: fetchInventory,
          icon: <span>↺</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Catalog SKUs
          </p>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {totalProducts}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">Active master products</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            In Stock SKUs
          </p>
          <p className="text-2xl font-bold font-serif text-emerald-900 mt-1">
            {inStockCount}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">Purchasable storefront</p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
            Out Of Stock
          </p>
          <p className="text-2xl font-bold font-serif text-rose-900 mt-1">
            {outOfStockCount}
          </p>
          <p className="text-xs text-rose-700 mt-0.5">Shows Sold Out pill</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Shades Matrix
          </p>
          <p className="text-2xl font-bold font-serif text-amber-900 mt-1">
            {inStockShades}/{totalShades}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">Live color swatches</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-[var(--bb-plum)] text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            All ({totalProducts})
          </button>
          <button
            onClick={() => setFilterMode('in_stock')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'in_stock'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            onClick={() => setFilterMode('out_of_stock')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'out_of_stock'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            onClick={() => setFilterMode('shades_only')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'shades_only'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            With Shades
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by title, SKU, shade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-1.5 text-xs focus:border-[var(--bb-plum)] outline-none"
          />
          <span className="absolute left-3 top-2 text-stone-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Inventory Item Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
            Loading real-time inventory matrix...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
            No products found matching filter.
          </div>
        ) : (
          filtered.map((product) => {
            const hasShades = (product.shades?.length || 0) > 0;
            const shadesInStock = product.shades?.filter((s) => s.inStock).length || 0;

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4 hover:border-[var(--bb-gold)]/60 transition-all"
              >
                {/* Product Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0">
                      <img
                        src={product.images?.primary}
                        alt={product.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold font-serif text-stone-900 text-sm">
                          {product.title}
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {product.categoryName}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 font-mono">
                        SKU: {product.slug} &bull; {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Master Product Toggle */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-stone-500">
                      Master Stock:
                    </span>
                    <button
                      onClick={() => handleToggleProductStock(product)}
                      disabled={updatingKey === product.id}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        product.inStock
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-rose-600 text-white hover:bg-rose-700'
                      }`}
                    >
                      {updatingKey === product.id
                        ? '...'
                        : product.inStock
                        ? '✓ In Stock'
                        : '✕ Sold Out'}
                    </button>
                  </div>
                </div>

                {/* Shades Stock Matrix */}
                {hasShades ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Shades Breakdown ({shadesInStock}/{product.shades?.length} Available)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBulkShadesStock(product, true)}
                          disabled={updatingKey === product.id}
                          className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Restock All
                        </button>
                        <span className="text-stone-300">•</span>
                        <button
                          type="button"
                          onClick={() => handleBulkShadesStock(product, false)}
                          disabled={updatingKey === product.id}
                          className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
                        >
                          Mark All Sold Out
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {product.shades?.map((shade) => {
                        const shadeKey = `${product.id}-${shade.id}`;
                        const isUpdating = updatingKey === shadeKey;

                        return (
                          <div
                            key={shade.id}
                            className={`flex items-center justify-between rounded-xl border p-2 transition-all ${
                              shade.inStock
                                ? 'border-emerald-200 bg-emerald-50/40'
                                : 'border-rose-200 bg-rose-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: shade.hexColor }}
                              />
                              <div className="truncate">
                                <p className="text-[11px] font-bold text-stone-900 truncate">
                                  {shade.name}
                                </p>
                                <p className="text-[9px] text-stone-400 font-mono">
                                  #{shade.code}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleShadeStock(product, shade)}
                              disabled={isUpdating}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ml-1 cursor-pointer ${
                                shade.inStock
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {isUpdating ? '..' : shade.inStock ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    Single unit inventory item (controlled by master stock toggle).
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
