'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePrices } from './context/PriceContext';
import { getVisibleNavLinks } from './components/Header';
import { useAppState } from './context/AppStateContext';
import { useRouter } from 'next/navigation';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HISTORY_SIZE = 80;

const MARKET_ROUTE_LINKS = [
  { label: 'Crypto', href: '/crypto' },
  { label: 'Forex', href: '/forex' },
  { label: 'Stocks', href: '/stocks' },
  { label: 'Shares', href: '/shares' },
  { label: 'Real Estate', href: '/real-estate' },
];

const TICKER_CONFIG = [
  { key: 'BTC/USDT',  label: 'BTC/USDT', prefix: 'BTC' },
  { key: 'ETH/USDT',  label: 'ETH/USDT', prefix: 'ETH' },
  { key: 'EURUSD=X',  label: 'EUR/USD',  prefix: '' },
  { key: 'AAPL',      label: 'AAPL.US',  prefix: '$' },
  { key: 'TSLA',      label: 'TSLA.US',  prefix: '$' },
  { key: 'SOL/USDT',  label: 'SOL/USDT', prefix: '$' },
  { key: 'BNB/USDT',  label: 'BNB/USDT', prefix: '$' },
];

const MARKET_CARDS = [
  { key: 'BTC/USDT',  name: 'Bitcoin',       symbol: 'BTC/USDT',  prefix: 'BTC', color: '#f59e0b', badge: 'CRYPTO' },
  { key: 'AAPL',      name: 'Apple Inc.',     symbol: 'AAPL.US',   prefix: '$', color: '#818cf8', badge: 'STOCK'  },
  { key: 'EURUSD=X',  name: 'Euro / Dollar',  symbol: 'EUR/USD',   prefix: '',  color: '#34d399', badge: 'FOREX'  },
  { key: 'TSLA',      name: 'Tesla Inc.',     symbol: 'TSLA.US',   prefix: '$', color: '#f43f5e', badge: 'STOCK'  },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtPrice(price, key) {
  if (price == null) return '...';
  if (key === 'BTC/USDT')
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (key === 'EUR/USDT') return price.toFixed(4);
  return price.toFixed(2);
}

function fmtChange(change) {
  if (change == null) return '-';
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

// â”€â”€â”€ SparklineChart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SparklineChart({ id, history, color = '#818cf8', height = 64 }) {
  const chartHistory = history?.length === 1 ? [history[0], history[0]] : history;
  
  if (!chartHistory || chartHistory.length < 2) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-zinc-700 text-[10px] font-mono"
      >
        Building chart...
      </div>
    );
  }

  const min   = Math.min(...chartHistory);
  const max   = Math.max(...chartHistory);
  const range = max - min || Math.abs(min) * 0.001 || 1;
  const n     = chartHistory.length;

  const pts = chartHistory.map((v, i) => {
    const x = ((i / (n - 1)) * 100).toFixed(2);
    const y = (100 - ((v - min) / range) * 94 + 3).toFixed(2);
    return `${x},${y}`;
  });

  const polyPts = pts.join(' ');
  const fillPts = `0,100 ${polyPts} 100,100`;
  const gradId  = `sg-${id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full block"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gradId})`} />
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// â”€â”€â”€ useLocalHistory - tracks sparkline history in component state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useLocalHistory(prices) {
  const [history, setHistory] = React.useState(() =>
    Object.fromEntries(
      Object.entries(prices).map(([k, v]) => [k, [v.price]])
    )
  );
  const lastTimeRef = React.useRef({});

  useEffect(() => {
    Object.entries(prices).forEach(([key, val]) => {
      if (!val?.price) return;
      const now = Date.now();
      if (now - (lastTimeRef.current[key] ?? 0) < 1000) return;
      lastTimeRef.current[key] = now;
      setHistory(prev => {
        const arr = [...(prev[key] ?? []), val.price];
        return { ...prev, [key]: arr.length > HISTORY_SIZE ? arr.slice(-HISTORY_SIZE) : arr };
      });
    });
  }, [prices]);

  return history;
}

