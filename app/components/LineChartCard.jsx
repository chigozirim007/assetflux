'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrices } from '../context/PriceContext';

/* â”€â”€ Timeframe config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TIMEFRAMES = [
  { label: '1W', interval: '1h',  range: '7d'  },
  { label: '1M', interval: '1d',  range: '1mo' },
  { label: '3M', interval: '1d',  range: '3mo' },
  { label: '1Y', interval: '1wk', range: '1y'  },
  { label: '5Y', interval: '1mo', range: '5y'  },
];

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function fmtPrice(v, decimals = 2) {
  if (v == null) return '-';
  if (v > 999) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v.toFixed(decimals);
}

function fmtChange(c) {
  if (c == null) return '-';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

/* â”€â”€ Build ECharts option - smooth line + gradient area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function buildOption(closes, timestamps, color, tfLabel, isExpanded = false) {
  // Format x-axis labels based on timeframe
  const labels = timestamps.map(ts => {
    const d = new Date(ts * 1000);
    if (tfLabel === '5Y' || tfLabel === '1Y') {
      return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    }
    if (tfLabel === '3M' || tfLabel === '1M') {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  });

  // Deduplicate consecutive identical labels
  const dedupedLabels = labels.map((l, i) => (i > 0 && labels[i - 1] === l ? '' : l));

  return {
    backgroundColor: 'transparent',
    animation: true,
    grid: { 
      left: isExpanded ? 50 : 8, 
      right: isExpanded ? 50 : 8, 
      top: isExpanded ? 40 : 12, 
      bottom: isExpanded ? 40 : 8 
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#22c55e', width: 1, type: 'dashed' } },
      backgroundColor: '#0f1128',
      borderColor: '#22c55e40',
      borderWidth: 1,
      textStyle: { color: '#e4e4e7', fontSize: 11 },
      formatter(params) {
        const p = params[0];
        if (!p) return '';
        return `<div style="font-size:10px">
          <div style="color:#a1a1aa">${labels[p.dataIndex] || ''}</div>
          <div style="color:#22c55e;font-weight:700">${fmtPrice(p.value)}</div>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: dedupedLabels,
      boundaryGap: false,
      axisLine:  { show: isExpanded, lineStyle: { color: '#ffffff10' } },
      axisTick:  { show: false },
      splitLine: { show: isExpanded, lineStyle: { color: '#ffffff05' } },
      axisLabel: { show: isExpanded, color: '#a1a1aa', fontSize: 10, interval: 'auto' }, 
    },
    yAxis: {
      type: 'value',
      scale: true,
      position: 'right',
      axisLine: { show: isExpanded, lineStyle: { color: '#ffffff10' } },
      axisTick: { show: false },
      splitLine: { show: isExpanded, lineStyle: { color: '#ffffff05' } },
      axisLabel: { show: isExpanded, color: '#a1a1aa', fontSize: 10, formatter: (v) => fmtPrice(v) }, 
    },
    series: [
      {
        type: 'line',
        data: closes,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { color: '#22c55e', width: isExpanded ? 3 : 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0,   color: 'rgba(34, 197, 94, 0.2)' },
              { offset: 1,   color: 'rgba(34, 197, 94, 0)' },
            ],
          },
        },
      },
    ],
  };
}

/* â”€â”€ LineChartCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function LineChartCard({ instrument, onExpand, isExpanded = false }) {
  const {
    symbol,
    name,
    displaySymbol,
    color = '#22c55e', 
  } = instrument;

  const { prices } = usePrices();
  const ctxPrice  = prices[symbol]?.price  ?? null;
  const ctxChange = prices[symbol]?.change ?? null;

  const containerRef  = useRef(null);
  const chartRef      = useRef(null);
  const priceRef      = useRef(null);

  const [tfIdx,    setTfIdx]    = useState(1);   // default 1M
  const [loading,  setLoading]  = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tf = TIMEFRAMES[tfIdx];

  const displayPrice  = ctxPrice;
  const displayUp     = (ctxChange ?? 0) >= 0;

  // Determine market status based on the live API's `marketState`
  const isMarketOpen = prices[symbol]?.marketState === 'REGULAR';

  /* â”€â”€ Init ECharts â”€â”€ */
  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;
    let instance;
    let resizeObs;

    (async () => {
      const echarts = await import('echarts');
      if (!mounted || !containerRef.current) return;
      instance = echarts.init(containerRef.current, null, { renderer: 'canvas' });
      chartRef.current = instance;
      resizeObs = new ResizeObserver(() => {
        if (instance && !instance.isDisposed()) instance.resize();
      });
      resizeObs.observe(containerRef.current);
      if (mounted) setChartReady(true);
    })();

    return () => {
      mounted = false;
      resizeObs?.disconnect();
      if (instance && !instance.isDisposed()) instance.dispose();
      chartRef.current = null;
    };
  }, []);

  /* â”€â”€ Fetch data â”€â”€ */
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      symbol,
      type: 'stock',
      interval: tf.interval,
      range:    tf.range,
    });

    fetch(`/api/candles?${params}`)
      .then(r => r.json())
      .then(({ candles }) => {
        if (cancelled || !candles?.length || !chartRef.current) return;
        const closes     = candles.map(c => c.close);
        const timestamps = candles.map(c => c.time);
        chartRef.current.setOption(
          buildOption(closes, timestamps, color, tf.label, isExpanded),
          { notMerge: true }
        );
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [chartReady, tfIdx, symbol, color, tf.interval, tf.range, tf.label, isExpanded]);

  return (
    <div className={`bg-[#0d0f1e] border border-violet-900/10 rounded-[24px] overflow-hidden flex flex-col shadow-sm transition-all duration-300 hover:border-violet-900/30 group ${isExpanded ? 'h-full border-none' : 'h-full'}`}>

      {/* â”€â”€ Header â”€â”€ */}
      <div className={`px-6 pt-6 pb-2 ${isExpanded ? 'hidden' : ''}`}>
        <div className="flex items-center gap-4 mb-1">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
             <span className="text-[10px] font-black text-violet-400">{symbol.slice(0,3)}</span>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white leading-tight">
                {mounted ? fmtPrice(displayPrice) : '-'}
              </h3>
              <button 
                onClick={() => onExpand ? onExpand(instrument) : setLocalExpanded(true)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-white transition-all transform hover:scale-110"
                title="Expand Chart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${mounted ? (isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400') : 'bg-zinc-800'}`} />
              <span className="text-[11px] font-medium text-zinc-500 tracking-tight">
                {mounted ? (isMarketOpen ? 'Market open' : 'Market closed') : 'Checking status...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Chart â”€â”€ */}
      <div className={`relative flex-1 ${isExpanded ? '' : 'min-h-[280px]'}`}>
        <div ref={containerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0f1e]/60 backdrop-blur-[2px] z-10">
             <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* â”€â”€ Footer: Timeframes â”€â”€ */}
      <div className={`px-4 pb-5 pt-2 border-t border-white/5 flex items-center justify-center gap-2 ${isExpanded ? 'bg-black/20' : ''}`}>
        {TIMEFRAMES.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTfIdx(i)}
            className={`
              flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200
              ${i === tfIdx 
                ? 'text-emerald-400 bg-emerald-400/10' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {localExpanded && !isExpanded && (
        <div className="fixed inset-0 z-[120] bg-[#05060f]/80 p-3 backdrop-blur-2xl sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-black text-white">{name}</p>
              <p className="text-xs font-mono text-zinc-500">{displaySymbol || symbol}</p>
            </div>
            <button
              onClick={() => setLocalExpanded(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10"
            >
              Exit Focus
            </button>
          </div>
          <div className="h-[calc(100vh-92px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f1e]">
            <LineChartCard instrument={instrument} isExpanded />
          </div>
        </div>
      )}
    </div>
  );
}


