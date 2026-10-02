import { useEffect, useRef, useState } from 'react';
import { Loader2, TriangleAlert, X } from 'lucide-react';
import {
  deleteCategory,
  getCategoryErrorMessage,
} from '../../services/category.service';
import type { Category } from '../../types/category.types';

interface DeleteCategoryModalProps {
  category: Category;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteCategoryModal({
  category,
  onClose,
  onDeleted,
}: DeleteCategoryModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (
        !deleting &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, deleting]);

  const handleDelete = async () => {
    if (deleting) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      onDeleted(category.id);
    } catch (err) {
      setError(getCategoryErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        aria-describedby="delete-category-description"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2
            id="delete-category-title"
            className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            Delete Category?
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
            >
              {error}
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
              <TriangleAlert className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p
                id="delete-category-description"
                className="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
              >
                Are you sure you want to delete{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {category.name}
                </span>
                ? This action cannot be undone.
              </p>
              <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">
                {category.slug}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
              {deleting ? 'Deleting...' : 'Delete Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
