import CategoryPageLayout from '../components/CategoryPageLayout';
import TradingChartCard   from '../components/TradingChartCard';
import { FOREX }          from '../constants/instruments';

export const metadata = {
  title: 'Forex Markets - AssetFlux',
  description: 'Live candlestick charts for 50 major Forex currency pairs with real-time price updates.',
};

export default function ForexPage() {
  return (
    <CategoryPageLayout
      title="Forex Markets"
      subtitle="50 Major currency pairs with real-time candlestick charts."
      category="forex"
      badge="Live"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {FOREX.map(inst => (
          <TradingChartCard key={inst.symbol} instrument={inst} />
        ))}
      </div>
    </CategoryPageLayout>
  );
}

