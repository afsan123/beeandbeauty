'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import { CreateProductModal } from '../../../components/admin/CreateProductModal.tsx';
import { BulkProductUploadModal } from '../../../components/admin/BulkProductUploadModal.tsx';
import type { Product, Shade, Category } from '../../../data/types.ts';
import { formatPrice } from '../../../lib/formatters.ts';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);

      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.json();
      setProducts(prodData.products || []);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading catalog products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSaved = (saved: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleProductStock = async (product: Product) => {
    const newStock = !product.inStock;
    setUpdatingId(product.id);

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
      console.error('Error toggling product stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleShadeStock = async (product: Product, shade: Shade) => {
    const currentShadesStock: Record<string, boolean> = {};
    product.shades?.forEach((s) => {
      currentShadesStock[s.id] = s.inStock;
    });
    currentShadesStock[shade.id] = !shade.inStock;

    setUpdatingId(`${product.id}-${shade.id}`);

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
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' || p.categorySlug === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        title="Product Catalog & Stock Matrix"
        subtitle="Full product lifecycle: create new formulas, bulk upload CSV/JSON, adjust BDT pricing, and manage inventory."
        actionButton={{
          label: 'Create Product',
          onClick: () => {
            setEditingProduct(null);
            setIsModalOpen(true);
          },
          icon: <span>＋</span>,
        }}
        secondaryActionButton={{
          label: 'Bulk Upload',
          onClick: () => setIsBulkModalOpen(true),
          icon: <span>📥</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[var(--bb-plum)] text-white shadow-xs ring-1 ring-[var(--bb-gold)]/40'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === c.slug
                    ? 'bg-[var(--bb-plum)] text-white shadow-xs ring-1 ring-[var(--bb-gold)]/40'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="text-xs font-bold text-[var(--bb-plum)] hover:underline flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Bulk Upload CSV/JSON</span>
            </button>
            <span className="text-stone-300">|</span>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-stone-600 hover:text-[var(--bb-plum)] hover:underline flex items-center gap-1"
            >
              <span>Open Bulk Stock Matrix</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search products by title, slug, shade name, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[var(--bb-plum)] focus:bg-white focus:outline-none"
          />
          <span className="absolute left-3.5 top-3 text-stone-400">🔍</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price (৳)</th>
                <th className="py-3 px-4 text-center">Shades</th>
                <th className="py-3 px-4 text-center">Stock State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No products found matching criteria. Click &ldquo;Create Product&rdquo; to add a new SKU.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id;
                  const shadesCount = product.shades?.length || 0;
                  const inStockShades =
                    product.shades?.filter((s) => s.inStock).length || 0;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0">
                              <img
                                src={product.images.primary}
                                alt={product.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 font-serif text-sm truncate">
                                {product.title}
                              </p>
                              <p className="text-[11px] text-stone-500 truncate">
                                {product.subtitle || product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-stone-700">
                          <span className="inline-flex rounded-lg bg-stone-100 px-2 py-0.5 text-[11px]">
                            {product.categoryName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-stone-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {shadesCount > 0 ? (
                            <button
                              onClick={() =>
                                setExpandedProductId(isExpanded ? null : product.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-[var(--bb-plum)] hover:text-[var(--bb-plum)] transition-all cursor-pointer"
                            >
                              <span>
                                {inStockShades}/{shadesCount} Shades Live
                              </span>
                              <span>{isExpanded ? '▲' : '▼'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">
                              Single Shade
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleProductStock(product)}
                            disabled={updatingId === product.id}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              product.inStock
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100'
                            }`}
                          >
                            {updatingId === product.id
                              ? '...'
                              : product.inStock
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              title="View on Storefront"
                              className="rounded-lg p-1.5 text-stone-400 hover:text-[var(--bb-plum)] hover:bg-stone-100 transition-colors"
                            >
                              ↗
                            </Link>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsModalOpen(true);
                              }}
                              className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-[var(--bb-plum)] hover:text-[var(--bb-plum)] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProduct(product.id, product.title)
                              }
                              disabled={deletingId === product.id}
                              className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === product.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Shades Drawer */}
                      {isExpanded && shadesCount > 0 && (
                        <tr className="bg-stone-50/70 border-b border-stone-200">
                          <td colSpan={6} className="p-4 sm:p-6">
                            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-inner space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--bb-plum)] flex items-center justify-between">
                                <span>Shade Availability Matrix for {product.title}</span>
                                <span className="text-[10px] text-stone-500 font-normal">
                                  Click any shade to toggle storefront in-stock availability
                                </span>
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {product.shades?.map((shade) => {
                                  const shadeKey = `${product.id}-${shade.id}`;
                                  const isUpdating = updatingId === shadeKey;

                                  return (
                                    <div
                                      key={shade.id}
                                      className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                                        shade.inStock
                                          ? 'border-emerald-200 bg-emerald-50/30'
                                          : 'border-rose-200 bg-rose-50/30'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                                          style={{ backgroundColor: shade.hexColor }}
                                        />
                                        <div>
                                          <p className="text-xs font-bold text-stone-900">
                                            {shade.name}
                                          </p>
                                          <p className="text-[10px] text-stone-500 font-mono">
                                            Code: {shade.code}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() =>
                                          handleToggleShadeStock(product, shade)
                                        }
                                        disabled={isUpdating}
                                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                                          shade.inStock
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-rose-600 text-white hover:bg-rose-700'
                                        }`}
                                      >
                                        {isUpdating
                                          ? '...'
                                          : shade.inStock
                                          ? 'In Stock'
                                          : 'Sold Out'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleProductSaved}
        categories={categories}
        initialProduct={editingProduct}
      />

      {/* Bulk Product Upload Modal */}
      <BulkProductUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onProductsImported={(newProducts) => {
          setProducts((prev) => {
            const newMap = new Map(newProducts.map((p) => [p.id, p]));
            const filteredOld = prev.filter((p) => !newMap.has(p.id));
            return [...newProducts, ...filteredOld];
          });
        }}
        categories={categories}
      />
    </div>
  );
}
