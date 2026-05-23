'use client';

import { useAppState } from '../../context/AppStateContext';

export default function FeedToggle() {
  const { feedMode, setFeedMode } = useAppState();
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-zinc-700">
      <button onClick={() => setFeedMode('global')} className={`px-3 py-1.5 text-xs ${feedMode === 'global' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Global Feed</button>
      <button onClick={() => setFeedMode('following')} className={`px-3 py-1.5 text-xs ${feedMode === 'following' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Following Feed</button>
    </div>
  );
}

