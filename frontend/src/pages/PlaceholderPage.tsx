import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Sparkles className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        This module is coming soon. The {title} workspace will be available in a
        future update.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
