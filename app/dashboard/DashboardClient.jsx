'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePrices } from '../context/PriceContext';
import { useAppState } from '../context/AppStateContext';

import CategorySiloSelector from '../components/features/CategorySiloSelector';
import ViewModeToggle from '../components/features/ViewModeToggle';
import LoyaltyBadge from '../components/features/LoyaltyBadge';
import NotificationSettingsPanel from '../components/features/NotificationSettingsPanel';
import FeedToggle from '../components/features/FeedToggle';
import FollowButton from '../components/features/FollowButton';
import AuthenticityMetrics from '../components/features/AuthenticityMetrics';
import SubscriptionPricingCard from '../components/features/SubscriptionPricingCard';
import MarketMoodTicker from '../components/features/MarketMoodTicker';
import LocalizationPanel from '../components/features/LocalizationPanel';
import CryptoCheckoutCard from '../components/features/CryptoCheckoutCard';
import EscrowTimeline from '../components/features/EscrowTimeline';
import TradeLockCard from '../components/features/TradeLockCard';
import VerificationGate from '../components/features/VerificationGate';
import Leaderboards from '../components/features/Leaderboards';
import InvestmentSquads from '../components/features/InvestmentSquads';

import CryptoModule from '../components/modules/CryptoModule';
import ForexModule from '../components/modules/ForexModule';
import StockModule from '../components/modules/StockModule';
import RealEstateModule from '../components/modules/RealEstateModule';

import LiveNewsSidebar from '../components/LiveNewsSidebar';

const SOCIAL_POSTS = [
  { id: 1, user: 'AlphaTrader', text: 'Rotation into semis still intact. Watching NVDA structure.', silo: 'stocks' },
  { id: 2, user: 'MacroLion', text: 'DXY softening may support risk assets this session.', silo: 'forex' },
  { id: 3, user: 'ChainScout', text: 'BTC dominance pullback opens room for selected alts.', silo: 'crypto' },
];

const TABS = [
  ['terminal', 'Terminal'],
  ['social', 'Social Graph'],
  ['portfolio', 'Portfolio'],
  ['alerts', 'Alerts'],
  ['intel', 'Intelligence'],
  ['ops', 'Monetization'],
];

function PriceRow({ symbol, value }) {
  const up = (value?.change ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between text-xs bg-zinc-900/40 rounded-lg px-2 py-1.5 border border-zinc-800">
      <span className="text-zinc-400">{symbol}</span>
      <span className="font-mono text-white">{value?.price != null ? value.price.toFixed(2) : '-'}</span>
      <span className={up ? 'text-emerald-400' : 'text-rose-400'}>{value?.change != null ? `${up ? '+' : ''}${value.change.toFixed(2)}%` : '-'}</span>
    </div>
  );
}

export default function DashboardClient({ initialHeadlines = [] }) {
  const [tab, setTab] = useState('terminal');
  const [selectedNews, setSelectedNews] = useState(null);

  const { prices } = usePrices();
  const {
    selectedCategories,
    viewMode,
    user,
    feedMode,
    followedUsers,
    timezone,
    locale,
  } = useAppState();

  const dense = viewMode === 'compact';
  const watched = useMemo(() => ['BTC/USDT', 'ETH/USDT', 'AAPL', 'TSLA', 'EUR/USD'], []);
  const headlines = initialHeadlines.length
    ? initialHeadlines
    : [
      'Global rates commentary pushes mixed risk sentiment.',
      'Property yield outlook diverges across regions.',
      'FX majors pricing in macro-event volatility.',
    ];

  const filteredPosts = useMemo(() => {
    const bySilo = SOCIAL_POSTS.filter(p => selectedCategories.includes(p.silo));
    if (feedMode === 'global') return bySilo;
    return bySilo.filter(p => followedUsers.includes(p.user));
  }, [feedMode, followedUsers, selectedCategories]);

  return (
    <div className="min-h-screen bg-[#05060f] text-white">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[280px_1fr_340px] gap-6">

        <aside className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div>
              <p className="text-lg font-black">AssetFlux Terminal</p>
              <p className="text-xs text-zinc-500">{user.name}</p>
            </div>
            <LoyaltyBadge joinDate={user.created_at} />
            <VerificationGate verified={user.verified} />
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
            <h3 className="text-sm font-bold">Live Tickers</h3>
            {watched.map(s => <PriceRow key={s} symbol={s} value={prices[s]} />)}
          </div>
        </aside>

        <main className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CategorySiloSelector />
            <ViewModeToggle />
          </div>

          {tab === 'terminal' && (
            <div className="space-y-6">
              {selectedCategories.includes('crypto') && <CryptoModule dense={dense} />}
              {selectedCategories.includes('forex') && <ForexModule dense={dense} />}
              {(selectedCategories.includes('stocks') || selectedCategories.includes('shares')) && <StockModule dense={dense} />}
              {selectedCategories.includes('real-estate') && <RealEstateModule dense={dense} />}
            </div>
          )}

          {tab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FeedToggle />
                <Link href="/profile/alphatrader" className="text-xs text-cyan-300">Open Profile -&gt;</Link>
              </div>
              <InvestmentSquads />
              <div className="space-y-3">
                {filteredPosts.map(post => (
                  <div key={post.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">@{post.user}</p>
                      <FollowButton username={post.user} />
                    </div>
                    <p className="text-xs text-zinc-300">{post.text}</p>
                  </div>
                ))}
                {filteredPosts.length === 0 && <p className="text-xs text-zinc-500">No posts in this feed mode.</p>}
              </div>
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="space-y-4">
              <AuthenticityMetrics />
              <TradeLockCard />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="text-sm font-bold mb-2">Public Portfolio Summary</h3>
                <p className="text-xs text-zinc-300">12 stocks, 3 crypto, 2 properties. Detailed holdings are subscriber-gated.</p>
              </div>
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-4">
              <NotificationSettingsPanel />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
                <p className="font-semibold mb-1">Security UX</p>
                <p>2FA onboarding is available in Security settings. Legal disclaimer banner is always shown on finance pages.</p>
                <Link href="/security" className="text-cyan-300">Open Security -&gt;</Link>
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">SSR Headline Rack</p>
            <div className="space-y-2 text-xs text-zinc-300">
              {headlines.map((h) => <p key={h}>- {h}</p>)}
            </div>
          </div>
          <div className="h-[520px] rounded-2xl overflow-hidden border border-zinc-800">
            <LiveNewsSidebar categories={selectedCategories} onSelect={setSelectedNews} />
          </div>
          {selectedNews && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="font-semibold text-white mb-1">{selectedNews.headline}</p>
              <p>{selectedNews.content}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
