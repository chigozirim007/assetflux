'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrices } from '../context/PriceContext';
import { useAppState } from '../context/AppStateContext';

import LoyaltyBadge from '../components/features/LoyaltyBadge';
import NotificationSettingsPanel from '../components/features/NotificationSettingsPanel';
import AuthenticityMetrics from '../components/features/AuthenticityMetrics';
import SubscriptionPricingCard from '../components/features/SubscriptionPricingCard';
import MarketMoodTicker from '../components/features/MarketMoodTicker';
import LocalizationPanel from '../components/features/LocalizationPanel';
import CryptoCheckoutCard from '../components/features/CryptoCheckoutCard';
import EscrowTimeline from '../components/features/EscrowTimeline';
import TradeLockCard from '../components/features/TradeLockCard';
import VerificationGate from '../components/features/VerificationGate';
import Leaderboards from '../components/features/Leaderboards';

import CryptoModule from '../components/modules/CryptoModule';
import ForexModule from '../components/modules/ForexModule';
import StockModule from '../components/modules/StockModule';
import RealEstateModule from '../components/modules/RealEstateModule';

import LiveNewsSidebar from '../components/LiveNewsSidebar';
import SocialFeed from '../components/features/SocialFeed';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileMarketsView from '../components/MobileMarketsView';
import MobileWatchlist from '../components/MobileWatchlist';
import MobileChartOverlay from '../components/MobileChartOverlay';
import { CRYPTO } from '../constants/instruments';

const CATEGORY_META = {
  crypto: {
    label: 'Crypto',
    description: 'Spot prices, crypto news, and trader conversations for your selected digital assets.',
    tickers: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
  },
  forex: {
    label: 'Forex',
    description: 'Currency charts, macro headlines, and mentor commentary for FX pairs.',
    tickers: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X'],
  },
  stocks: {
    label: 'Stocks',
    description: 'Equity charts, company market news, and posts tied to your stock interests.',
    tickers: ['AAPL', 'TSLA', 'NVDA', 'MSFT'],
  },
  shares: {
    label: 'Shares & ETFs',
    description: 'ETF and fund watchlists, index context, and portfolio conversations.',
    tickers: ['SPY', 'QQQ', 'DIA', 'IWM'],
  },
  'real-estate': {
    label: 'Real Estate',
    description: 'REIT charts, property-market intelligence, and real-estate investing discussions.',
    tickers: ['VNQ', 'O', 'AMT', 'PLD'],
  },
};

const TABS = [
  ['terminal', 'Market Workspace'],
  ['news', 'News'],
  ['portfolio', 'Portfolio'],
  ['alerts', 'Alerts'],
  ['intel', 'Intelligence'],
  ['ops', 'Monetization'],
];

function formatPrice(value) {
  if (value == null) return '-';
  if (value > 999) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return value.toFixed(4);
}

function PriceRow({ symbol, value }) {
  const up = (value?.change ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between gap-2 text-xs bg-zinc-900/40 rounded-lg px-2 py-1.5 border border-zinc-800">
      <span className="text-zinc-400 truncate">{symbol}</span>
      <span className="font-mono text-white">{formatPrice(value?.price)}</span>
      <span className={up ? 'text-emerald-400' : 'text-rose-400'}>
        {value?.change != null ? `${up ? '+' : ''}${value.change.toFixed(2)}%` : '-'}
      </span>
    </div>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-5">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{body}</p>
      {action}
    </div>
  );
}

