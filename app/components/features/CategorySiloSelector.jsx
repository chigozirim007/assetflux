'use client';

import { useAppState } from '../../context/AppStateContext';

const SILOS = [
  { id: 'crypto', label: 'Crypto' },
  { id: 'forex', label: 'Forex' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'shares', label: 'Shares' },
  { id: 'real-estate', label: 'Real Estate' },
];

export default function CategorySiloSelector() {
  const { selectedCategories, toggleCategory } = useAppState();

  return (
    <div className="flex flex-wrap gap-2">
      {SILOS.map(s => {
        const active = selectedCategories.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => toggleCategory(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition ${active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

