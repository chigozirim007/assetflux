import CategoryPageLayout from '../components/CategoryPageLayout';
import LineChartCard      from '../components/LineChartCard';
import { REAL_ESTATE }    from '../constants/instruments';

export const metadata = {
  title: 'Real Estate â€” AssetFlux',
  description: 'Live price charts for 50 major REITs and real estate investment trusts.',
};

export default function RealEstatePage() {
  return (
    <CategoryPageLayout
      title="Real Estate"
      subtitle="Top 50 REITs and real estate investment trusts â€” residential, commercial, industrial & data centers."
      category="real-estate"
      badge="2s Refresh"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {REAL_ESTATE.map(inst => (
          <LineChartCard key={inst.symbol} instrument={inst} />
        ))}
      </div>
    </CategoryPageLayout>
  );
}

