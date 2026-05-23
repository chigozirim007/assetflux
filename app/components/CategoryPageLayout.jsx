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
  const [expandedChart, setExpandedChart] = useState(null);
  const { prices } = usePrices();

  // Clone children to inject onExpand prop if they are chart cards
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // If it's the grid container, we need to go deeper
      if (child.props.children) {
        const nestedChildren = React.Children.map(child.props.children, nestedChild => {
          if (React.isValidElement(nestedChild) && (nestedChild.type === TradingChartCard || nestedChild.type === LineChartCard)) {
            return React.cloneElement(nestedChild, { onExpand: setExpandedChart });
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

        {/* â† Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-400 transition-colors duration-200 mb-5 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-violet-700/50 bg-violet-900/20 text-violet-300 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-zinc-500 text-sm sm:text-base mt-1.5 max-w-xl">{subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {MARKET_SWITCH_LINKS.map(link => {
                const isActive = category === link.key;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      isActive
                        ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                        : 'border-zinc-700 text-zinc-300 hover:text-violet-300 hover:border-violet-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chart grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {childrenWithProps}
      </main>

      {/* â”€â”€ Global Expanded Chart Focus Mode â”€â”€ */}
      {expandedChart && (
        <div className="fixed inset-0 z-[110] bg-[#05060f]/60 backdrop-blur-3xl transition-all duration-500 ease-in-out flex flex-col p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center font-black text-violet-400 text-xl">
                 {expandedChart.symbol[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{expandedChart.name}</h2>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">{expandedChart.displaySymbol} â€¢ PRO FOCUS MODE</p>
              </div>
            </div>
            <button 
              onClick={() => setExpandedChart(null)}
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
                    {prices[expandedChart.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || 'â€”'}
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


