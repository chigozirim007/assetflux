import Leaderboards from '../components/features/Leaderboards';

export default function GrowthPage() {
  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-black">Growth & Referral Ecosystem</h1>
        <p className="text-sm text-zinc-400">Top earners, top accuracy, and teaser mechanics for conversion.</p>
        <Leaderboards />
      </div>
    </div>
  );
}