function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto lg:flex-nowrap">
      {categories.map(category => {
        const meta = CATEGORY_META[category];
        if (!meta) return null;
        const active = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition ${
              active
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

function MarketModule({ category }) {
  if (category === 'crypto') return <CryptoModule />;
  if (category === 'forex') return <ForexModule />;
  if (category === 'stocks') return <StockModule assetType="stocks" />;
  if (category === 'shares') return <StockModule assetType="shares" />;
  if (category === 'real-estate') return <RealEstateModule />;
  return null;
}

function CategoryCommunity({ category }) {
  const label = CATEGORY_META[category]?.label || 'this market';
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">{label} Posts</h3>
        <Link href="/profile" className="text-[11px] text-cyan-300 hover:text-cyan-200">Open social graph</Link>
      </div>
      <SocialFeed category={category} title={`${label} Feed`} />
    </div>
  );
}

function DashboardSidebar({
  displayName,
  user,
  tab,
  onTabChange,
  activeMeta,
  watched,
  prices,
  followedUsers,
  onNavigate,
  onLogout,
}) {
  const selectTab = (id) => {
    onTabChange(id);
    onNavigate?.();
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <div>
          <p className="text-lg font-black">AssetFlux Terminal</p>
          <p className="text-xs text-zinc-500">{displayName}</p>
        </div>
        <LoyaltyBadge joinDate={user.created_at} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link onClick={onNavigate} href="/profile" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:border-violet-500">Profile</Link>
          <Link onClick={onNavigate} href="/account-settings" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:border-violet-500">Settings</Link>
          {user?.role === 'admin' && (
            <Link onClick={onNavigate} href="/admin" className="col-span-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 font-bold text-amber-300 hover:bg-amber-500/20 text-center flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Admin Operations
            </Link>
          )}
          <button type="button" onClick={onLogout} className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-100 px-3 py-2 font-bold text-zinc-950 hover:bg-white">Logout</button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <h3 className="text-sm font-bold">Navigation</h3>
        <div className="flex flex-col gap-2">
          {TABS.map(([id, label]) => {
            const isDisabled = id === 'portfolio' || id === 'ops';
            const displayLabel = isDisabled ? `${label} (Coming Soon)` : label;
            return (
              <button
                key={id}
                disabled={isDisabled}
                onClick={() => !isDisabled && selectTab(id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isDisabled ? 'bg-zinc-950/30 border border-zinc-800/30 text-zinc-700 cursor-not-allowed' :
                  tab === id ? 'bg-violet-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
        <h3 className="text-sm font-bold">{activeMeta ? `${activeMeta.label} Tickers` : 'Live Tickers'}</h3>
        {watched.length ? watched.map(s => <PriceRow key={s} symbol={s} value={prices[s]} />) : (
          <p className="text-xs text-zinc-500">Choose market interests in settings to build this watchlist.</p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Mentors</span>
          <span className="font-bold text-white">{followedUsers.length}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-zinc-500">Mentees</span>
          <span className="font-bold text-white">0</span>
        </div>
      </div>
    </>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [tab, setTab] = useState('terminal');
  const [mobileTab, setMobileTab] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeNewsCategory, setActiveNewsCategory] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dashboardChartInstrument, setDashboardChartInstrument] = useState(null);

  const { prices } = usePrices();
  const {
    selectedCategories,
    user,
    followedUsers,
    locale,
    timezone,
    signOut,
  } = useAppState();

  const handleLogout = async () => {
    await signOut();
    router.replace('/signin');
  };

  const availableCategories = useMemo(
    () => selectedCategories.filter(category => CATEGORY_META[category]),
    [selectedCategories]
  );

  useEffect(() => {
    if (!availableCategories.length) {
      setActiveCategory('');
      return;
    }
    if (!activeCategory || !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
  }, [activeCategory, availableCategories]);

  useEffect(() => {
    if (!availableCategories.length) {
      setActiveNewsCategory('');
      return;
    }
    if (!activeNewsCategory || !availableCategories.includes(activeNewsCategory)) {
      setActiveNewsCategory(availableCategories[0]);
    }
  }, [activeNewsCategory, availableCategories]);

  const currentCategory = activeCategory && availableCategories.includes(activeCategory)
    ? activeCategory
    : availableCategories[0] || '';
  const activeMeta = CATEGORY_META[currentCategory];
  const watched = activeMeta?.tickers || [];
  const displayName = user.name || user.username || 'AssetFlux User';
  const currentNewsCategory = activeNewsCategory && availableCategories.includes(activeNewsCategory)
    ? activeNewsCategory
    : availableCategories[0] || '';
  const activeNewsCategories = useMemo(
    () => currentNewsCategory ? [currentNewsCategory] : [],
    [currentNewsCategory]
  );

  return (
    <div className="min-h-screen bg-[#05060f] text-white">
      {/* Mobile Top Header (Clean Single Header) */}
      <div className="sticky top-0 z-40 border-b border-zinc-900 bg-[#05060f]/95 px-4 py-3 backdrop-blur xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">AssetFlux Terminal</p>
            <p className="truncate text-[11px] text-zinc-500">{displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <span className="h-0.5 w-4 rounded bg-zinc-200" />
              <span className="h-0.5 w-4 rounded bg-zinc-200" />
              <span className="h-0.5 w-4 rounded bg-zinc-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm p-4 xl:hidden flex flex-col justify-start pt-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Search Tickers & Markets</p>
              <button onClick={() => setSearchOpen(false)} className="text-xs text-zinc-400">Close</button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search BTC, ETH, SOL, AAPL..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto border-l border-zinc-800 bg-[#080912] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <DashboardSidebar
                displayName={displayName}
                user={user}
                tab={tab}
                onTabChange={setTab}
                activeMeta={activeMeta}
                watched={watched}
                prices={prices}
                followedUsers={followedUsers}
                onNavigate={() => setMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Redesign Main Container (Matching Screenshots 1, 2, 3) */}
      <div className="xl:hidden max-w-7xl mx-auto px-4 py-4 space-y-4 pb-24">
        {mobileTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Featured Candlestick Chart Card — Clickable */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDashboardChartInstrument(CRYPTO[0])}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDashboardChartInstrument(CRYPTO[0]); }}
              className="w-full rounded-2xl border border-zinc-800 bg-[#0d0f1e] overflow-hidden space-y-2 hover:border-violet-600/60 active:scale-[0.99] transition-all duration-150 cursor-pointer text-left"
            >
              <div className="p-4 flex items-center justify-between border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-black text-white">Bitcoin / TetherUS</h2>
                    <p className="text-[10px] font-mono text-zinc-500">BTC/USDT</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-violet-600/30 border border-violet-500/50 text-violet-200 font-mono text-xs font-bold">
                  {prices['BTC/USDT']?.price ? `$${prices['BTC/USDT'].price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$62,740.00'}
                </span>
              </div>

              <div className="h-[280px] p-2">
                <CryptoModule dense />
              </div>

              <div className="px-4 py-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-semibold text-zinc-300">
                  Tap to expand chart
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </span>
                <span className="font-mono text-[11px] text-zinc-500">{new Date().toLocaleTimeString()} UTC</span>
              </div>
            </div>

            {/* Horizontal Watchlist Section (Matching Screenshot 1) */}
            <MobileWatchlist />
          </div>
        )}

        {mobileTab === 'markets' && (
          <MobileMarketsView />
        )}

        {mobileTab === 'social' && (
          <SocialFeed category="crypto" title="Market Social Feed" />
        )}
        {/* Dashboard Chart Overlay */}
        {dashboardChartInstrument && (
          <MobileChartOverlay
            instrument={dashboardChartInstrument}
            onClose={() => setDashboardChartInstrument(null)}
          />
        )}
      </div>

      {/* Desktop Main Container */}
      <div className="hidden xl:grid max-w-[1500px] mx-auto px-4 sm:px-6 py-6 grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="space-y-4 self-start sticky top-4">
          <DashboardSidebar
            displayName={displayName}
            user={user}
            tab={tab}
            onTabChange={setTab}
            activeMeta={activeMeta}
            watched={watched}
            prices={prices}
            followedUsers={followedUsers}
            onLogout={handleLogout}
          />
        </aside>

        <main className="min-w-0 space-y-5">
          {tab === 'terminal' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-black">Market Workspace</p>
                    <p className="text-xs text-zinc-500">Only categories selected during signup or in account settings appear here.</p>
                  </div>
                  {availableCategories.length > 0 && (
                    <CategoryTabs categories={availableCategories} activeCategory={currentCategory} onSelect={setActiveCategory} />
                  )}
                </div>
              </div>

              {!availableCategories.length ? (
                <EmptyState
                  title="No market interests selected"
                  body="Pick the asset classes you want to follow, then your dashboard will build a focused workspace around each one."
                  action={<Link href="/account-settings" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Choose interests</Link>}
                />
              ) : (
                <>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <h1 className="text-2xl font-black">{activeMeta.label}</h1>
                    <p className="text-sm text-zinc-500 mt-1">{activeMeta.description}</p>
                  </div>
                  <MarketModule category={currentCategory} />
                  <CategoryCommunity category={currentCategory} />
                </>
              )}
            </div>
          )}

          {tab === 'news' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-black">Market Intelligence</p>
                    <p className="text-xs text-zinc-500">
                      {availableCategories.length > 1
                        ? 'Choose a market to view category-specific news.'
                        : 'News is filtered to your selected market.'}
                    </p>
                  </div>
                  {availableCategories.length > 1 && (
                    <CategoryTabs categories={availableCategories} activeCategory={currentNewsCategory} onSelect={setActiveNewsCategory} />
                  )}
                </div>
              </div>

              {!availableCategories.length ? (
                <EmptyState
                  title="No market interests selected"
                  body="Choose your markets before opening a personalized news feed."
                  action={<Link href="/account-settings" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Choose interests</Link>}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
                  <div className="h-[620px] overflow-hidden rounded-2xl border border-zinc-800">
                    <LiveNewsSidebar categories={activeNewsCategories} onSelect={setSelectedNews} />
                  </div>
                  {selectedNews ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
                      <p className="font-bold text-white mb-2">{selectedNews.headline}</p>
                      <p className="text-xs text-zinc-500 mb-3">{selectedNews.source}</p>
                      <p className="leading-relaxed">{selectedNews.content}</p>
                    </div>
                  ) : (
                    <EmptyState
                      title="Select a headline"
                      body="Click a market-intelligence item to keep the full context beside your feed."
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="space-y-4">
              <AuthenticityMetrics winRate={0} holdDays={0} risk="Not assessed" />
              <TradeLockCard />
              <EmptyState
                title="Portfolio (Coming Soon)"
                body="Your holdings, public proof, and subscriber-gated portfolio details will appear here once this feature is launched."
              />
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-4">
              <NotificationSettingsPanel />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
                <p className="font-semibold mb-1">Security</p>
                <p className="text-zinc-500">Manage 2FA, email, password, and market interests from account settings.</p>
                <Link href="/account-settings" className="text-cyan-300">Open account settings -&gt;</Link>
              </div>
            </div>
          )}

          {tab === 'intel' && (
            <div className="space-y-4">
              <MarketMoodTicker />
              <LocalizationPanel />
              <Leaderboards />
              <p className="text-[11px] text-zinc-500">Locale: {locale} | Timezone: {timezone}</p>
            </div>
          )}

          {tab === 'ops' && (
            <div className="space-y-4">
              <SubscriptionPricingCard />
              <CryptoCheckoutCard />
              <EscrowTimeline />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <Link href="/marketplace" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 hover:border-violet-500">Marketplace</Link>
                <Link href="/premium" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 hover:border-violet-500">Premium Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 font-bold text-amber-300 hover:bg-amber-500/20">Admin Ops</Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom for mobile screens) */}
      <MobileBottomNav activeTab={mobileTab} onTabSelect={setMobileTab} />
    </div>
  );
}
