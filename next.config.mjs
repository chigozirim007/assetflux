/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Fully suppress all dev overlay badges ("1 issue", build activity, ISR status)
  devIndicators: {
    buildActivity: false,
    appIsrStatus:  false,
  },
};

export default nextConfig;

