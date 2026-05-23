'use client';

import { useAppState } from '../../context/AppStateContext';

const OPTIONS = [
  ['priceAlerts', 'Price Alerts'],
  ['eventAlerts', 'Event Alerts'],
  ['socialAlerts', 'Social Alerts'],
  ['webPush', 'Web Push'],
];

export default function NotificationSettingsPanel() {
  const { notifications, updateNotification } = useAppState();
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <h3 className="text-sm font-bold text-white">Smart Notification Engine</h3>
      {OPTIONS.map(([key, label]) => (
        <label key={key} className="flex items-center justify-between text-sm text-zinc-300">
          <span>{label}</span>
          <input type="checkbox" checked={!!notifications[key]} onChange={(e) => updateNotification(key, e.target.checked)} />
        </label>
      ))}
      <p className="text-[11px] text-zinc-500">Web + in-app + event alerts synced to profile preferences.</p>
    </div>
  );
}

