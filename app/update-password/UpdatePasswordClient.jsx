'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function UpdatePasswordClient() {
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusField, setFocusField] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and creates a session. We just need to wait for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (user may have refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Give it a moment for the hash to be picked up
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) setSessionReady(true);
            else setNoSession(true);
          });
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPw) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  };

  const EyeIcon = showPw ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );

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

        {success ? (
          /* ―― Success state ―― */
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Password updated</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            <Link
              href="/signin"
              className="block w-full text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-700/25 transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        ) : noSession ? (
          /* ―― No session / invalid link ―― */
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Invalid or expired link</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              This password reset link is no longer valid. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="block w-full text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-700/25 transition-all duration-200"
            >
              Request new reset link
            </Link>
          </div>
        ) : !sessionReady ? (
          /* ―― Loading state ―― */
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-violet-400 mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-zinc-500 text-sm">Verifying reset link…</p>
          </div>
        ) : (
          /* ―― Form state ―― */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Set new password</h2>
              <p className="text-zinc-500 text-sm">
                Choose a strong password with at least 8 characters.
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

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">
                  New password
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusField === 'pw'
                    ? 'border-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
                    : 'border-zinc-700/80'
                } bg-zinc-900/60`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    id="new-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusField('pw')}
                    onBlur={() => setFocusField('')}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition"
                    tabIndex={-1}
                  >
                    {EyeIcon}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">
                  Confirm password
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusField === 'confirm'
                    ? 'border-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
                    : 'border-zinc-700/80'
                } bg-zinc-900/60`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    id="confirm-password"
                    type={showPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    onFocus={() => setFocusField('confirm')}
                    onBlur={() => setFocusField('')}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                    autoComplete="new-password"
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
                    Updating…
                  </span>
                ) : 'Update password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
