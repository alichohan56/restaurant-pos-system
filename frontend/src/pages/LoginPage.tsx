import { useState } from 'react';
import type { FormEvent } from 'react';
import { REMEMBER_ME_STORAGE_KEY } from '../api/apiClient';
import { useAuth } from '../context/useAuth';
import { getLoginErrorMessage } from '../services/auth.service';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const APP_YEAR = new Date().getFullYear();

const FEATURES = [
  {
    title: 'Sales',
    description: 'Track revenue as it happens',
    progress: '82%',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="15 7 21 7 21 13" />
      </svg>
    ),
  },
  {
    title: 'Orders',
    description: 'Follow every order end to end',
    progress: '68%',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    title: 'Inventory',
    description: 'Keep stock levels in check',
    progress: '74%',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    title: 'POS',
    description: 'Fast, reliable checkout',
    progress: '91%',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="4" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 18v3M7 9h6" />
      </svg>
    ),
  },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 3v7a3 3 0 0 0 3 3v8" />
        <path d="M7 3v5" />
        <path d="M10 3v5" />
        <path d="M17 3c-1.5 2-2 4-2 6.5 0 2 .8 3 2 3.5v8" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem(REMEMBER_ME_STORAGE_KEY) !== 'false',
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError(null);
    setNotice(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    login(email.trim(), password)
      .catch((error: unknown) => {
        setFormError(getLoginErrorMessage(error));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-100 via-white to-indigo-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

        <header className="relative z-10 flex items-center gap-3">
          <BrandMark className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20" />
          <span className="text-xl font-semibold tracking-tight text-slate-900">RestroPOS</span>
        </header>

        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl">
            Manage Your Restaurant Smarter
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            Manage sales, orders, inventory and restaurant operations from one powerful
            dashboard.
          </p>
        </div>

        <div className="relative z-10 grid max-w-xl grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/5 text-slate-700">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{feature.description}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{ width: feature.progress }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          Point of sale, inventory and operations &mdash; unified.
        </p>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <BrandMark className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20" />
          <span className="text-lg font-semibold tracking-tight text-slate-900">RestroPOS</span>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Sign in to access your restaurant dashboard.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@restaurantpos.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                }`}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M16.7 16.7A10.5 10.5 0 0 1 12 18c-5 0-9-4-10-6a11 11 0 0 1 4-4.3" />
                      <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c5 0 9 4 10 6a11.4 11.4 0 0 1-2.2 3" />
                      <path d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setRemember(checked);
                    localStorage.setItem(REMEMBER_ME_STORAGE_KEY, String(checked));
                  }}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setNotice(
                    'Password reset is not available yet. Please contact your system administrator.',
                  );
                }}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Forgot Password?
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {formError}
              </div>
            )}

            {notice && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          &copy; {APP_YEAR} RestroPOS. All rights reserved.
        </p>
      </section>
    </div>
  );
}
