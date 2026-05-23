'use client';

import { useAppState } from '../../context/AppStateContext';

export default function ViewModeToggle() {
  const { viewMode, setViewMode, terminalMode, setTerminalMode } = useAppState();

  return (
    <div className="flex items-center gap-2 text-xs">
      <button onClick={() => setViewMode('compact')} className={`px-3 py-1 rounded-lg border ${viewMode === 'compact' ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-zinc-700 text-zinc-400'}`}>Compact</button>
      <button onClick={() => setViewMode('comfortable')} className={`px-3 py-1 rounded-lg border ${viewMode === 'comfortable' ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-zinc-700 text-zinc-400'}`}>Comfortable</button>
      <button onClick={() => setTerminalMode(!terminalMode)} className={`px-3 py-1 rounded-lg border ${terminalMode ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700 text-zinc-400'}`}>Terminal Mode</button>
    </div>
  );
}

