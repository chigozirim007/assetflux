import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PriceProvider } from "./context/PriceContext";
import { AppStateProvider } from "./context/AppStateContext";
import Script from "next/script";
import { CRYPTO } from "./constants/instruments";

const STREAM_KEY_MAP = {};
CRYPTO.forEach(c => {
  STREAM_KEY_MAP[c.symbol.toLowerCase()] = c.displaySymbol;
});

async function fetchInitialPrices() {
  try {
    const symbols = CRYPTO.map(c => `"${c.symbol}"`).join(',');
    const res = await fetch(
      `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=[${encodeURIComponent(symbols)}]`,
      { cache: 'no-store' }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const prices = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        const key = STREAM_KEY_MAP[item.symbol.toLowerCase()];
        if (key && item.lastPrice) {
          prices[key] = {
            price: parseFloat(item.lastPrice),
            change: parseFloat(item.priceChangePercent),
          };
        }
      });
    }
    return prices;
  } catch {
    return {};
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AssetFlux - Financial Data Unlocked",
  description:
    "Real-time insights across Stocks, Crypto, Shares and Forex. Connect with verified experts through our social trading terminal.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({ children }) {
  const initialPrices = await fetchInitialPrices();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PriceProvider initialPrices={initialPrices}>
          <AppStateProvider>{children}</AppStateProvider>
        </PriceProvider>

        {/* Tawk.to Live Chat Script */}
        <Script id="tawk-to" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a574ce55342201d45798304/1jtig8om1';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

