import CategoryPageLayout from '../components/CategoryPageLayout';
import TradingChartCard   from '../components/TradingChartCard';
import { CRYPTO }         from '../constants/instruments';

export const metadata = {
  title: 'Crypto Markets - AssetFlux',
  description: 'Live millisecond candlestick charts for top 50 cryptocurrencies via Binance WebSocket.',
};

export default function CryptoPage() {
  return (
    <CategoryPageLayout
      title="Crypto Markets"
      subtitle="50 top pairs with millisecond live candlestick charts via Binance WebSocket."
      category="crypto"
      badge="WebSocket Live"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {CRYPTO.map(inst => (
          <TradingChartCard key={inst.symbol} instrument={inst} />
        ))}
      </div>
    </CategoryPageLayout>
  );
}

