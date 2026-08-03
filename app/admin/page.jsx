'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAppState } from '../context/AppStateContext';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const { authLoading, isAuthenticated, isAdmin, user, refreshProfile } = useAppState();

  const [profiles, setProfiles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Strict Route Guard: redirect non-admin users to /dashboard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // 2. Fetch all profiles and subscriptions live from Supabase
  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      // Query profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('id, username, email, first_name, last_name, role, created_at, verified, subscription_price')
        .order('created_at', { ascending: false });

      if (profileErr) {
        console.error('Failed to fetch profiles:', profileErr.message);
      } else {
        setProfiles(profileData || []);
      }

      // Query subscriptions for dynamic revenue & volume calculations
      const { data: subData, error: subErr } = await supabase
        .from('subscriptions')
        .select('id, subscriber_id, creator_id, amount, status, created_at')
        .order('created_at', { ascending: false });

      if (subErr) {
        console.error('Failed to fetch subscriptions:', subErr.message);
      } else {
        setSubscriptions(subData || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  // 3. Dynamic Calculation Functions for Volume & Revenue
  const totalSubsVolume = useMemo(() => {
    return subscriptions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [subscriptions]);

  const platformRevenue = useMemo(() => {
    return totalSubsVolume * 0.15; // 15% platform cut
  }, [totalSubsVolume]);

  const activeSubscriptionsCount = useMemo(() => {
    return subscriptions.filter(s => s.status === 'active').length;
  }, [subscriptions]);

  // Map profile usernames for subscription table formatting
  const profileMap = useMemo(() => {
    const map = new Map();
    profiles.forEach(p => {
      map.set(p.id, p.username || p.email || p.id.slice(0, 8));
    });
    return map;
  }, [profiles]);

  // 4. Handle Role Assignment (Promote to Admin / Revoke Admin)
  const handleRoleChange = async (targetUserId, targetUsername, newRole) => {
    setUpdatingId(targetUserId);
    setStatusMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);

      if (error) {
        setStatusMessage({ type: 'error', text: `Failed to update role: ${error.message}` });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Updated @${targetUsername || 'user'} role to "${newRole.toUpperCase()}".`,
        });

        // Update local list
        setProfiles(prev =>
          prev.map(p => (p.id === targetUserId ? { ...p, role: newRole } : p))
        );

        // If updated self, refresh app state
        if (targetUserId === user.id) {
          await refreshProfile();
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error performing role update.' });
    } finally {
      setUpdatingId(null);
    }
  };

  // 5. Filter profiles based on search input
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      p =>
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.first_name && p.first_name.toLowerCase().includes(q)) ||
        (p.last_name && p.last_name.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
    );
  }, [profiles, searchQuery]);

  // Metrics summary
  const totalUsers = profiles.length;
  const adminCount = profiles.filter(p => p.role === 'admin').length;

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#05060f] text-white flex items-center justify-center p-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060f] text-white flex flex-col">
      {/* Full Header Navigation */}
      <Header active="admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Owner Operations</h1>
              <span className="px-2.5 py-0.5 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-300 font-bold text-xs">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Live platform metrics, real-time subscription revenue calculations, and user role management.
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-200 hover:border-violet-500 transition"
          >
            Refresh Live Data
          </button>
        </div>

        {/* Dynamic Metrics Grid (Calculated from Live Site Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Registered Users</p>
            <p className="text-2xl font-black text-white">{totalUsers}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Admin Accounts</p>
            <p className="text-2xl font-black text-amber-400">{adminCount}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Subs Volume</p>
              <span className="text-[10px] text-zinc-400 font-mono">{activeSubscriptionsCount} active</span>
            </div>
            <p className="text-2xl font-black text-emerald-400">
              ${totalSubsVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Platform Revenue (15%)</p>
            <p className="text-2xl font-black text-violet-400">
              ${platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Subscription Transactions Breakdown Table */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Live Subscriptions & Revenue Audit</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculated live from active user subscriptions in Supabase.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {subscriptions.length} total entries
            </span>
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-zinc-500">Calculating revenue data...</div>
          ) : subscriptions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4">
              <p className="font-bold text-white mb-1">No Subscription Transactions Yet</p>
              <p className="text-zinc-500 max-w-md mx-auto">
                Live volume is calculated automatically as users subscribe to creators on the marketplace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Subscriber</th>
                    <th className="pb-3 px-3">Creator</th>
                    <th className="pb-3 px-3">Total Amount</th>
                    <th className="pb-3 px-3">Platform Fee (15%)</th>
                    <th className="pb-3 px-3">Creator Share (85%)</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {subscriptions.map(sub => {
                    const amt = parseFloat(sub.amount) || 0;
                    const fee = amt * 0.15;
                    const creatorShare = amt - fee;
                    const subName = profileMap.get(sub.subscriber_id) || sub.subscriber_id.slice(0, 8);
                    const creatorName = profileMap.get(sub.creator_id) || sub.creator_id.slice(0, 8);

                    return (
                      <tr key={sub.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-3 font-semibold text-white">@{subName}</td>
                        <td className="py-3 px-3 text-zinc-300">@{creatorName}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-bold">${amt.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-violet-400 font-bold">${fee.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-zinc-300">${creatorShare.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 uppercase">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-500">
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* User Role Management Panel */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">User Role Delegation</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Assign or revoke admin permissions for users. New signups receive standard user roles by default.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search username, email or ID..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* User Table */}
          {loadingData ? (
            <div className="py-12 text-center text-xs text-zinc-500">Loading user records...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No matching user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Joined</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredProfiles.map(p => {
                    const isSelf = p.id === user.id;
                    const isCurrentAdmin = p.role === 'admin';

                    return (
                      <tr key={p.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-300 font-bold uppercase">
                              {(p.username || p.email || 'U')[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                @{p.username || 'no_username'}
                                {isSelf && <span className="ml-1 text-[10px] text-violet-400">(You)</span>}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                                {p.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-zinc-300">
                          {p.email || 'N/A'}
                        </td>

                        <td className="py-3 px-3 text-zinc-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3 px-3">
                          {isCurrentAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 font-bold text-[10px]">
                              USER
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isCurrentAdmin ? (
                            <button
                              onClick={() => handleRoleChange(p.id, p.username, 'user')}
                              disabled={updatingId === p.id || isSelf}
                              title={isSelf ? "You cannot revoke your own admin status" : "Demote to standard user"}
                              className="px-3 py-1.5 rounded-lg border border-red-800/60 bg-red-950/20 text-red-300 hover:bg-red-950/50 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              {updatingId === p.id ? 'Updating...' : 'Revoke Admin'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(p.id, p.username, 'admin')}
                              disabled={updatingId === p.id}
                              className="px-3 py-1.5 rounded-lg border border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold disabled:opacity-40 transition"
                            >
                              {updatingId === p.id ? 'Updating...' : 'Make Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
