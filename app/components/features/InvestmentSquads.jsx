'use client';

export default function InvestmentSquads({ squads = [] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-bold mb-3">Investment Squads</h3>
      {squads.length === 0 ? (
        <p className="text-xs text-zinc-500">
          No squads joined yet. Join or create a squad when you are ready to collaborate around a strategy.
        </p>
      ) : (
        <div className="space-y-2 text-xs">
          {squads.map(s => (
            <div key={s.id || s.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
              <span>{s.name}</span>
              <span className="text-zinc-500">{s.memberCount || 0} members</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
