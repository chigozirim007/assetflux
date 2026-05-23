'use client';

import { getUserBadge } from '../../lib/loyalty';

export default function LoyaltyBadge({ joinDate }) {
  const badge = getUserBadge(joinDate);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${badge.className}`} title={badge.perk}>
      <span>{badge.icon}</span>
      <span>{badge.title}</span>
    </span>
  );
}

