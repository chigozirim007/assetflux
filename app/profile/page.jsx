'use client';

import Link from 'next/link';
import { useAppState } from '../context/AppStateContext';
import AuthenticityMetrics from '../components/features/AuthenticityMetrics';
import InvestmentSquads from '../components/features/InvestmentSquads';
import LoyaltyBadge from '../components/features/LoyaltyBadge';
import SocialFeed, { CATEGORY_LABELS } from '../components/features/SocialFeed';
import ProtectedRoute from '../components/ProtectedRoute';

function EmptyPanel({ title, body }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function MyProfileContent() {
  const { user, selectedCategories, followedUsers } = useAppState();
  const displayName = user.name || user.username || 'AssetFlux User';
  const username = user.username || 'set-your-username';

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black">My Profile</h1>
            <p className="text-sm text-zinc-500">Your public identity, social graph, and publishing status.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/account-settings" className="px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:border-violet-500">Edit profile</Link>
            <Link href="/dashboard" className="px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:border-violet-500">Dashboard</Link>
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">{displayName}</h2>
              <p className="text-sm text-zinc-500">@{username}</p>
            </div>
            <LoyaltyBadge joinDate={user.created_at} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Mentors</p>
              <p className="text-2xl font-black">{followedUsers.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Mentees</p>
              <p className="text-2xl font-black">0</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Selected markets</p>
              <p className="text-2xl font-black">{selectedCategories.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCategories.length ? selectedCategories.map(category => (
              <span key={category} className="rounded-full border border-violet-700/50 bg-violet-900/20 px-3 py-1 text-xs font-bold text-violet-300">
                {CATEGORY_LABELS[category] || category}
              </span>
            )) : (
              <Link href="/account-settings" className="text-xs text-cyan-300">Choose market interests</Link>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
              <h2 className="text-lg font-black">Social Graph</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2">Mentors</h3>
                  {followedUsers.length ? followedUsers.map(name => (
                    <div key={name} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">@{name}</div>
                  )) : (
                    <EmptyPanel title="No mentors yet" body="Follow verified investors to build a mentor feed around the way you want to learn." />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2">Mentees</h3>
                  <EmptyPanel title="No mentees yet" body="When other users follow your published profile, they will appear here as mentees." />
                </div>
              </div>
            </div>

            <SocialFeed mode="mine" title="Posts" />
          </div>

          <aside className="space-y-5">
            <AuthenticityMetrics winRate={0} holdDays={0} risk="Not assessed" />
            <InvestmentSquads />
          </aside>
        </section>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <ProtectedRoute>
      <MyProfileContent />
    </ProtectedRoute>
  );
}
