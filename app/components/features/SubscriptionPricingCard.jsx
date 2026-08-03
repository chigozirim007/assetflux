'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { supabase } from '../../lib/supabase';

export default function SubscriptionPricingCard() {
  const { user, refreshProfile } = useAppState();
  const [price, setPrice] = useState(25);
  const [saving, setSaving] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (user?.subscription_price) {
      setPrice(Number(user.subscription_price));
    }
  }, [user]);

  const gross = price * 100;
  const platformFee = gross * 0.15;
  const estCreator = gross - platformFee;

  // Creator saves monthly subscription price
  const handleSavePrice = async () => {
    if (!user?.id) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_price: price })
        .eq('id', user.id);

      if (error) {
        setStatusMessage({ type: 'error', text: `Save failed: ${error.message}` });
      } else {
        setStatusMessage({ type: 'success', text: 'Subscription tier saved successfully!' });
        await refreshProfile();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error saving price.' });
    } finally {
      setSaving(false);
    }
  };

  // Demo subscription action to generate live transaction data
  const handleCreateTestSubscription = async () => {
    if (!user?.id) return;
    setSubscribing(true);
    setStatusMessage(null);

    try {
      // Find a creator profile (or subscribe to self/demo creator)
      const { data: creatorProfiles } = await supabase
        .from('profiles')
        .select('id, username')
        .limit(5);

      const creator = creatorProfiles?.find(p => p.id !== user.id) || creatorProfiles?.[0];

      if (!creator) {
        setStatusMessage({ type: 'error', text: 'No creator profiles available to subscribe to.' });
        return;
      }

      const { error } = await supabase
        .from('subscriptions')
        .upsert(
          {
            subscriber_id: user.id,
            creator_id: creator.id,
            amount: price || 25,
            status: 'active',
          },
          { onConflict: 'subscriber_id, creator_id' }
        );

      if (error) {
        setStatusMessage({ type: 'error', text: `Subscription failed: ${error.message}` });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Active subscription created for @${creator.username || 'creator'} ($${price}/mo)! Volume updated live in Admin.`,
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error processing subscription.' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Creator Subscription Pricing</h3>
        <span className="text-[10px] text-violet-400 border border-violet-500/40 rounded-full px-2 py-0.5 font-mono">
          15% Platform Take Rate
        </span>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Monthly Tier Price ($USD)</label>
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm font-mono text-white outline-none focus:border-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 font-mono">
        <div>
          <p className="text-zinc-500">Gross (100 subs)</p>
          <p className="text-white font-bold">${gross.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Platform Fee (15%)</p>
          <p className="text-violet-400 font-bold">${platformFee.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Creator Payout (~85%)</p>
          <p className="text-emerald-400 font-bold">${estCreator.toFixed(2)}</p>
        </div>
      </div>

      {statusMessage && (
        <p
          className={`text-xs font-semibold p-2.5 rounded-lg border ${
            statusMessage.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
          }`}
        >
          {statusMessage.text}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button
          onClick={handleSavePrice}
          disabled={saving}
          className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          {saving ? 'Saving Tier...' : 'Save Creator Pricing'}
        </button>

        <button
          onClick={handleCreateTestSubscription}
          disabled={subscribing}
          className="flex-1 border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          {subscribing ? 'Processing...' : 'Subscribe / Activate ($' + price + ')'}
        </button>
      </div>
    </div>
  );
}
