'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePrices } from '../context/PriceContext';
import TradingViewChart from './TradingViewChart';

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function fmtPrice(price, decimals) {
  if (price == null) return '-';
  if (price > 999) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(decimals ?? 2);
}
function fmtChange(c) {
  if (c == null) return '-';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

/* â”€â”€ TradingChartCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function TradingChartCard({ instrument, onExpand, isExpanded = false }) {
  const {
    symbol,
    name,
    displaySymbol,
    color = '#7c3aed',
    badge,
    decimals,
  } = instrument;

  const isCrypto = badge === 'CRYPTO';
  const isForex = badge === 'FOREX';
  const priceRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* â”€â”€ Sync with global PriceContext â”€â”€ */
  const { prices, wsStatus } = usePrices();
  const ctxKey = isCrypto ? displaySymbol : symbol;
  const ctxPrice = prices[ctxKey]?.price ?? null;
  const ctxChange = prices[ctxKey]?.change ?? null;

  const displayPrice = ctxPrice;
  const displayChange = ctxChange;
  const displayUp = (displayChange ?? 0) >= 0;

  /* â”€â”€ Map Symbol to TradingView Format â”€â”€ */
  let tvSymbol = 'BINANCE:BTCUSDT';
  if (isCrypto) {
    tvSymbol = `BINANCE:${symbol}`;
  } else if (isForex) {
    tvSymbol = `FX:${(displaySymbol || symbol).replace(/[^A-Z]/g, '')}`;
  } else {
    tvSymbol = `NASDAQ:${symbol}`;
  }

  const decimalPlaces = decimals ?? (displaySymbol?.includes('/') && !isCrypto ? 4 : 2);

  return (
    <div className={`bg-[#0d0f1e] border border-violet-900/25 rounded-2xl overflow-hidden flex flex-col hover:border-violet-800/40 transition-all duration-300 group ${isExpanded ? 'h-full border-none' : 'h-full'}`}>

      {/* â”€â”€ Card Header â”€â”€ */}
      <div className={`flex justify-between items-start px-4 pt-4 pb-2 gap-2 ${isExpanded ? 'hidden' : ''}`}>
        <div className="min-w-0 flex items-start gap-2">
          {badge && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mt-0.5 flex-shrink-0"
              style={{ color, borderColor: `${color}50`, background: `${color}18` }}
            >
              {badge}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">{name}</h3>
              <button 
                onClick={() => onExpand && onExpand(instrument)}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-white transition-all transform hover:scale-110"
                title="Expand Chart"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              </button>
            </div>
            <p className="text-zinc-600 font-mono text-[10px] mt-0.5">{displaySymbol || symbol}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p ref={priceRef} className="price-num text-sm sm:text-base font-bold" style={{ color }}>
            {mounted ? fmtPrice(displayPrice, decimalPlaces) : '-'}
          </p>
          <p className={`font-bold text-[10px] sm:text-[11px] mt-0.5 ${displayUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {mounted ? fmtChange(displayChange) : '-'} {displayUp ? '^' : 'v'}
          </p>
        </div>
      </div>

      {/* â”€â”€ Connection Status â”€â”€ */}
      {!isExpanded && (
        <div className="flex items-center justify-end px-4 pb-2">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              mounted ? (
                isCrypto
                  ? (wsStatus === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600')
                  : 'bg-violet-400 animate-pulse'
              ) : 'bg-zinc-800'
            }`} />
            <span className="text-[9px] text-zinc-500 font-mono whitespace-nowrap uppercase">
              {mounted ? (isCrypto ? (wsStatus === 'live' ? 'WS LIVE' : 'CONN...') : 'POLLING') : 'INIT...'}
            </span>
          </div>
        </div>
      )}

      {/* â”€â”€ TradingView Container â”€â”€ */}
      <div className={`relative flex-1 ${isExpanded ? '' : 'min-h-[320px]'}`}>
         <TradingViewChart 
            tvSymbol={tvSymbol} 
            height={isExpanded ? '100%' : 320} 
            interval={isExpanded ? '60' : '15'} 
            toolbar={isExpanded} 
         />
      </div>
    </div>
  );
}

