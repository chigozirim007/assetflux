import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Terminal Dashboard - AssetFlux',
  description: 'Your personalized financial terminal overview.',
};

const SSR_HEADLINES = [
  'Global rates commentary pushes mixed risk sentiment.',
  'Property yield outlook diverges across regions.',
  'FX majors pricing in macro-event volatility.',
];

export default function DashboardPage() {
  return <DashboardClient initialHeadlines={SSR_HEADLINES} />;
}
