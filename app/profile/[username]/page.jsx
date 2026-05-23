'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppState } from '../../context/AppStateContext';
import ProofGate from '../../components/features/ProofGate';
import AuthenticityMetrics from '../../components/features/AuthenticityMetrics';
import LoyaltyBadge from '../../components/features/LoyaltyBadge';

const MOCK_PORTFOLIO = [
  { asset: 'NVDA', appreciation: 24.2, entryDate: '2026-01-10' },
  { asset: 'BTC', appreciation: 18.7, entryDate: '2026-02-01' },
  { asset: 'VNQ', appreciation: 9.4, entryDate: '2026-01-18' },
];

export default function ProfilePage() {
  const params = useParams();
  const username = String(params?.username || 'investor');
  const { isSubscribed, toggleSubscribe, user } = useAppState();
  const creatorId = username.toLowerCase();
  const locked = !isSubscribed(creatorId);

  const summary = useMemo(() => ({ stocks: 8, properties: 2, crypto: 3 }), []);

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
          <h1 className="text-2xl font-black">@{username}</h1>
          <LoyaltyBadge joinDate={user.created_at} />
          <p className="text-sm text-zinc-400">Macro + multi-asset analyst. Past performance does not guarantee future results.</p>
          <p className="text-xs text-zinc-500">Followers: 12.8k | Portfolio summary: {summary.stocks} stocks, {summary.crypto} crypto, {summary.properties} properties</p>
        </div>

        <AuthenticityMetrics winRate={71} holdDays={23} risk="Balanced" />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h2 className="text-lg font-bold">Analysis Feed (Public)</h2>
          <p className="text-sm text-zinc-300">I am rotating into quality growth and selectively adding yield assets as rates stabilize.</p>
          <p className="text-sm text-zinc-300">Watchlist: NVDA, MSFT, BTC, VNQ.</p>
        </div>

        <ProofGate locked={locked} cta={`Join subscribers to unlock @${username}`}>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold">Detailed Portfolio (Subscribers)</h2>
            {MOCK_PORTFOLIO.map(p => (
              <div key={p.asset} className="flex items-center justify-between text-sm border border-zinc-800 bg-zinc-950 rounded-lg p-2">
                <span>{p.asset}</span>
                <span className={p.appreciation >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{p.appreciation >= 0 ? '+' : ''}{p.appreciation}%</span>
                <span className="text-zinc-500">{p.entryDate}</span>
              </div>
            ))}
          </div>
        </ProofGate>

        <button onClick={() => toggleSubscribe(creatorId)} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold">
          {locked ? 'Subscribe to Unlock' : 'Unsubscribe'}
        </button>
      </div>
    </div>
  );
}

