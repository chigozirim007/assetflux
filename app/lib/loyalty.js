export function getUserBadge(joinDate) {
  const created = new Date(joinDate);
  const now = new Date();
  const years = Math.max(0, (now - created) / (1000 * 60 * 60 * 24 * 365.25));

  if (years >= 5) {
    return {
      tier: 'elite',
      title: 'Elite / Legend',
      icon: '?',
      className: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]',
      perk: 'Moderate category threads',
    };
  }

  if (years >= 3) {
    return {
      tier: 'veteran',
      title: 'Veteran',
      icon: '?',
      className: 'text-amber-300 font-bold',
      perk: 'Priority in top contributors',
    };
  }

  if (years >= 1) {
    return {
      tier: 'strategist',
      title: 'Strategist',
      icon: '?',
      className: 'text-zinc-300',
      perk: 'Can vouch for posts',
    };
  }

  return {
    tier: 'novice',
    title: 'Novice / Scout',
    icon: '?',
    className: 'text-orange-300',
    perk: 'Standard posting rights',
  };
}

