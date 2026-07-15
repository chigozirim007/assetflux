import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · AssetFlux',
  description: 'Privacy Policy for AssetFlux.',
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-zinc-500 font-mono text-sm">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-400">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">1. Introduction</h2>
            <p className="mb-3">
              AssetFlux ("we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application ("Platform").
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">2. Information We Collect</h2>
            <p className="mb-3">
              We may collect information about you in a variety of ways. The information we may collect on the Platform includes:
            </p>
            <h3 className="text-white font-semibold mt-4 mb-2">Personal Data</h3>
            <p className="mb-2">Personally identifiable information that you voluntarily give to us when you register with the Platform or when you choose to participate in various activities related to the Platform, such as:</p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Authentication data (handled securely via Supabase)</li>
              <li>Profile picture or avatar</li>
            </ul>

            <h3 className="text-white font-semibold mt-4 mb-2">Derivative Data</h3>
            <p className="mb-2">Information our servers automatically collect when you access the Platform, such as:</p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Your IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Access times and the pages you view directly before and after accessing the Platform</li>
            </ul>

            <h3 className="text-white font-semibold mt-4 mb-2">Trading and Social Data</h3>
            <p className="mb-2">If you utilize the social trading features of the platform, we collect and may publicly display:</p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Your public trading history and performance metrics</li>
              <li>Posts, comments, or insights you share in the community feeds</li>
              <li>Accounts you follow or users who follow you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">3. Use of Your Information</h2>
            <p className="mb-3">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Platform to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, newsletters, and other information regarding promotions and the Platform to you.</li>
              <li>Enable user-to-user communications and social trading features.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Platform.</li>
              <li>Notify you of updates to the Platform.</li>
              <li>Protect against unauthorized transactions, prevent fraud, and secure the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">4. Disclosure of Your Information</h2>
            <p className="mb-3">
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li><strong className="text-white">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
              <li><strong className="text-white">Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services (e.g., Vercel), customer service, and marketing assistance.</li>
              <li><strong className="text-white">Social Interactions:</strong> If you interact with other users of the Platform, those users may see your name, profile photo, and descriptions of your activity, including trading performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">5. Tracking Technologies</h2>
            <p className="mb-3">
              We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Platform to help customize the Platform and improve your experience. When you access the Platform, your personal information is not collected through the use of tracking technology.
            </p>
            <p>
              Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">6. Security of Your Information</h2>
            <p className="mb-3">
              We use administrative, technical, and physical security measures to help protect your personal information. Authentication and user data are secured using industry-standard encryption protocols (via our authentication provider, Supabase). While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">7. Policy for Children</h2>
            <p className="mb-3">
              We do not knowingly solicit information from or market to children under the age of 18. If you become aware of any data we have collected from children under age 18, please contact us using the contact information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">8. Contact Us</h2>
            <p className="mb-3">
              If you have questions or comments about this Privacy Policy, please contact us at:
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
