'use client';

import { useState } from 'react';

export default function TradeLockCard() {
  const [isPublic] = useState(true);
  const [closed, setClosed] = useState(false);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold">Trade Lock</h3>
      <p className="text-xs text-zinc-400">Once public, trade entries become immutable. Only close action is allowed.</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-zinc-800">Status: {closed ? 'Closed' : 'Open'}</span>
        <span className="px-2 py-1 rounded bg-zinc-800">Public: {isPublic ? 'Yes' : 'No'}</span>
      </div>
      <button onClick={() => setClosed(true)} disabled={closed} className="px-3 py-1.5 rounded-lg bg-rose-600 disabled:opacity-40 text-white text-xs font-bold">Close Trade</button>
    </div>
  );
}

