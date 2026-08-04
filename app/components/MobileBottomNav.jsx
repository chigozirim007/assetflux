'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav({ activeTab, onTabSelect }) {
  const pathname = usePathname();

  const isDashboard = activeTab ? activeTab === 'dashboard' : (pathname === '/dashboard' || pathname === '/');
  const isMarkets = activeTab ? activeTab === 'markets' : (['/crypto', '/stocks', '/forex', '/shares', '/real-estate'].includes(pathname));
  const isSocial = activeTab ? activeTab === 'social' : pathname === '/profile';
  const isProfile = activeTab ? activeTab === 'profile' : (pathname === '/profile' || pathname === '/account-settings');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080914]/95 backdrop-blur-xl border-t border-zinc-800/80 px-3 py-2 flex items-center justify-around xl:hidden">
      {/* Dashboard Tab */}
      <button
        onClick={() => onTabSelect ? onTabSelect('dashboard') : null}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition ${
          isDashboard
            ? 'bg-zinc-800/80 text-white font-bold border border-zinc-700/60 shadow-lg'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-[10px]">Dashboard</span>
      </button>

      {/* Markets Tab */}
      <button
        onClick={() => onTabSelect ? onTabSelect('markets') : null}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition ${
          isMarkets
            ? 'bg-zinc-800/80 text-white font-bold border border-zinc-700/60 shadow-lg'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-[10px]">Markets</span>
      </button>

      {/* Social Tab */}
      <button
        onClick={() => onTabSelect ? onTabSelect('social') : null}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition ${
          isSocial
            ? 'bg-zinc-800/80 text-white font-bold border border-zinc-700/60 shadow-lg'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-[10px]">Social</span>
      </button>

      {/* Profile Tab */}
      <Link
        href="/profile"
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition ${
          isProfile
            ? 'bg-zinc-800/80 text-white font-bold border border-zinc-700/60 shadow-lg'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px]">Profile</span>
      </Link>
    </nav>
  );
}
