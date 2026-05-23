'use client';

const LEADERS = [
  { name: 'MacroLion', roi: '+42.1%', accuracy: '78%' },
  { name: 'FXNinja', roi: '+31.8%', accuracy: '73%' },
  { name: 'ValueOrbit', roi: '+28.4%', accuracy: '81%' },
];

export default function Leaderboards() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-bold mb-3">Growth & Referral Leaderboard</h3>
      <div className="space-y-2">
        {LEADERS.map((l, idx) => (
          <div key={l.name} className="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
            <span>{idx + 1}. {l.name}</span>
            <span className="text-emerald-300">{l.roi}</span>
            <span className="text-cyan-300">{l.accuracy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

