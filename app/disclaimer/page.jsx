import Link from 'next/link';

export const metadata = {
  title: 'Financial Disclaimer · AssetFlux',
  description: 'Financial and Investment Disclaimer for AssetFlux.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#05060f] text-zinc-300 py-16 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-sm text-violet-400 hover:text-violet-300 transition-colors mb-8 font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Financial Disclaimer</h1>
          <p className="text-zinc-500 font-mono text-sm">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-400">
          
          <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-red-400 mb-2">Important Notice</h2>
            <p className="text-red-200/80">
              The information provided on AssetFlux is for informational, educational, and entertainment purposes only. It does not constitute financial advice, investment advice, trading advice, or any other sort of advice, and you should not treat any of the Platform's content as such.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">1. No Investment Advice</h2>
            <p className="mb-3">
              AssetFlux does not recommend that any cryptocurrency, equity, forex pair, or other financial asset should be bought, sold, or held by you. Nothing on this website should be taken as an offer to buy, sell or hold any financial instrument.
            </p>
            <p>
              Before making any investment decisions, you should conduct your own due diligence and consult your financial advisor. AssetFlux will not be held responsible for any investment decisions you make based on the information provided on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">2. Accuracy of Information</h2>
            <p className="mb-3">
              AssetFlux strives to ensure the accuracy of the information listed on this website, although it will not hold any responsibility for any missing or wrong information. The pricing data, charts, and market information are aggregated from third-party APIs and data providers. We cannot guarantee that this data is real-time, accurate, or complete.
            </p>
            <p>
              You understand that you are using any and all information available here at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">3. Trading Risks</h2>
            <p className="mb-3">
              Trading in financial markets, especially cryptocurrencies, involves a high degree of risk and can result in the loss of your entire capital. The high volatility and unpredictability of these markets mean that prices can fluctuate significantly in a very short period of time.
            </p>
            <p>
              Never trade with money that you cannot afford to lose. You should carefully consider whether trading is suitable for you in light of your financial condition.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">4. Social Trading and "Experts"</h2>
            <p className="mb-3">
              AssetFlux provides social trading features where you can view the portfolios and trades of other users (sometimes referred to as "Experts" or "Top Traders"). 
            </p>
            <p className="font-semibold text-zinc-300 mb-3">
              Copying or mimicking the trades of other users is inherently risky.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Past performance of any user or Expert is not a reliable indicator of future results.</li>
              <li>You must consider your own financial goals and risk tolerance before following any user's strategy.</li>
              <li>AssetFlux does not vet, endorse, or guarantee the success of any user on the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">5. Contact</h2>
            <p className="mb-3">
              For any questions regarding this disclaimer, please contact us at:
            </p>
            <ul className="list-none space-y-1 text-white font-medium">
              <li>Email: assetflux.noreply@gmail.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
