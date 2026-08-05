'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from './Header';
import TradingChartCard from './TradingChartCard';
import LineChartCard from './LineChartCard';
import { usePrices } from '../context/PriceContext';

const MARKET_SWITCH_LINKS = [
  { label: 'Crypto', href: '/crypto', key: 'crypto' },
  { label: 'Forex', href: '/forex', key: 'forex' },
  { label: 'Stocks', href: '/stocks', key: 'stocks' },
  { label: 'Shares', href: '/shares', key: 'shares' },
  { label: 'Real Estate', href: '/real-estate', key: 'real-estate' },
];

export default function CategoryPageLayout({ title, subtitle, category, badge, children }) {
  const [expandedChart, setExpandedChart] = React.useState(null);
  const { prices } = usePrices();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('assetflux_focus_full');
      if (saved) {
        try { setExpandedChart(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, []);

  const handleExpand = React.useCallback((chart) => {
    if (typeof window !== 'undefined') sessionStorage.setItem('assetflux_focus_full', JSON.stringify(chart));
    setExpandedChart(chart);
  }, []);

  const handleExitFocus = React.useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('assetflux_focus_full');
    setExpandedChart(null);
  }, []);

  // Clone children to inject onExpand prop if they are chart cards
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // If it's the grid container, we need to go deeper
      if (child.props.children) {
        const nestedChildren = React.Children.map(child.props.children, nestedChild => {
          if (React.isValidElement(nestedChild) && (nestedChild.type === TradingChartCard || nestedChild.type === LineChartCard)) {
            return React.cloneElement(nestedChild, { onExpand: handleExpand });
          }
          return nestedChild;
        });
        return React.cloneElement(child, { children: nestedChildren });
      }
    }
    return child;
  });
  return (
    <div className="min-h-screen bg-[#05060f] text-white font-sans">

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-violet-700/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[350px] h-[350px] bg-cyan-500/8 rounded-full blur-[110px]" />
      </div>

      {/* Nav */}
      <div className="border-b border-zinc-900/60 backdrop-blur-md bg-[#05060f]/80 sticky top-0 z-40">
        <Header active={category} />
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-6">

        {/* ← Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-400 transition-colors duration-200 mb-5 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                {badge}
              </div>
              <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Chart grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {childrenWithProps}
      </main>

      {/* ── Global Expanded Chart Focus Mode ── */}
      {expandedChart && (
        <div className="fixed inset-0 z-[110] bg-[#05060f]/60 backdrop-blur-3xl transition-all duration-500 ease-in-out flex flex-col p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center font-black text-violet-400 text-xl">
                 {expandedChart.symbol[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{expandedChart.name}</h2>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">{expandedChart.displaySymbol} • PRO FOCUS MODE</p>
              </div>
            </div>
            <button 
              onClick={handleExitFocus}
              className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Exit Focus
            </button>
          </div>

          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            {expandedChart.badge === 'CRYPTO' || expandedChart.badge === 'FOREX' ? (
              <TradingChartCard instrument={expandedChart} isExpanded={true} />
            ) : (
              <LineChartCard instrument={expandedChart} isExpanded={true} />
            )}
            
            <div className="absolute top-8 right-8 flex flex-col gap-3 pointer-events-none">
               <div className="px-6 py-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Live Price</p>
                  <p className="text-2xl font-black text-white font-mono">
                    {prices[expandedChart.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '-'}
                  </p>
               </div>
               <div className={`px-6 py-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 ${
                 (prices[expandedChart.symbol]?.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
               }`}>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">24h Change</p>
                  <p className="text-xl font-black font-mono">
                    {(prices[expandedChart.symbol]?.change || 0).toFixed(2)}%
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


