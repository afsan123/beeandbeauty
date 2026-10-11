'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import { CreateCategoryModal } from '../../../components/admin/CreateCategoryModal.tsx';
import type { Category } from '../../../data/types.ts';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaved = (saved: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.slug === saved.slug);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete category "${slug}"?`)) return;

    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/categories/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories((prev) => prev.filter((c) => c.slug !== slug));
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    } finally {
      setDeletingSlug(null);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        title="Category Architecture & Taxonomy"
        subtitle="Create, edit, and organize storefront navigation categories, subcategories, and landing banners."
        actionButton={{
          label: 'Create Category',
          onClick: () => {
            setEditingCategory(null);
            setIsModalOpen(true);
          },
          icon: <span>＋</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
          />
          <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 w-full sm:w-auto justify-end">
          <span className="font-bold text-stone-900">{filtered.length}</span> Categories Live
        </div>
      </div>

      {/* Categories Ledger Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Subcategories</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    Loading category hierarchy...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No categories found. Click &ldquo;Create Category&rdquo; to add your first catalog section.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.slug} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center font-serif text-stone-400 text-xs">
                          {cat.tileImage ? (
                            <img
                              src={cat.tileImage}
                              alt={cat.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>🏷️</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 font-serif text-sm">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {cat.description || 'No description set'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--bb-plum)] font-semibold">
                      /shop/{cat.slug}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub) => (
                            <span
                              key={sub.slug}
                              className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700 font-medium"
                            >
                              {sub.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">No subcategories</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                        {cat.productCount} SKUs
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/shop/${cat.slug}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-stone-400 hover:text-[var(--bb-plum)] hover:bg-stone-100 transition-colors"
                          title="View on storefront"
                        >
                          ↗
                        </Link>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-[var(--bb-plum)] hover:text-[var(--bb-plum)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.slug)}
                          disabled={deletingSlug === cat.slug}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          {deletingSlug === cat.slug ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialCategory={editingCategory}
      />
    </div>
  );
}
