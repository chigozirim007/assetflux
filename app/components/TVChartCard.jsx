'use client';

import { useRef, useEffect } from 'react';
import { usePrices } from '../context/PriceContext';
import TradingViewChart from './TradingViewChart';

function fmtPrice(price, decimals) {
  if (price == null) return '-';
  if (price > 999)
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(decimals ?? (price < 10 ? 4 : 2));
}
function fmtChange(c) {
  if (c == null) return '-';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

/*
 * TVChartCard - card wrapper around TradingView widget.
 * Price badge in the header is sourced from the global PriceContext (real-time Binance WS / polling).
 *
 * instrument props:
 *   tvSymbol      - TradingView symbol  e.g. "BINANCE:BTCUSDT", "FX:EURUSD"
 *   priceKey      - key into PriceContext  e.g. "BTC/USDT", "EUR/USDT"
 *   name          - display name
 *   displaySymbol - short label
 *   color         - accent hex
 *   decimals      - optional decimal places override
 *   defaultInterval - TV interval string default "15"
 *   badge         - optional badge text (e.g. "CRYPTO", "FOREX")
 */
export default function TVChartCard({ instrument }) {
  const {
    tvSymbol,
    priceKey,
    name,
    displaySymbol,
    color    = '#818cf8',
    decimals,
    defaultInterval = '15',
    badge,
  } = instrument;

  const { prices } = usePrices();
  const p      = prices[priceKey];
  const price  = p?.price;
  const change = p?.change;
  const isUp   = (change ?? 0) >= 0;

  const priceRef = useRef(null);
  const prevRef  = useRef(price);

  // Flash animation on every price tick
  useEffect(() => {
    if (price !== prevRef.current && priceRef.current) {
      priceRef.current.classList.remove('price-flash');
      void priceRef.current.offsetWidth; // reflow
      priceRef.current.classList.add('price-flash');
      prevRef.current = price;
    }
  }, [price]);

  return (
    <div className="bg-[#0d0f1e] border border-violet-900/25 rounded-2xl overflow-hidden flex flex-col hover:border-violet-800/40 transition-colors duration-300 group">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color, borderColor: `${color}50`, background: `${color}18` }}
            >
              {badge}
            </span>
          )}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">{name}</h3>
            <p className="text-zinc-600 font-mono text-[10px] mt-0.5">{displaySymbol}</p>
          </div>
        </div>

        <div className="text-right">
          <p
            ref={priceRef}
            className="price-num text-sm sm:text-base font-bold"
            style={{ color }}
          >
            {fmtPrice(price, decimals)}
          </p>
          <p className={`font-bold text-[10px] sm:text-[11px] mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtChange(change)} {isUp ? '^' : 'v'}
          </p>
        </div>
      </div>

      {/* â”€â”€ TradingView embedded chart â”€â”€ */}
      <TradingViewChart
        tvSymbol={tvSymbol}
        height={340}
        interval={defaultInterval}
      />
    </div>
  );
}

