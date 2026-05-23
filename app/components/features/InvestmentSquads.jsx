'use client';

const SQUADS = [
  { name: 'Macro Squad', members: 1820 },
  { name: 'Crypto Research Pod', members: 960 },
  { name: 'REIT Value Circle', members: 540 },
];

export default function InvestmentSquads() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-bold mb-3">Investment Squads</h3>
      <div className="space-y-2 text-xs">
        {SQUADS.map(s => (
          <div key={s.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <span>{s.name}</span>
            <span className="text-zinc-500">{s.members.toLocaleString()} members</span>
          </div>
        ))}
      </div>
    </div>
  );
}