// â”€â”€â”€ MarketCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MarketCard({ card, price, change, history }) {
  const { key, name, symbol, prefix, color, badge } = card;
  const up      = (change ?? 0) >= 0;
  const priceRef = React.useRef(null);
  const prevRef  = React.useRef(price);

  useEffect(() => {
    if (price !== prevRef.current && priceRef.current) {
      priceRef.current.classList.remove('price-flash');
      void priceRef.current.offsetWidth;
      priceRef.current.classList.add('price-flash');
      prevRef.current = price;
    }
  }, [price]);

  return (
    <div className="group relative bg-[#0d0f2a]/80 backdrop-blur-xl p-4 xl:p-5 rounded-2xl border border-violet-900/30 shadow-[0_0_20px_rgba(109,40,217,0.08)] flex flex-col gap-2 overflow-hidden hover:border-violet-800/50 transition-all duration-300">

      {/* Badge */}
      <span
        className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
        style={{ color, borderColor: `${color}50`, background: `${color}18` }}
      >
        {badge}
      </span>

      {/* Header row */}
      <div className="flex justify-between items-start pr-10">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">{name}</h3>
          <p className="text-zinc-500 font-mono text-[10px] mt-0.5">{symbol}</p>
        </div>
        <div className="text-right">
          <p
            ref={priceRef}
            className="price-num text-sm sm:text-base font-bold"
            style={{ color }}
          >
            {prefix}{fmtPrice(price, key)}
          </p>
          <p className={`font-bold text-[10px] sm:text-[11px] mt-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtChange(change)} {up ? '^' : 'v'}
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <SparklineChart
        id={key.replace(/[^a-z0-9]/gi, '-')}
        history={history}
        color={color}
        height={60}
      />
    </div>
  );
}

// â”€â”€â”€ WS Status Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WsStatusBadge({ status }) {
  const cfg = {
    live:       { dot: 'bg-emerald-400', label: 'Live' },
    connecting: { dot: 'bg-amber-400',   label: 'Connecting...' },
    offline:    { dot: 'bg-red-400',     label: 'Offline' },
    error:      { dot: 'bg-red-400',     label: 'Offline' },
  }[status] ?? { dot: 'bg-zinc-500', label: '...' };

  return (
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-violet-700/50 bg-violet-900/20 text-violet-300 text-xs font-semibold tracking-wider uppercase">
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
      {cfg.label} Market Terminal
    </div>
  );
}

// â”€â”€â”€ LandingPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LandingPage() {
  /* Shared context - no duplicate WebSocket */
  const { prices, wsStatus } = usePrices();
  const { authLoading, isAuthenticated, signOut, user } = useAppState();
  const history = useLocalHistory(prices);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleLinks = getVisibleNavLinks(isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const tickerItems = useMemo(() => [...TICKER_CONFIG, ...TICKER_CONFIG], []);

  return (
    <div className="min-h-screen bg-[#05060f] text-white font-sans overflow-x-hidden">

      {/* â”€â”€ TICKER BAR â”€ fixed at top â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0b0d1f]/95 backdrop-blur-md border-b border-[#1e1b4b] overflow-hidden">
        <div className="ticker-track py-3 sm:py-4">
          {tickerItems.map((item, i) => {
            const p  = prices[item.key];
            const up = (p?.change ?? 0) >= 0;
            return (
              <span
                key={i}
                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider flex-shrink-0"
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                    up ? 'bg-violet-400' : 'bg-red-400'
                  } ${wsStatus !== 'live' ? 'opacity-40' : ''}`}
                />
                <span className="text-zinc-300">{item.label}</span>
                <span className="text-white font-bold price-num">
                  {item.prefix}{fmtPrice(p?.price, item.key)}
                </span>
                <span className={up ? 'text-violet-400' : 'text-red-400'}>
                  {fmtChange(p?.change)} {up ? '^' : 'v'}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* â”€â”€ BACKGROUND GLOWS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[280px] h-[280px] md:w-[600px] md:h-[600px] bg-violet-700/20 rounded-full blur-[120px] md:blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[240px] h-[240px] md:w-[500px] md:h-[500px] bg-cyan-500/10 rounded-full blur-[100px] md:blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[180px] h-[180px] md:w-[300px] md:h-[300px] bg-fuchsia-600/10 rounded-full blur-[80px] md:blur-[100px]" />
      </div>

      {/* â”€â”€ NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 max-w-7xl mx-auto mt-[44px] sm:mt-[52px] md:mt-[60px] relative z-40">
        <div className="text-lg sm:text-2xl font-black tracking-tighter uppercase flex-shrink-0">
          Asset<span className="text-violet-400">Flux</span>
        </div>

        <div className="hidden lg:flex gap-4 xl:gap-8 font-medium text-zinc-400">
          {visibleLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-violet-400 transition whitespace-nowrap text-sm xl:text-base"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!authLoading && isAuthenticated ? (
            <>
              <Link
                id="profile-btn"
                href="/profile"
                className="hidden sm:flex text-zinc-300 border border-zinc-700 px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold hover:border-violet-500 hover:text-violet-300 transition text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
              >
                {user.username ? `@${user.username}` : 'Profile'}
              </Link>
              <button
                id="logout-btn"
                type="button"
                onClick={signOut}
                className="hidden sm:flex bg-zinc-100 text-zinc-950 px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold hover:bg-white transition-all text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : !authLoading ? (
            <>
              <Link
                id="signin-btn"
                href="/signin"
                className="hidden sm:flex text-zinc-300 border border-zinc-700 px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold hover:border-violet-500 hover:text-violet-300 transition text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
              >
                Sign in
              </Link>
              <Link
                id="signup-btn"
                href="/signup"
                className="hidden sm:flex bg-violet-600 text-white px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:bg-violet-500 transition-all text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          ) : null}

          <button
            id="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(p => !p)}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded-lg border border-zinc-700 hover:border-violet-600 transition ml-0.5 flex-shrink-0"
          >
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* — MOBILE MENU DRAWER —————————————————————————————————————————————————————————————— */}
      <div
        id="mobile-menu-drawer"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#0b0d1f]/98 backdrop-blur-xl border-b border-violet-900/40 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4 max-w-7xl mx-auto">
          {visibleLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-zinc-300 hover:text-violet-400 transition py-3 text-base font-medium border-b border-zinc-800/60 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile Auth Links */}
          {!authLoading && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/60 sm:hidden pb-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="py-2.5 text-center text-zinc-300 border border-zinc-700 rounded-full font-semibold hover:text-violet-300 hover:border-violet-500 transition">
                    Profile
                  </Link>
                  <button type="button" onClick={() => { setMenuOpen(false); signOut(); }} className="py-2.5 text-center bg-zinc-100 text-zinc-950 rounded-full font-bold hover:bg-white transition">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setMenuOpen(false)} className="py-2.5 text-center text-zinc-300 border border-zinc-700 rounded-full font-semibold hover:text-violet-300 hover:border-violet-500 transition">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="py-2.5 text-center bg-violet-600 text-white rounded-full font-bold hover:bg-violet-500 transition shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 md:pt-14 pb-16 sm:pb-20 md:pb-28 grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-10 xl:gap-16 items-center">

        {/* â”€â”€ Left: Copy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-5 sm:space-y-7 text-center lg:text-left">

          <WsStatusBadge status={wsStatus} />

          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-[0.9] tracking-tight">
            Financial Data <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              unlocked.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Millisecond real-time prices across Crypto, Stocks, Shares, Forex and Real Estate.
            Connect with verified experts with proven track records through our social trading terminal.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <Link href="/signup" className="bg-violet-600 text-white px-8 py-3.5 sm:py-4 rounded-2xl text-base font-black hover:bg-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300 text-center">
              Start now
            </Link>
            <Link href="/signin" className="text-white border-2 border-zinc-700 px-8 py-3.5 sm:py-4 rounded-2xl text-base font-bold hover:border-violet-600/60 hover:bg-violet-900/20 transition-all duration-300 text-center">
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {MARKET_ROUTE_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-700 text-zinc-300 hover:text-violet-300 hover:border-violet-600 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-4 justify-center lg:justify-start text-[11px] font-mono text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> WebSocket live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> 2s polling
            </span>
          </div>
        </div>

        {/* â”€â”€ Right: 2Ã—2 Market Card Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          {MARKET_CARDS.map(card => (
            <MarketCard
              key={card.key}
              card={card}
              price={prices[card.key]?.price}
              change={prices[card.key]?.change}
              history={history[card.key]}
            />
          ))}
        </div>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 bg-[#020205] py-16 px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="AssetFlux Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-white tracking-tight">AssetFlux</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Premium, high-performance financial market dashboard and social trading terminal.
            </p>
            <p className="text-zinc-600 text-xs font-mono pt-4 border-t border-zinc-800/50 w-max">
              © {new Date().getFullYear()} AssetFlux. All rights reserved.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Contact Us</h3>
            <ul className="text-sm text-zinc-400 space-y-3">
              <li className="flex flex-col gap-1">
                <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">Email</span>
                <a href="mailto:assetflux.noreply@gmail.com" className="hover:text-violet-400 transition-colors">assetflux.noreply@gmail.com</a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">Phone</span>
                <span className="text-zinc-300">09128096498</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">WhatsApp</span>
                <a href="https://wa.me/2349128096498" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  +234 912 809 6498
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Legal</h3>
            <div className="flex flex-col gap-3 text-sm text-zinc-400 mb-8">
              <Link href="/terms" className="hover:text-violet-400 transition-colors w-fit">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-violet-400 transition-colors w-fit">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:text-violet-400 transition-colors w-fit">Financial Disclaimer</Link>
            </div>
            
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Socials</h3>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet-500 hover:bg-violet-900/20 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet-500 hover:bg-violet-900/20 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet-500 hover:bg-violet-900/20 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
