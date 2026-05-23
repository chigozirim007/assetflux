'use client';

const IMPACT_ITEMS = [
  'Rate cuts in Asia -> Potential boost for growth stocks and crypto.',
  'Dollar weakness -> Forex majors may show expanded volatility.',
  'Bond yields up -> REIT pressure likely in short-term sessions.',
];

export default function MarketMoodTicker() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Global Intelligence</h3>
        <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Market Mood: Bullish</span>
      </div>
      <ul className="space-y-2 text-xs text-zinc-300">
        {IMPACT_ITEMS.map((item) => <li key={item}>• {item}</li>)}
      </ul>
      <p className="text-[11px] text-zinc-500">Sources: Institutional + community-weighted flags.</p>
    </div>
  );
}

