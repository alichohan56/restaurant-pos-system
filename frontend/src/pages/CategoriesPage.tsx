import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import DeleteCategoryModal from '../components/categories/DeleteCategoryModal';
import {
  createCategory,
  getCategories,
  getCategoryErrorMessage,
  updateCategory,
} from '../services/category.service';
import type { Category, CreateCategoryInput } from '../types/category.types';

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; category: Category }
  | null;

const SKELETON_ROWS = [0, 1, 2, 3];

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(getCategoryErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- initial data fetch: all setState calls happen after the network response resolves
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    void fetchCategories();
  };

  const handleCreate = async (input: CreateCategoryInput) => {
    await createCategory(input);
    setToast('Category created');
    await fetchCategories();
  };

  const handleEdit = async (input: CreateCategoryInput) => {
    if (editor?.mode !== 'edit') {
      return;
    }
    await updateCategory(editor.category.id, input);
    setToast('Changes saved');
    await fetchCategories();
  };

  const handleDeleted = (id: string) => {
    setCategories((current) => current.filter((item) => item.id !== id));
    setDeleteTarget(null);
    setToast('Category deleted');
  };

  const showErrorState = !loading && error !== null && categories.length === 0;
  const showData = !loading && !showErrorState;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your coffee shop menu categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          Add Category
        </button>
      </header>

      {error && !loading && categories.length > 0 && (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 sm:flex-row sm:items-center sm:justify-between dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 sm:self-auto dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {loading && (
        <section
          aria-label="Loading categories"
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <SkeletonBlock className="h-4 w-40" />
          </div>
          {SKELETON_ROWS.map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800"
            >
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="hidden h-4 w-16 sm:block" />
              <SkeletonBlock className="ml-auto h-5 w-16 rounded-full" />
            </div>
          ))}
        </section>
      )}

      {showErrorState && (
        <section
          role="alert"
          className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
            <CircleAlert className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            Retry
          </button>
        </section>
      )}

      {showData && categories.length === 0 && (
        <section className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Tags className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            No categories yet.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create your first menu category to organize coffee shop products.
          </p>
          <button
            type="button"
            onClick={() => setEditor({ mode: 'create' })}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add Category
          </button>
        </section>
      )}

      {showData && categories.length > 0 && (
        <section
          aria-label="Category list"
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Category Name
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Slug
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Sort Order
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="max-w-xs px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      <span className="block truncate">{category.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {category.sortOrder}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          category.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${category.name}`}
                          title="Edit"
                          onClick={() =>
                            setEditor({ mode: 'edit', category })
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          title="Delete"
                          onClick={() => setDeleteTarget(category)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
            {categories.map((category) => (
              <li key={category.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {category.name}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-400 dark:text-slate-500">
                      {category.slug}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      category.isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sort order{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {category.sortOrder}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => setEditor({ mode: 'edit', category })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setDeleteTarget(category)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editor && (
        <CategoryModal
          mode={editor.mode}
          category={editor.mode === 'edit' ? editor.category : undefined}
          onClose={() => setEditor(null)}
          onSubmit={editor.mode === 'create' ? handleCreate : handleEdit}
        />
      )}

      {deleteTarget && (
        <DeleteCategoryModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-slate-900/10 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-400 dark:shadow-black/40"
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}
