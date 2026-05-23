'use client';

import { useState } from 'react';

export default function SubscriptionPricingCard() {
  const [price, setPrice] = useState(25);
  const gross = price * 100;
  const platformFee = gross * 0.15;
  const estCreator = gross - platformFee;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold">Subscription Marketplace</h3>
      <label className="text-xs text-zinc-500">Monthly access price ($)</label>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm" />
      <p className="text-xs text-zinc-300">Gross (100 subs): ${gross.toFixed(2)}</p>
      <p className="text-xs text-zinc-300">Platform fee (15%): ${platformFee.toFixed(2)}</p>
      <p className="text-xs text-emerald-300 font-semibold">Creator payout (~85%): ${estCreator.toFixed(2)}</p>
    </div>
  );
}

