'use client';

import TradingChartCard from '../TradingChartCard';
import { FOREX } from '../../constants/instruments';

export default function ForexModule({ dense = false }) {
  const items = dense ? FOREX.slice(0, 4) : FOREX.slice(0, 6);
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black">Forex Module</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(inst => <TradingChartCard key={inst.symbol} instrument={inst} />)}
      </div>
    </section>
  );
}

