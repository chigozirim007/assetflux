'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { STOCKS, CRYPTO, FOREX, SHARES, REAL_ESTATE } from '../constants/instruments';

/* â”€â”€ Dynamically build Binance streams for Crypto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CRYPTO_STREAMS = CRYPTO.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${CRYPTO_STREAMS}`;

const STREAM_KEY_MAP = {};
CRYPTO.forEach(c => {
  STREAM_KEY_MAP[c.symbol.toLowerCase()] = c.displaySymbol;
});

const SEED = {};

const LS_KEY = 'af_prices_v3';

/** Read last-known prices from localStorage, fall back to empty */
function loadInitialPrices() {
  if (typeof window === 'undefined') return {};
  try {
    const v3 = localStorage.getItem('af_prices_v3');
    if (v3) return JSON.parse(v3);

    // Fallback to previous cache keys to restore the user's last live prices
    const v2 = localStorage.getItem('af_prices_v2');
    if (v2) return JSON.parse(v2);

    const v1 = localStorage.getItem('af_prices');
    if (v1) {
      const parsed = JSON.parse(v1);
      // Strip out the old hardcoded seeds (150, 100, etc) so they don't return
      const migrated = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (v.price !== 150 && v.price !== 100 && v.price !== 64000) {
          migrated[k] = v;
        }
      }
      return migrated;
    }
    return {};
  } catch {
    return {};
  }
}

const PriceContext = createContext({ prices: {}, wsStatus: 'connecting' });

export function usePrices() {
  return useContext(PriceContext);
}

export function PriceProvider({ children }) {
  const [prices, setPrices] = useState({});
  const [wsStatus, setWsStatus] = useState('connecting');

  useEffect(() => {
    const initial = loadInitialPrices();
    if (Object.keys(initial).length > 0) {
      setPrices(initial);
    }
  }, []);

  const wsRef = useRef(null);
  const reconnTimerRef = useRef(null);
  const pendingRef = useRef({});
  const rafRef = useRef(null);

  /* â”€â”€ Batch updates to RAF (~16ms) to avoid flooding React â”€â”€ */
  const flushPrices = useCallback(() => {
    const batch = { ...pendingRef.current };
    if (Object.keys(batch).length) {
      setPrices(prev => {
        const next = { ...prev, ...batch };
        // Persist to localStorage so offline / refresh shows last real price
        try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
      pendingRef.current = {};
    }
    rafRef.current = null;
  }, []);

  const queuePrice = useCallback((key, obj) => {
    pendingRef.current[key] = obj;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(flushPrices);
  }, [flushPrices]);

  /* ── Binance WebSocket (crypto + EUR/GBP proxy) ── */
  const connectWS = useCallback(() => {
    clearTimeout(reconnTimerRef.current);
    try {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => setWsStatus('live');
      ws.onerror = () => setWsStatus('error');
      ws.onclose = () => {
        setWsStatus('offline');
        reconnTimerRef.current = setTimeout(connectWS, 4000);
      };
      ws.onmessage = ({ data }) => {
        try {
          const { stream, data: d } = JSON.parse(data);
          if (!d?.c) return;
          const streamName = stream.split('@')[0];
          const key = STREAM_KEY_MAP[streamName];
          if (!key) return;
          queuePrice(key, { price: parseFloat(d.c), change: parseFloat(d.P) });
        } catch { /* ignore */ }
      };
      wsRef.current = ws;
    } catch {
      setWsStatus('offline');
      reconnTimerRef.current = setTimeout(connectWS, 4000);
    }
  }, [queuePrice]);

  /* ── Fetch live crypto prices directly from Binance REST API as reliable instant fallback ── */
  const fetchCryptoREST = useCallback(async () => {
    try {
      const symbols = CRYPTO.map(c => `"${c.symbol}"`).join(',');
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${encodeURIComponent(symbols)}]`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(item => {
          const key = STREAM_KEY_MAP[item.symbol.toLowerCase()];
          if (key && item.lastPrice) {
            queuePrice(key, {
              price: parseFloat(item.lastPrice),
              change: parseFloat(item.priceChangePercent),
            });
          }
        });
      }
    } catch { /* ignore */ }
  }, [queuePrice]);

  useEffect(() => {
    fetchCryptoREST();
    connectWS();
    const intervalId = setInterval(fetchCryptoREST, 5000);
    return () => {
      clearTimeout(reconnTimerRef.current);
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalId);
      wsRef.current?.close();
    };
  }, [connectWS, fetchCryptoREST]);

  /* ── Poll Yahoo Finance for all stocks every 5 seconds ── */
  const pollStocks = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');
      const data = await res.json();
      if (data.error) return;
      Object.entries(data).forEach(([ticker, v]) => {
        if (v?.price != null) queuePrice(ticker, v);
      });
    } catch { /* ignore */ }
  }, [queuePrice]);

  useEffect(() => {
    pollStocks();
    const id = setInterval(pollStocks, 5000);
    return () => clearInterval(id);
  }, [pollStocks]);

  return (
    <PriceContext.Provider value={{ prices, wsStatus }}>
      {children}
    </PriceContext.Provider>
  );
}

