'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [focusField, setFocusField] = useState('');

  function getRedirectUrl() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/update-password`;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) return `${siteUrl.replace(/\/$/, '')}/update-password`;
    return undefined;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getRedirectUrl(),
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white flex items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] bg-violet-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <Link href="/" className="block text-xl font-black tracking-tighter uppercase mb-10">
          Asset<span className="text-violet-400">Flux</span>
        </Link>

        {sent ? (
          /* ―― Success state ―― */
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Check your email</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>.
              Click the link in the email to set a new password. If you don&apos;t see it, check your spam folder.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/50 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors"
              >
                Try a different email
              </button>
              <Link
                href="/signin"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-700/25 transition-all duration-200"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ―― Form state ―― */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Reset password</h2>
              <p className="text-zinc-500 text-sm">
                Enter the email tied to your account and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm mb-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">
                  Email address
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusField === 'email'
                    ? 'border-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
                    : 'border-zinc-700/80'
                } bg-zinc-900/60`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField('')}
                    placeholder="you@example.com"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-700/25 transition-all duration-200 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </span>
                ) : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-600 mt-6">
              Remember your password?{' '}
              <Link href="/signin" className="text-violet-400 hover:text-violet-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
