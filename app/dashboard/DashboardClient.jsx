'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
    <div className="flex flex-wrap gap-2">
      {categories.map(category => {
        const meta = CATEGORY_META[category];
        if (!meta) return null;
        const active = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition ${
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
      <EmptyState
        title="No posts in this workspace yet"
        body={`Mentor notes, trade ideas, and category-specific discussions for ${label.toLowerCase()} will appear here after people you follow start posting.`}
      />
    </div>
  );
}

export default function DashboardClient() {
  const [tab, setTab] = useState('terminal');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  const { prices } = usePrices();
  const {
    selectedCategories,
    user,
    followedUsers,
    locale,
    timezone,
  } = useAppState();

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

  const currentCategory = activeCategory && availableCategories.includes(activeCategory)
    ? activeCategory
    : availableCategories[0] || '';
  const activeMeta = CATEGORY_META[currentCategory];
  const watched = activeMeta?.tickers || [];
  const displayName = user.name || user.username || 'AssetFlux User';
  const activeNewsCategories = useMemo(
    () => currentCategory ? [currentCategory] : [],
    [currentCategory]
  );

  return (
    <div className="min-h-screen bg-[#05060f] text-white">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[280px_1fr_340px] gap-6">

        <aside className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div>
              <p className="text-lg font-black">AssetFlux Terminal</p>
              <p className="text-xs text-zinc-500">{displayName}</p>
            </div>
            <LoyaltyBadge joinDate={user.created_at} />
            <VerificationGate verified={user.verified} />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/profile" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:border-violet-500">Profile</Link>
              <Link href="/account-settings" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:border-violet-500">Settings</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <h3 className="text-sm font-bold">Navigation</h3>
            <div className="flex flex-col gap-2">
              {TABS.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`text-left px-3 py-2 rounded-lg text-xs font-semibold ${tab === id ? 'bg-violet-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-400'}`}>{label}</button>
              ))}
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
        </aside>

        <main className="space-y-5">
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

          {tab === 'portfolio' && (
            <div className="space-y-4">
              <AuthenticityMetrics winRate={0} holdDays={0} risk="Not assessed" />
              <TradeLockCard />
              <EmptyState
                title="No portfolio activity yet"
                body="Your holdings, public proof, and subscriber-gated portfolio details will appear after you connect or publish them."
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
                <Link href="/admin" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 hover:border-violet-500">Admin Ops</Link>
              </div>
            </div>
          )}
        </main>

        <aside className="space-y-4">
          <div className="h-[520px] rounded-2xl overflow-hidden border border-zinc-800">
            <LiveNewsSidebar categories={activeNewsCategories} onSelect={setSelectedNews} />
          </div>
          {selectedNews ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="font-semibold text-white mb-1">{selectedNews.headline}</p>
              <p>{selectedNews.content}</p>
            </div>
          ) : (
            <EmptyState
              title="Select a headline"
              body="Click a market-intelligence item to keep the full context pinned beside your workspace."
            />
          )}
        </aside>
      </div>
    </div>
  );
}
