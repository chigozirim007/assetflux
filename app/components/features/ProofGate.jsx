'use client';

export default function ProofGate({ locked, cta, children }) {
  if (!locked) return children;

  return (
    <div className="relative rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">Proof of Competence Locked</p>
          <button className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold">{cta || 'Subscribe to unlock'}</button>
        </div>
      </div>
    </div>
  );
}

