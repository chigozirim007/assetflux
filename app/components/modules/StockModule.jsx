'use client';

import LineChartCard from '../LineChartCard';
import { STOCKS, SHARES } from '../../constants/instruments';

export default function StockModule({ dense = false }) {
  const items = dense ? STOCKS.slice(0, 4) : STOCKS.slice(0, 6);
  const etfs = SHARES.slice(0, 2);
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black">Stocks Module</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(inst => <LineChartCard key={inst.symbol} instrument={inst} />)}
      </div>
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/40">
        <h3 className="text-sm font-semibold mb-2">Valuation Snapshot</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
          {etfs.map(inst => <div key={inst.symbol} className="rounded bg-zinc-950 p-2">{inst.symbol}: P/E 24.1 • Div 1.7%</div>)}
        </div>
      </div>
    </section>
  );
}

