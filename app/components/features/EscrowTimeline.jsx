'use client';

export default function EscrowTimeline() {
  const steps = ['USDT Detected', 'Confirming on Blockchain', 'Fee Split (15% / 85%)', 'Access Granted'];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold">Escrow Transparency</h3>
      <ol className="space-y-2 text-xs text-zinc-300">
        {steps.map((s, i) => <li key={s} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-violet-600 text-white grid place-items-center text-[10px]">{i + 1}</span>{s}</li>)}
      </ol>
      <p className="text-[11px] text-zinc-500">TXID: <span className="text-cyan-300">0xA1...B3C9</span> (Explorer link)</p>
    </div>
  );
}

