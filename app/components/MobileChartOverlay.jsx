'use client';

import React from 'react';
import TradingChartCard from './TradingChartCard';
import { usePrices } from '../context/PriceContext';

export default function MobileChartOverlay({ instrument, onClose }) {
  const { prices } = usePrices();
  if (!instrument) return null;

  const isCrypto = instrument.badge === 'CRYPTO';
  const ctxKey = isCrypto ? instrument.displaySymbol : instrument.symbol;
  const liveData = prices[ctxKey] || {};
  const livePrice = liveData.price;
  const liveChange = liveData.change ?? 0;
  const isUp = liveChange >= 0;

  return (
    <div className="fixed inset-0 z-[120] bg-[#05060f] flex flex-col xl:hidden animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#080914]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition shrink-0"
            aria-label="Go back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0"
                style={{
                  backgroundColor: `${instrument.color || '#7c3aed'}25`,
                  border: `1px solid ${instrument.color || '#7c3aed'}60`,
                }}
              >
                {instrument.symbol.slice(0, 3)}
              </div>
              <div>
                <h2 className="text-sm font-black text-white truncate">{instrument.name}</h2>
                <p className="text-[10px] font-mono text-zinc-500">{instrument.displaySymbol || instrument.symbol}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Price Badge */}
        <div className="text-right shrink-0">
          <p className="font-mono font-bold text-sm text-white">
            {livePrice != null
              ? `$${livePrice > 999 ? livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : livePrice.toFixed(2)}`
              : '-'}
          </p>
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
              isUp
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
            }`}
          >
            {isUp ? '+' : ''}{liveChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Full-Screen Chart */}
      <div className="flex-1 relative">
        <TradingChartCard instrument={instrument} isExpanded={true} />
      </div>

      {/* Bottom Info Bar */}
      <div className="px-4 py-3 border-t border-zinc-800/80 bg-[#080914] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            {isCrypto ? 'WS Live' : 'Polling'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
        >
          Close Chart
        </button>
      </div>
    </div>
  );
}
