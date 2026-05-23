'use client';

import LineChartCard from '../LineChartCard';
import { STOCKS, SHARES } from '../../constants/instruments';

export default function StockModule({ dense = false, assetType = 'stocks' }) {
  const source = assetType === 'shares' ? SHARES : STOCKS;
  const label = assetType === 'shares' ? 'Shares & ETFs' : 'Stocks';
  const items = dense ? source.slice(0, 4) : source.slice(0, 6);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black">{label}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(inst => <LineChartCard key={inst.symbol} instrument={inst} />)}
      </div>
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/40">
        <h3 className="text-sm font-semibold mb-2">Research Notes</h3>
        <p className="text-xs text-zinc-500">
          No saved research notes yet. Add a thesis from a profile or watchlist to keep context beside these charts.
        </p>
      </div>
    </section>
  );
}
