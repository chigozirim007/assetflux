'use client';

export default function Leaderboards({ leaders = [] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-bold mb-3">Growth & Referral Leaderboard</h3>
      {leaders.length === 0 ? (
        <p className="text-xs text-zinc-500">
          Leaderboards will appear after verified mentors publish enough track record data.
        </p>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, idx) => (
            <div key={leader.id || leader.name} className="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
              <span>{idx + 1}. {leader.name}</span>
              <span className="text-emerald-300">{leader.roi}</span>
              <span className="text-cyan-300">{leader.accuracy}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
