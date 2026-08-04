'use client';

import React, { useState } from 'react';
import { usePrices } from '../context/PriceContext';
import { CRYPTO, STOCKS, FOREX, REAL_ESTATE } from '../constants/instruments';
import MobileChartOverlay from './MobileChartOverlay';

const CATEGORIES = [
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'forex', label: 'Forex' },
  { id: 'real-estate', label: 'Real Estate' },
];

function Sparkline({ color = '#34d399' }) {
  return (
    <svg className="w-20 h-7 overflow-visible" viewBox="0 0 80 28" fill="none">
      <path
        d="M0 20 L12 16 L24 22 L36 12 L48 18 L60 8 L72 14 L80 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MobileMarketsView() {
  const [activeCategory, setActiveCategory] = useState('crypto');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const { prices } = usePrices();

  const getCategoryInstruments = () => {
    switch (activeCategory) {
      case 'crypto':
        return CRYPTO.slice(0, 8);
      case 'stocks':
        return STOCKS.slice(0, 8);
      case 'forex':
        return FOREX.slice(0, 8);
      case 'real-estate':
        return REAL_ESTATE.slice(0, 8);
      default:
        return CRYPTO.slice(0, 8);
    }
  };

  const instruments = getCategoryInstruments();

  return (
    <>
      <div className="space-y-4 pb-20">
        {/* Category Pills Header */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md'
                    : 'bg-zinc-950/60 text-zinc-500 border border-zinc-800/80 hover:text-zinc-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Asset Row List — Now Clickable */}
        <div className="space-y-2.5">
          {instruments.map(inst => {
            const ctxKey = inst.badge === 'CRYPTO' ? inst.displaySymbol : inst.symbol;
            const liveData = prices[ctxKey] || {};
            const livePrice = liveData.price != null ? liveData.price : null;
            const liveChange = liveData.change != null ? liveData.change : 0.45;
            const isUp = liveChange >= 0;

            // Format price display
            let formattedPrice = '-';
            if (livePrice != null) {
              formattedPrice = livePrice > 999
                ? `$${livePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : `$${livePrice.toFixed(2)}`;
            } else {
              formattedPrice = inst.symbol === 'BTCUSDT' ? '$62,740.00' :
                               inst.symbol === 'SOLUSDT' ? '$25.00' :
                               inst.symbol === 'BNBUSDT' ? '$48.65' :
                               inst.symbol === 'ETHUSDT' ? '$42.50' : '$5.00';
            }

            return (
              <button
                key={inst.symbol}
                onClick={() => setSelectedInstrument(inst)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-violet-600/60 hover:bg-zinc-800/40 active:scale-[0.98] transition-all duration-150 cursor-pointer text-left"
              >
                {/* Left: Icon + Name + Display Symbol */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                    style={{ backgroundColor: `${inst.color || '#7c3aed'}25`, border: `1px solid ${inst.color || '#7c3aed'}50` }}
                  >
                    {inst.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{inst.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500">{inst.displaySymbol || inst.symbol}</p>
                  </div>
                </div>

                {/* Center: Sparkline */}
                <div className="hidden sm:block px-2">
                  <Sparkline color={isUp ? '#34d399' : '#f43f5e'} />
                </div>

                {/* Right: Price & Change Badge + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-white">{formattedPrice}</p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isUp ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {isUp ? '+' : ''}{Number(liveChange).toFixed(2)}%
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Chart Overlay */}
      {selectedInstrument && (
        <MobileChartOverlay
          instrument={selectedInstrument}
          onClose={() => setSelectedInstrument(null)}
        />
      )}
    </>
  );
}
