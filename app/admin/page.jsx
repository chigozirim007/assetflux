import ProtectedRoute from '../components/ProtectedRoute';

function AdminContent() {
  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-black">Owner Operations</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"><p className="text-xs text-zinc-500">Total Subs Volume</p><p className="text-xl font-black">$248,900</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"><p className="text-xs text-zinc-500">Platform Revenue</p><p className="text-xl font-black">$37,335</p></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"><p className="text-xs text-zinc-500">Risk Queue</p><p className="text-xl font-black">14 Profiles</p></div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
          RBAC-protected views only. Includes reported portfolios and suspicious return reviews.
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

