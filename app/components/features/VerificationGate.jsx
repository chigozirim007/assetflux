'use client';

export default function VerificationGate({ verified }) {
  return (
    <div className={`rounded-xl border p-3 text-xs ${verified ? 'border-emerald-600 bg-emerald-900/10 text-emerald-300' : 'border-amber-600 bg-amber-900/10 text-amber-300'}`}>
      {verified
        ? 'Verified Investor: monetization and premium distribution enabled.'
        : 'Verification required: monetization tools are disabled until audit is complete.'}
    </div>
  );
}

