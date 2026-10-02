import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { getCategoryErrorMessage } from '../../services/category.service';
import type { Category, CreateCategoryInput } from '../../types/category.types';

interface CategoryModalProps {
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => Promise<void>;
}

interface FieldErrors {
  name?: string;
  sortOrder?: string;
}

export default function CategoryModal({
  mode,
  category,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const isEdit = mode === 'edit';
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(category?.name ?? '');
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        !submitting &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, submitting]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmed = name.trim();
    if (!trimmed) {
      errors.name = 'Category name is required.';
    }
    const order = Number(sortOrder);
    if (sortOrder.trim() !== '' && (!Number.isInteger(order) || order < 0)) {
      errors.sortOrder = 'Sort order must be a whole number of 0 or more.';
    }
    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        sortOrder: sortOrder.trim() === '' ? 0 : Number(sortOrder),
        isActive,
      });
      onClose();
    } catch (error) {
      setSubmitError(getCategoryErrorMessage(error));
    } finally {
      setSubmitting(false);
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
        aria-labelledby="category-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2
            id="category-modal-title"
            className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5">
          {submitError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
            >
              {submitError}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="category-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="category-name"
                name="name"
                type="text"
                autoFocus
                placeholder="e.g. Hot Coffee"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={submitting}
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? 'category-name-error' : undefined}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
                  fieldErrors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:focus:border-white dark:focus:ring-white/10'
                }`}
              />
              {fieldErrors.name && (
                <p
                  id="category-name-error"
                  className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category-sort-order"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Sort Order
              </label>
              <input
                id="category-sort-order"
                name="sortOrder"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="0"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                disabled={submitting}
                aria-invalid={fieldErrors.sortOrder ? true : undefined}
                aria-describedby={
                  fieldErrors.sortOrder ? 'category-sort-error' : undefined
                }
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
                  fieldErrors.sortOrder
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:focus:border-white dark:focus:ring-white/10'
                }`}
              />
              {fieldErrors.sortOrder && (
                <p
                  id="category-sort-error"
                  className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {fieldErrors.sortOrder}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Visible on the menu when enabled.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                aria-label="Toggle active status"
                onClick={() => setIsActive((current) => !current)}
                disabled={submitting}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {submitting && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
              {submitting
                ? isEdit
                  ? 'Saving...'
                  : 'Creating...'
                : isEdit
                  ? 'Save Changes'
                  : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
