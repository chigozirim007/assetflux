'use client';

import { useState } from 'react';

export default function CryptoCheckoutCard() {
  const [network, setNetwork] = useState('TRC-20');
  const [address] = useState('TQ8x...AssetFlux...USDT');

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold">USDT Checkout</h3>
      <select value={network} onChange={(e) => setNetwork(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs">
        <option>TRC-20</option>
        <option>ERC-20</option>
      </select>
      <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-950 text-xs text-zinc-300 font-mono">{address}</div>
      <p className="text-[11px] text-amber-300">Confirm network before sending. Wrong network may lose funds.</p>
      <div className="w-28 h-28 rounded-lg bg-white text-black flex items-center justify-center text-[10px]">QR</div>
    </div>
  );
}

