'use client';

import { useAppState } from '../../context/AppStateContext';

const LOCALES = ['en-US', 'en-GB', 'fr-FR'];
const TZS = ['Africa/Lagos', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

export default function LocalizationPanel() {
  const { locale, setLocale, timezone, setTimezone } = useAppState();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold">Localization</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={locale} onChange={(e) => setLocale(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs">
          {LOCALES.map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs">
          {TZS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <p className="text-[11px] text-zinc-500">Economic calendar renders in your local timezone.</p>
    </div>
  );
}

