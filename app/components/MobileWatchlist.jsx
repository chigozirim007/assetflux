'use client';

import React, { useState } from 'react';
import { usePrices } from '../context/PriceContext';
import { CRYPTO, STOCKS } from '../constants/instruments';
import MobileChartOverlay from './MobileChartOverlay';

// Map watchlist items to their full instrument data for chart rendering
const WATCHLIST_ITEMS = [
  { symbol: 'ETH/USDT', ctxKey: 'ETH/USDT', name: 'ETH/USDT', icon: 'ETH', color: '#818cf8', fallbackChange: '+2.08%', instrumentSymbol: 'ETHUSDT' },
  { symbol: 'SOL/USDT', ctxKey: 'SOL/USDT', name: 'SOL/USDT', icon: 'SOL', color: '#9945ff', fallbackChange: '+0.25%', instrumentSymbol: 'SOLUSDT' },
  { symbol: 'COIN', ctxKey: 'COIN', name: 'COIN', icon: 'COIN', color: '#0052ff', fallbackChange: '+0.035%', instrumentSymbol: 'COIN' },
  { symbol: 'AAPL', ctxKey: 'AAPL', name: 'AAPL', icon: 'AAPL', color: '#818cf8', fallbackChange: '+1.022%', instrumentSymbol: 'AAPL' },
];

function findInstrument(instrumentSymbol) {
  const allInstruments = [...CRYPTO, ...STOCKS];
  return allInstruments.find(i => i.symbol === instrumentSymbol) || {
    symbol: instrumentSymbol,
    name: instrumentSymbol,
    displaySymbol: instrumentSymbol,
    color: '#7c3aed',
    badge: 'STOCK',
  };
}

export default function MobileWatchlist() {
  const { prices } = usePrices();
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white px-1">Watchlist</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {WATCHLIST_ITEMS.map(item => {
            const liveData = prices[item.ctxKey] || {};
            const changeVal = liveData.change != null ? liveData.change : null;
            const displayChange = changeVal != null
              ? `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2)}%`
              : item.fallbackChange;
            const isUp = !displayChange.startsWith('-');

            return (
              <button
                key={item.symbol}
                onClick={() => setSelectedInstrument(findInstrument(item.instrumentSymbol))}
                className="shrink-0 w-36 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 hover:border-violet-600/60 hover:bg-zinc-800/40 active:scale-[0.97] transition-all duration-150 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[9px] shrink-0"
                    style={{ backgroundColor: `${item.color}30`, border: `1px solid ${item.color}60` }}
                  >
                    {item.icon[0]}
                  </div>
                  <p className="font-bold text-xs text-white truncate">{item.name}</p>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 font-mono">{item.symbol}</p>
                  <p className={`text-[11px] font-bold font-mono mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {displayChange}
                  </p>
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
