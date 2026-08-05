'use client';

import { useEffect, useRef, useId } from 'react';

/*
 * TradingViewChart - embeds TradingView's free Advanced Real-Time Chart widget.
 * Live data, built-in timeframe selector (click-based), price axis on the right.
 * Crypto: BINANCE:BTCUSDT  |  Forex: FX:EURUSD  |  Stocks: NASDAQ:AAPL
 */
export default function TradingViewChart({
  tvSymbol,
  height = 380,
  interval = '15',
}) {
  const uid         = useId().replace(/:/g, '');
  const containerId = `tv_${uid}`;
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous widget
    container.innerHTML = '';

    // TradingView requires a child div with the id
    const inner = document.createElement('div');
    inner.id = containerId;
    inner.style.height = '100%';
    inner.style.width  = '100%';
    container.appendChild(inner);

    const initWidget = () => {
      if (!window.TradingView || !container.isConnected) return;
      new window.TradingView.widget({
        autosize:            true,
        symbol:              tvSymbol,
        interval:            interval,
        timezone:            'Etc/UTC',
        theme:               'dark',
        style:               '1',        // candlestick
        locale:              'en',
        toolbar_bg:          '#0d0f1e',
        enable_publishing:   false,
        hide_top_toolbar:    false,      // show timeframe toolbar
        hide_legend:         false,
        hide_side_toolbar:   false,      // show drawing tools
        allow_symbol_change: true,
        save_image:          true,
        withdateranges:      true,
        details:             false,
        hotlist:             false,
        calendar:            false,
        backgroundColor:     '#0d0f1e',
        gridColor:           'rgba(30,27,75,0.12)',
        container_id:        containerId,
      });
    };

    if (window.TradingView) {
      initWidget();
    } else if (!document.getElementById('tv-script')) {
      const script  = document.createElement('script');
      script.id     = 'tv-script';
      script.src    = 'https://s3.tradingview.com/tv.js';
      script.async  = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      // Script tag exists but hasn't fired yet - poll
      const poll = setInterval(() => {
        if (window.TradingView) { clearInterval(poll); initWidget(); }
      }, 80);
      return () => { clearInterval(poll); if (container) container.innerHTML = ''; };
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvSymbol, interval, containerId]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-b-2xl overflow-hidden"
    />
  );
}

