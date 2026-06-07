import SubscriptionPricingCard from '../components/features/SubscriptionPricingCard';
import VerificationGate from '../components/features/VerificationGate';
import ProtectedRoute from '../components/ProtectedRoute';

function MarketplaceContent() {
  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-black">Subscription Marketplace</h1>
        <p className="text-sm text-zinc-400">Set creator pricing, preview fees, and activate monetization controls.</p>
        <VerificationGate verified={true} />
        <SubscriptionPricingCard />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <MarketplaceContent />
    </ProtectedRoute>
  );
}

