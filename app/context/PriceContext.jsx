'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { STOCKS, CRYPTO, FOREX, SHARES, REAL_ESTATE } from '../constants/instruments';

/* â”€â”€ Dynamically build Binance streams for Crypto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CRYPTO_STREAMS = CRYPTO.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
const WS_URL = `wss://data-stream.binance.vision/stream?streams=${CRYPTO_STREAMS}`;

const STREAM_KEY_MAP = {};
CRYPTO.forEach(c => {
  STREAM_KEY_MAP[c.symbol.toLowerCase()] = c.displaySymbol;
});

const SEED = {};

const LS_KEY = 'af_prices_v3';

/** Read last-known prices from localStorage only if cached less than 60 seconds ago */
function loadInitialPrices() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('af_prices_v4');
    if (raw) {
      const { data, timestamp } = JSON.parse(raw);
      // Only return cache if it's less than 60 seconds old
      if (timestamp && (Date.now() - timestamp < 60000)) {
        return data || {};
      }
    }
    // Wipe stale cache keys
    localStorage.removeItem('af_prices_v3');
    localStorage.removeItem('af_prices_v2');
    localStorage.removeItem('af_prices');
    return {};
  } catch {
    return {};
  }
}

const PriceContext = createContext({ prices: {}, wsStatus: 'connecting', injectPrices: () => {} });

export function usePrices() {
  return useContext(PriceContext);
}

export function PriceProvider({ children, initialPrices }) {
  const [prices, setPrices] = useState(() => {
    // Server-provided prices are available immediately (no loading state)
    if (initialPrices && Object.keys(initialPrices).length > 0) {
      return initialPrices;
    }
    return {};
  });
  const [wsStatus, setWsStatus] = useState('connecting');

  useEffect(() => {
    // Merge localStorage cache on mount (only if no server-provided prices)
    const cached = loadInitialPrices();
    if (Object.keys(cached).length > 0) {
      setPrices(prev => {
        if (Object.keys(prev).length === 0) return cached;
        return { ...cached, ...prev }; // Server prices take priority
      });
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
        try {
          localStorage.setItem('af_prices_v4', JSON.stringify({ data: next, timestamp: Date.now() }));
        } catch { /* ignore */ }
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
      const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/24hr?symbols=[${encodeURIComponent(symbols)}]`);
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

  const injectPrices = useCallback((newPrices) => {
    if (!newPrices || Object.keys(newPrices).length === 0) return;
    setPrices(prev => {
      // Only inject if we don't already have live data for these keys
      const merged = { ...prev };
      let updated = false;
      for (const [key, val] of Object.entries(newPrices)) {
        if (!merged[key]) {
          merged[key] = val;
          updated = true;
        }
      }
      return updated ? merged : prev;
    });
  }, []);

  return (
    <PriceContext.Provider value={{ prices, wsStatus, injectPrices }}>
      {children}
    </PriceContext.Provider>
  );
}

