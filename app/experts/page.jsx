import Link from 'next/link';
import CategoryPageLayout from '../components/CategoryPageLayout';

export const metadata = {
  title: 'Experts - AssetFlux',
  description: 'Connect with verified financial experts with proven track records on AssetFlux.',
};

const CATEGORIES = [
  { label: 'Crypto', href: '/crypto',       color: '#f59e0b' },
  { label: 'Forex',  href: '/forex',        color: '#34d399' },
  { label: 'Stocks', href: '/stocks',       color: '#818cf8' },
  { label: 'Shares', href: '/shares',       color: '#60a5fa' },
  { label: 'REIT',   href: '/real-estate',  color: '#fb923c' },
];

export default function ExpertsPage() {
  return (
    <CategoryPageLayout
      title="Expert Traders"
      subtitle="Connect with verified experts with proven and audited track records across all markets."
      category="experts"
      badge="Coming Soon"
    >
      {/* Coming soon card */}
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-violet-900/30 border border-violet-700/40 flex items-center justify-center mb-6">
          <svg className="w-9 h-9 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-700/50 bg-violet-900/20 text-violet-300 text-xs font-semibold tracking-widest uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Coming Soon
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Social Trading Terminal
        </h2>
        <p className="text-zinc-400 max-w-md text-sm sm:text-base leading-relaxed mb-8">
          Follow verified experts with audited portfolios, copy their trades, and track performance
          across Crypto, Forex, Stocks and Real Estate - all in one place.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {['Portfolio Tracking', 'Trade Copying', 'Verified Records', 'Multi-asset', 'Risk Scoring'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-zinc-800 text-zinc-500 bg-zinc-900/40">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-zinc-600 text-sm mb-6">Explore live markets while you wait:</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.href}
              href={cat.href}
              className="px-5 py-2 rounded-xl border border-zinc-800 text-sm font-semibold hover:border-violet-700/60 hover:bg-violet-900/15 transition-all duration-200"
              style={{ color: cat.color }}
            >
              {`${cat.label} ->`}
            </Link>
          ))}
        </div>
      </div>
    </CategoryPageLayout>
  );
}

