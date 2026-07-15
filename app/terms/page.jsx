import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions · AssetFlux',
  description: 'Comprehensive Terms and Conditions for AssetFlux.',
};

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-zinc-500 font-mono text-sm">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-400">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">1. Agreement to Terms</h2>
            <p className="mb-3">
              By accessing, browsing, or using the AssetFlux platform ("Platform", "we", "us", or "our"), including our web application, mobile application, APIs, and associated services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all of these Terms, you are expressly prohibited from using the Platform and must discontinue use immediately.
            </p>
            <p>
              These Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and AssetFlux, concerning your access to and use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">2. Platform Services and Nature of Information</h2>
            <p className="mb-3">
              AssetFlux provides a financial data aggregation and social trading terminal that displays real-time and historical pricing for cryptocurrencies, equities, foreign exchange, and real estate assets. 
            </p>
            <p className="mb-3 text-red-400 font-medium">
              CRITICAL DISCLAIMER: AssetFlux is not a registered broker-dealer, investment advisor, or financial institution. The information, data, analysis, and opinions provided on the Platform are for informational and educational purposes only and do not constitute financial, investment, legal, or tax advice.
            </p>
            <p>
              You acknowledge that trading and investing in financial markets (particularly digital assets and cryptocurrencies) carries a high level of risk and may not be suitable for all investors. You are solely responsible for conducting your own due diligence before making any financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">3. User Accounts and Security</h2>
            <p className="mb-3">
              To access certain features of the Platform (such as customizing your dashboard, tracking experts, or posting insights), you may be required to register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Provide accurate, current, and complete information during the registration process.</li>
              <li>Maintain and promptly update your account information to keep it accurate and complete.</li>
              <li>Maintain the absolute security and confidentiality of your password and authentication credentials.</li>
              <li>Immediately notify us of any unauthorized use of your account or any other breach of security.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete, or if you violate any of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">4. Social Trading and Community Guidelines</h2>
            <p className="mb-3">
              The Platform includes social features allowing users to follow, interact with, and view the trading activity of other users ("Experts"). When utilizing social features, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>You will not use the Platform to disseminate false, misleading, or deceptive market information (including engaging in "pump and dump" schemes).</li>
              <li>You will not harass, abuse, or harm another person, or use the Platform for any illegal or unauthorized purpose.</li>
              <li>Any decision to mirror, copy, or rely on the trades of an Expert is done entirely at your own risk. Past performance of any Expert is not indicative of future results.</li>
            </ul>
            <p>
              AssetFlux does not endorse, vet, or guarantee the accuracy of any user-generated content, including the trading history or advice of users labeled as Experts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">5. Intellectual Property Rights</h2>
            <p className="mb-3">
              Unless otherwise indicated, the Platform is our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Platform (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
            <p>
              You may access the Platform for your personal, non-commercial use. No part of the Platform and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">6. Data Providers and Third-Party Links</h2>
            <p className="mb-3">
              AssetFlux aggregates data from third-party exchanges, APIs, and data providers (e.g., Yahoo Finance, crypto exchanges). We do not guarantee the timeliness, sequence, accuracy, or completeness of this market data. 
            </p>
            <p>
              The Platform may contain links to third-party websites or resources. You acknowledge and agree that we are not responsible or liable for the availability or accuracy of such websites, or the content, products, or services on or available from such websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">7. Disclaimer of Warranties</h2>
            <p className="mb-3 uppercase text-xs tracking-wider">
              THE PLATFORM IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE PLATFORM AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE PLATFORM AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="uppercase text-xs tracking-wider">
              WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE PLATFORM'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE PLATFORM AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE RESULTING FROM YOUR ACCESS TO AND USE OF THE PLATFORM, OR (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY FINANCIAL INFORMATION STORED THEREIN.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">8. Limitation of Liability</h2>
            <p className="mb-3">
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">9. Modifications and Interruptions</h2>
            <p className="mb-3">
              We reserve the right to change, modify, or remove the contents of the Platform at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Platform. We also reserve the right to modify or discontinue all or part of the Platform without notice at any time.
            </p>
            <p>
              We cannot guarantee the Platform will be available at all times. We may experience hardware, software, network, or other problems resulting in interruptions, delays, or errors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">10. Contact Us</h2>
            <p className="mb-3">
              In order to resolve a complaint regarding the Platform or to receive further information regarding use of the Platform, please contact us at:
            </p>
            <ul className="list-none space-y-1 text-white font-medium">
              <li>Email: assetflux.noreply@gmail.com</li>
              <li>Phone: 09128096498</li>
              <li>WhatsApp: +2349128096498</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
