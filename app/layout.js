import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PriceProvider } from "./context/PriceContext";
import { AppStateProvider } from "./context/AppStateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AssetFlux â€” Financial Data Unlocked",
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PriceProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </PriceProvider>
      </body>
    </html>
  );
}

