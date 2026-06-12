'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrices } from '../context/PriceContext';
import { supabase } from '../lib/supabase';

/*
 * Market rows shown in the left panel.
 * priceKey  - key in PriceContext
 * prefix    - currency symbol shown before the price
 * displayKey - label shown to the user (e.g. "EUR/USD" instead of "EUR/USDT")
 */
const MARKET_ROWS = [
  { priceKey: 'BTC/USDT',  label: 'Bitcoin',       displayKey: 'BTC/USDT', prefix: 'BTC',  color: '#f59e0b', decimals: 2  },
  { priceKey: 'ETH/USDT',  label: 'Ethereum',      displayKey: 'ETH/USDT', prefix: 'ETH',  color: '#818cf8', decimals: 2  },
  { priceKey: 'SOL/USDT',  label: 'Solana',        displayKey: 'SOL/USDT', prefix: '$',  color: '#9945ff', decimals: 2  },
  { priceKey: 'EUR/USDT',  label: 'Euro / Dollar',  displayKey: 'EUR/USD',  prefix: '',   color: '#34d399', decimals: 4  },
  { priceKey: 'GBP/USDT',  label: 'Cable',          displayKey: 'GBP/USD',  prefix: '',   color: '#60a5fa', decimals: 4  },
  { priceKey: 'AAPL',      label: 'Apple Inc.',     displayKey: 'AAPL.US',  prefix: '$',  color: '#a78bfa', decimals: 2  },
  { priceKey: 'TSLA',      label: 'Tesla Inc.',     displayKey: 'TSLA.US',  prefix: '$',  color: '#f43f5e', decimals: 2  },
  { priceKey: 'NVDA',      label: 'Nvidia',         displayKey: 'NVDA.US',  prefix: '$',  color: '#4ade80', decimals: 2  },
];

function fmtP(v, decimals) {
  if (v == null) return '...';
  if (v > 999) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v.toFixed(decimals ?? 2);
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAuthRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl.replace(/\/$/, '')}/signin?confirmed=1`;
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/signin?confirmed=1`;
}

async function resolveLoginEmail(identifier) {
  const login = identifier.trim();
  if (looksLikeEmail(login)) {
    return { email: login, profile: null };
  }

  const username = login.replace(/^@+/, '');
  if (!username) throw new Error('Enter your email or username.');

  const { data, error } = await supabase
    .from('profiles')
    .select('email, username, first_name, last_name')
    .ilike('username', username)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message?.includes('email')
        ? 'Username login needs the email field on profiles. Please run the latest Supabase schema migration.'
        : error.message
    );
  }

  if (!data?.email) throw new Error('No account was found for that username.');
  return { email: data.email, profile: data };
}

/* ―― Animated grid background ―――――――――――――――――――――――――――――――――――――――― */

function GridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf;
    let t = 0;

    const draw = () => {
      const W = canvas.width  = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;

      // ADDED FIX: Skip drawing if canvas has 0 width/height (hidden on mobile)
      if (W === 0 || H === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const step = 48;
      ctx.strokeStyle = 'rgba(124,58,237,0.07)';
      ctx.lineWidth   = 0.5;

      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const px = (t % W);
      const grad = ctx.createRadialGradient(px, 0, 0, px, 0, 80);
      grad.addColorStop(0, 'rgba(167,139,250,0.35)');
      grad.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, 0, 80, 0, Math.PI * 2); ctx.fill();

      t += 1.2;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ―― Eye icon ―――――――――――――――――――――――――――――――――――――――――――――――――――――――― */
function EyeIcon({ open }) {
  return open ? (
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
}

/* ―― Main Sign In Component ―――――――――――――――――――――――――――――――――――――――――― */
export default function SignInClient() {
  /* Real prices from global context - same WebSocket as every other page */
  const { prices, wsStatus } = usePrices();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [notice,     setNotice]     = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending,  setResending]  = useState(false);
  const [focusField, setFocusField] = useState('');
  const [nextPath, setNextPath] = useState('/dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get('next');
    if (requestedNext?.startsWith('/') && !requestedNext.startsWith('//')) {
      setNextPath(requestedNext);
    }
    if (params.get('confirmed') !== '1') return;

    setNotice('Email confirmed successfully. You can now sign in.');
    try { localStorage.removeItem('assetflux_pending_confirmation'); } catch {}

    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setNotice('');
    setUnconfirmedEmail('');
    setLoading(true);

    let resolved;
    try {
      resolved = await resolveLoginEmail(identifier);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Unable to resolve that login.');
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: resolved.email,
      password: password,
    });

    if (authError) {
      setLoading(false);
      if (authError.message?.toLowerCase().includes('email not confirmed')) {
        setUnconfirmedEmail(resolved.email);
        setError('Your email is not confirmed yet. Confirm it from your inbox, or resend the confirmation email.');
      } else {
        setError(authError.message);
      }
      return;
    }
    
    // Save user info for dashboard
    const userMeta = data.user?.user_metadata || {};
    const profile = resolved.profile;
    const username = profile?.username || userMeta.username || resolved.email.split('@')[0];
    const firstName = profile?.first_name || userMeta.firstName || '';
    const lastName = profile?.last_name || userMeta.lastName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ') || username;

    localStorage.setItem('assetflux_user', JSON.stringify({ username, name, email: resolved.email }));
    localStorage.setItem('isNewUser', 'false');
    
    // Redirect to dashboard
    window.location.href = nextPath;
  };

  const resendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    setError('');
    setNotice('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }

    setNotice(`Confirmation email sent to ${unconfirmedEmail}.`);
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white flex overflow-hidden">

      {/* ―― LEFT PANEL - live market feed ―――――――――――――――――――――――――――――――― */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden border-r border-violet-900/20">
        <GridCanvas />

        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
            Asset<span className="text-violet-400">Flux</span>
          </Link>

          {/* Tagline */}
          <div className="mt-12">
            {/* WS status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-700/50 bg-violet-900/20 text-violet-300 text-xs font-semibold tracking-widest uppercase mb-6">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                wsStatus === 'live' ? 'bg-emerald-400' : wsStatus === 'error' ? 'bg-red-400' : 'bg-amber-400'
              }`} />
              {wsStatus === 'live' ? 'Live Market Terminal' : 'Connecting...'}
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
              Financial data<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                at your fingertips.
              </span>
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Real-time prices across Crypto, Stocks, Forex and Real Estate.
              Connect with verified experts and trade smarter.
            </p>
          </div>

          {/* ―― Live market feed (real prices from context) ―― */}
          <div className="mt-10 flex-1 overflow-hidden">
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mb-3">Live Prices</p>
            <div className="space-y-2">
              {MARKET_ROWS.map(m => {
                const p  = prices[m.priceKey];
                const up = (p?.change ?? 0) >= 0;
                return (
                  <div
                    key={m.priceKey}
                    className="flex items-center justify-between bg-[#0d0f2a]/60 backdrop-blur-sm border border-violet-900/20 rounded-xl px-4 py-2.5 hover:border-violet-800/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{m.label}</p>
                        <p className="text-[10px] text-zinc-600 font-mono">{m.displayKey}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="price-num text-sm font-bold font-mono" style={{ color: m.color }}>
                        {m.prefix}{fmtP(p?.price, m.decimals)}
                      </p>
                      <p className={`text-[10px] font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p?.change != null
                          ? `${up ? '+' : ''}${p.change.toFixed(2)}% ${up ? '^' : 'v'}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-zinc-700 text-xs">© 2026 AssetFlux · Real-time financial intelligence</p>
          </div>
        </div>
      </div>

      {/* ―― RIGHT PANEL - Sign In form ―――――――――――――――――――――――――――――――――――――― */}
      <div className="flex-1 lg:max-w-[520px] flex items-center justify-center px-6 py-12 relative">

        <div className="lg:hidden pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] bg-violet-700/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block text-xl font-black tracking-tighter uppercase mb-8">
            Asset<span className="text-violet-400">Flux</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h2>
            <p className="text-zinc-500 text-sm">Sign in to your market terminal</p>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getAuthRedirectUrl() } })} className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/50 hover:border-violet-600/60 hover:bg-violet-900/10 transition-all duration-200 text-sm font-semibold text-zinc-300 hover:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: getAuthRedirectUrl() } })} className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/50 hover:border-violet-600/60 hover:bg-violet-900/10 transition-all duration-200 text-sm font-semibold text-zinc-300 hover:text-white">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
                {unconfirmedEmail && (
                  <button
                    type="button"
                    onClick={resendConfirmation}
                    disabled={resending}
                    className="mt-3 w-full rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                  >
                    {resending ? 'Sending confirmation...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}

            {notice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {notice}
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">
                Email or Username
              </label>
              <div className={`relative rounded-xl border transition-all duration-200 ${
                focusField === 'id'
                  ? 'border-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
                  : 'border-zinc-700/80'
              } bg-zinc-900/60`}>
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="signin-identifier"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onFocus={() => setFocusField('id')}
                  onBlur={() => setFocusField('')}
                  placeholder="you@example.com or @username"
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide">Password</label>
                <Link href="#" className="text-xs text-violet-400 hover:text-violet-300 transition font-medium">
                  Forgot password?
                </Link>
              </div>
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
                  id="signin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusField('pw')}
                  onBlur={() => setFocusField('')}
                  placeholder="Your password"
                  className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
              <div
                onClick={() => setRemember(p => !p)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${
                  remember
                    ? 'bg-violet-600 border-violet-600'
                    : 'border-zinc-600 bg-transparent group-hover:border-violet-500'
                }`}
              >
                {remember && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-zinc-400 select-none">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_40px_rgba(124,58,237,0.55)] transition-all duration-300 flex items-center justify-center gap-2.5 text-sm mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to AssetFlux
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-7">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-violet-400 font-semibold hover:text-violet-300 transition">
              Create one free &rarr;
            </Link>
          </p>

          <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-zinc-900">
            {['256-bit SSL', 'SOC 2', 'GDPR Ready'].map(badge => (
              <div key={badge} className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
