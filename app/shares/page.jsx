import CategoryPageLayout from '../components/CategoryPageLayout';
import LineChartCard      from '../components/LineChartCard';
import { SHARES }         from '../constants/instruments';

export const metadata = {
  title: 'Shares & ETFs - AssetFlux',
  description: 'Live price charts for 50 major ETFs, index funds and sector trackers.',
};

export default function SharesPage() {
  return (
    <CategoryPageLayout
      title="Shares & ETFs"
      subtitle="50 Index funds, sector ETFs and commodity trackers with high-performance live charts."
      category="shares"
      badge="2s Refresh"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SHARES.map(inst => (
          <LineChartCard key={inst.symbol} instrument={inst} />
        ))}
      </div>
    </CategoryPageLayout>
  );
}

