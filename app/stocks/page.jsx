import CategoryPageLayout from '../components/CategoryPageLayout';
import LineChartCard      from '../components/LineChartCard';
import { STOCKS }         from '../constants/instruments';

export const metadata = {
  title: 'Global Stocks â€” AssetFlux',
  description: 'Live price charts for top 50 global companies with high-performance tracking.',
};

export default function StocksPage() {
  return (
    <CategoryPageLayout
      title="Global Stocks"
      subtitle="Top 50 global companies â€” US Tech, Finance, Retail & more with live charts."
      category="stocks"
      badge="2s Refresh"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {STOCKS.map(inst => (
          <LineChartCard key={inst.symbol} instrument={inst} />
        ))}
      </div>
    </CategoryPageLayout>
  );
}

