'use client';

import { useMemo, useState } from 'react';
import LineChartCard from '../LineChartCard';
import { REAL_ESTATE } from '../../constants/instruments';

export default function RealEstateModule({ dense = false }) {
  const [purchase, setPurchase] = useState(85000);
  const [annualRent, setAnnualRent] = useState(9600);
  const [annualCosts, setAnnualCosts] = useState(2100);

  const roi = useMemo(() => {
    if (!purchase) return 0;
    return (((annualRent - annualCosts) / purchase) * 100);
  }, [purchase, annualRent, annualCosts]);

  const yieldPct = useMemo(() => {
    if (!purchase) return 0;
    return ((annualRent / purchase) * 100);
  }, [purchase, annualRent]);

  const items = dense ? REAL_ESTATE.slice(0, 2) : REAL_ESTATE.slice(0, 4);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black">Real Estate Module</h2>
      <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/40 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={purchase} onChange={(e) => setPurchase(Number(e.target.value) || 0)} placeholder="Purchase" />
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={annualRent} onChange={(e) => setAnnualRent(Number(e.target.value) || 0)} placeholder="Annual Rent" />
          <input className="bg-zinc-950 border border-zinc-700 rounded p-2 text-xs" type="number" value={annualCosts} onChange={(e) => setAnnualCosts(Number(e.target.value) || 0)} placeholder="Annual Costs" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-zinc-950 border border-zinc-800 p-2">ROI: <span className="text-emerald-300 font-bold">{roi.toFixed(2)}%</span></div>
          <div className="rounded bg-zinc-950 border border-zinc-800 p-2">Rental Yield: <span className="text-cyan-300 font-bold">{yieldPct.toFixed(2)}%</span></div>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 mb-1">Local Trend Indicator</p>
          <div className="h-2 rounded bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${Math.max(8, Math.min(100, roi * 4))}%` }} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(inst => <LineChartCard key={inst.symbol} instrument={inst} />)}
      </div>
    </section>
  );
}

