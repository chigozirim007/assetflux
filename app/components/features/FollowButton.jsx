'use client';

import { useAppState } from '../../context/AppStateContext';

export default function FollowButton({ username }) {
  const { isFollowing, toggleFollow } = useAppState();
  const following = isFollowing(username);
  return (
    <button onClick={() => toggleFollow(username)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${following ? 'border-emerald-500 text-emerald-300 bg-emerald-900/20' : 'border-zinc-700 text-zinc-300 hover:border-violet-500'}`}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

