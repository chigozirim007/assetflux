'use client';

export default function AuthenticityMetrics({ winRate = 64, holdDays = 19, risk = 'High Risk' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/40"><p className="text-zinc-500 text-xs">Win Rate</p><p className="text-2xl font-black text-emerald-400">{winRate}%</p></div>
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/40"><p className="text-zinc-500 text-xs">Avg Hold</p><p className="text-2xl font-black text-cyan-300">{holdDays}d</p></div>
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/40"><p className="text-zinc-500 text-xs">Risk Profile</p><p className="text-2xl font-black text-amber-300">{risk}</p></div>
    </div>
  );
}

