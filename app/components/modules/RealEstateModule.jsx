'use client';

import { useMemo, useState } from 'react';
import LineChartCard from '../LineChartCard';
import { REAL_ESTATE } from '../../constants/instruments';

export default function RealEstateModule({ dense = false }) {
  const [purchase, setPurchase] = useState('');
  const [annualRent, setAnnualRent] = useState('');
  const [annualCosts, setAnnualCosts] = useState('');

  const purchaseValue = Number(purchase);
  const rentValue = Number(annualRent);
  const costValue = Number(annualCosts);

  const roi = useMemo(() => {
    if (!purchaseValue) return null;
    return (((rentValue - costValue) / purchaseValue) * 100);
  }, [purchaseValue, rentValue, costValue]);

  const yieldPct = useMemo(() => {
    if (!purchaseValue) return null;
    return ((rentValue / purchaseValue) * 100);
  }, [purchaseValue, rentValue]);

  const items = dense ? REAL_ESTATE.slice(0, 2) : REAL_ESTATE.slice(0, 4);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black">Real Estate Markets</h2>
      <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/40 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={purchase} onChange={(e) => setPurchase(e.target.value)} placeholder="Purchase price" />
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={annualRent} onChange={(e) => setAnnualRent(e.target.value)} placeholder="Annual rent" />
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={annualCosts} onChange={(e) => setAnnualCosts(e.target.value)} placeholder="Annual costs" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-zinc-950 border border-zinc-800 p-2">
            ROI: <span className="text-emerald-300 font-bold">{roi == null ? 'Add figures' : `${roi.toFixed(2)}%`}</span>
          </div>
          <div className="rounded bg-zinc-950 border border-zinc-800 p-2">
            Rental Yield: <span className="text-cyan-300 font-bold">{yieldPct == null ? 'Add figures' : `${yieldPct.toFixed(2)}%`}</span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500">
          Enter a property scenario to model yield against the live REIT watchlist below.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(inst => <LineChartCard key={inst.symbol} instrument={inst} />)}
      </div>
    </section>
  );
}
