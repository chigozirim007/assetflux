# AssetFlux

AssetFlux is a premium, real-time financial market dashboard and social trading terminal. It aggregates live data across multiple asset classes including cryptocurrency, stocks, forex, and real estate, while providing a platform for users to connect with trading experts.

## Key Technical Stack
*   **Framework:** Next.js (App Router) with React 19.
*   **Styling:** Tailwind CSS (v4) with a dark, modern, glowing aesthetic (`#05060f` background, neon violet/cyan accents).
*   **Data Visualization:** Custom SVG-based sparkline charts (`SparklineChart`) and TradingView integrations for price history trends.
*   **Real-time Data:** A robust WebSocket and polling setup managed via a custom React Context (`PriceContext`) to fetch and broadcast live prices.

## Core Features & Architecture
1.  **Live Market Ticker:** A sticky bar at the top of the landing page streaming live prices and percentage changes for key assets like BTC/USDT, ETH/USDT, EUR/USD, AAPL, and TSLA.
2.  **Market Dashboard Cards:** The hero section features animated cards showing current prices, trend indicators (▲/▼), and live sparkline charts that update in real-time.
3.  **Comprehensive Navigation:** The app is structured to have dedicated sections for various asset types:
    *   `/crypto` (Cryptocurrency)
    *   `/stocks` (US Stocks)
    *   `/shares` (General Shares)
    *   `/forex` (Foreign Exchange)
    *   `/real-estate` (Real Estate markets)
4.  **Social/Expert Trading:** A dedicated `/experts` route, tying into their copy: *"Connect with verified experts with proven track records through our social trading terminal."*
5.  **Authentication Flow:** Dedicated `/signin` and `/signup` routes are scaffolded out for user onboarding.
6.  **Smart Routing:** Logged-in users are automatically redirected to their personalised dashboard when visiting the landing page.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
