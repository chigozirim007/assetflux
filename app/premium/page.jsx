import AuthenticityMetrics from '../components/features/AuthenticityMetrics';
import EscrowTimeline from '../components/features/EscrowTimeline';
import ProtectedRoute from '../components/ProtectedRoute';

function PremiumContent() {
  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-black">Premium Subscriber Dashboard</h1>
        <AuthenticityMetrics winRate={69} holdDays={21} risk="Moderate" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-bold mb-3">Historical Performance (12M)</h2>
          <div className="h-32 rounded bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-500">Chart placeholder for 12-month growth + allocation pie.</div>
        </div>
        <EscrowTimeline />
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <ProtectedRoute>
      <PremiumContent />
    </ProtectedRoute>
  );
}

