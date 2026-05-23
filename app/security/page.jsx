'use client';

import { useState } from 'react';

export default function SecurityPage() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-black">Security Center</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-sm font-semibold">Two-Factor Authentication</p>
          <button onClick={() => setEnabled(!enabled)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}>{enabled ? 'Enabled' : 'Enable 2FA'}</button>
          <p className="text-xs text-zinc-500">OTP / authenticator flow for monetized accounts.</p>
        </div>
        <div className="rounded-xl border border-amber-700/40 bg-amber-900/10 p-4 text-xs text-amber-200">
          Not financial advice. Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  );
}

