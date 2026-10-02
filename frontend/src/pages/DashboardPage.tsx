import { Banknote, ClipboardList, Package, TrendingUp, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/useAuth';

interface SummaryCard {
  label: string;
  value: string;
  icon: LucideIcon;
}

const SUMMARY_CARDS: SummaryCard[] = [
  { label: "Today's Sales", value: 'Rs. 0', icon: Banknote },
  { label: 'Orders', value: '0', icon: ClipboardList },
  { label: 'Customers', value: '0', icon: Users },
  { label: 'Low Stock Items', value: '0', icon: Package },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user.name}
        </p>
      </header>

      <section
        aria-label="Summary"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {SUMMARY_CARDS.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-900/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <card.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Sales Overview
            </h2>
          </div>
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <TrendingUp className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No sales data available yet.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Recent Orders
            </h2>
          </div>
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <ClipboardList className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No recent orders.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
