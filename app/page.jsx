'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePrices } from './context/PriceContext';
import { NAV_LINKS } from './components/Header';

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
  { key: 'BTC/USDT',  label: 'BTC/USDT', prefix: 'â‚¿' },
  { key: 'ETH/USDT',  label: 'ETH/USDT', prefix: 'Îž' },
  { key: 'EUR/USDT',  label: 'EUR/USD',  prefix: '' },
  { key: 'AAPL',      label: 'AAPL.US',  prefix: '$' },
  { key: 'TSLA',      label: 'TSLA.US',  prefix: '$' },
  { key: 'SOL/USDT',  label: 'SOL/USDT', prefix: '$' },
  { key: 'BNB/USDT',  label: 'BNB/USDT', prefix: '$' },
];

const MARKET_CARDS = [
  { key: 'BTC/USDT',  name: 'Bitcoin',       symbol: 'BTC/USDT',  prefix: 'â‚¿', color: '#f59e0b', badge: 'CRYPTO' },
  { key: 'AAPL',      name: 'Apple Inc.',     symbol: 'AAPL.US',   prefix: '$', color: '#818cf8', badge: 'STOCK'  },
  { key: 'EUR/USDT',  name: 'Euro / Dollar',  symbol: 'EUR/USD',   prefix: '',  color: '#34d399', badge: 'FOREX'  },
  { key: 'TSLA',      name: 'Tesla Inc.',     symbol: 'TSLA.US',   prefix: '$', color: '#f43f5e', badge: 'STOCK'  },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtPrice(price, key) {
  if (price == null) return 'â€¦';
  if (key === 'BTC/USDT')
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (key === 'EUR/USDT') return price.toFixed(4);
  return price.toFixed(2);
}

function fmtChange(change) {
  if (change == null) return 'â€”';
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

// â”€â”€â”€ SparklineChart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SparklineChart({ id, history, color = '#818cf8', height = 64 }) {
  if (!history || history.length < 2) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-zinc-700 text-[10px] font-mono"
      >
        Building chartâ€¦
      </div>
    );
  }

  const min   = Math.min(...history);
  const max   = Math.max(...history);
  const range = max - min || Math.abs(min) * 0.001 || 1;
  const n     = history.length;

  const pts = history.map((v, i) => {
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

// â”€â”€â”€ useLocalHistory â€” tracks sparkline history in component state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            {fmtChange(change)} {up ? 'â–²' : 'â–¼'}
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
    connecting: { dot: 'bg-amber-400',   label: 'Connectingâ€¦' },
    offline:    { dot: 'bg-red-400',     label: 'Offline' },
    error:      { dot: 'bg-red-400',     label: 'Offline' },
  }[status] ?? { dot: 'bg-zinc-500', label: 'â€¦' };

  return (
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-violet-700/50 bg-violet-900/20 text-violet-300 text-xs font-semibold tracking-wider uppercase">
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
      {cfg.label} Market Terminal
    </div>
  );
}

// â”€â”€â”€ LandingPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LandingPage() {
  /* Shared context â€” no duplicate WebSocket */
  const { prices, wsStatus } = usePrices();
  const history = useLocalHistory(prices);
  const [menuOpen, setMenuOpen] = useState(false);

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
                  {fmtChange(p?.change)} {up ? 'â–²' : 'â–¼'}
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
          {NAV_LINKS.map(link => (
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
          <Link
            id="signin-btn"
            href="/signin"
            className="text-zinc-300 border border-zinc-700 px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold hover:border-violet-500 hover:text-violet-300 transition text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
          >
            Sign in
          </Link>
          <Link
            id="signup-btn"
            href="/signup"
            className="bg-violet-600 text-white px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:bg-violet-500 transition-all text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
          >
            Sign up
          </Link>

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

      {/* â”€â”€ MOBILE MENU DRAWER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        id="mobile-menu-drawer"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#0b0d1f]/98 backdrop-blur-xl border-b border-violet-900/40 ${
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4 max-w-7xl mx-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-zinc-300 hover:text-violet-400 transition py-3 text-base font-medium border-b border-zinc-800/60 last:border-0"
            >
              {link.label}
            </Link>
          ))}
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
    </div>
  );
}
