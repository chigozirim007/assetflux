<div align="center">
  <br />
    <img src="./public/favicon.svg" alt="AssetFlux Logo" width="100" />
  <br />

  # AssetFlux
  **Financial Data Unlocked. At Your Fingertips.**

  <p align="center">
    A premium, high-performance financial market dashboard and social trading terminal.
  </p>
</div>

---

## 🌐 Overview

**AssetFlux** is a next-generation social trading terminal designed for modern investors. It breaks down the barriers between different asset classes, aggregating real-time data across cryptocurrency, US and global equities, forex, and real estate markets into a single, beautifully crafted interface.

Beyond just data, AssetFlux serves as a powerful **social trading platform**, allowing users to connect with verified experts, track proven trading records, and share market insights in a highly interactive environment.

## ✨ Key Features

- ⚡ **Millisecond Real-Time Data:** Powered by a robust WebSocket architecture and intelligent polling, delivering live price updates and market movements instantaneously.
- 📈 **Advanced Data Visualization:** Custom, fluid SVG-based sparkline charts and TradingView integrations provide an intuitive understanding of price history and market trends at a glance.
- 🌍 **Unified Multi-Asset Tracking:** Dedicated tracking and analytics for:
  - **Crypto:** Bitcoin, Ethereum, Solana, and more.
  - **Stocks:** Real-time data on major global equities (AAPL, TSLA, NVDA).
  - **Forex:** Major and minor currency pairs.
  - **Real Estate & Shares:** Deep insights into fractional shares and REITs.
- 🤝 **Social Trading Terminal:** Discover, follow, and connect with elite market experts to refine your trading strategies.
- 🔒 **Secure Authentication Flow:** Frictionless, secure onboarding via dedicated Sign Up and Sign In portals, with smart routing that drops authenticated users straight into their personalized dashboard.
- 🎨 **Premium Aesthetic:** Designed with a stunning, dark-mode-first aesthetic utilizing deep blacks (`#05060f`), glassmorphism, and neon violet/cyan accents to reduce eye strain and maximize readability.

## 🛠️ Technology Stack

AssetFlux is built with modern, cutting-edge web technologies to ensure optimal performance, SEO, and user experience:

- **Framework:** [Next.js (App Router)](https://nextjs.org/) paired with **React 19** for blazing-fast server-side rendering and optimal client-side interactivity.
- **Styling:** [Tailwind CSS (v4)](https://tailwindcss.com/) powers our highly responsive, utility-first UI design system.
- **State Management:** Custom React Contexts (`PriceContext`, `AppStateContext`) orchestrate complex live-data streams and user authentication states seamlessly.
- **Charts:** Lightweight, bespoke SVG chart implementations for maximum performance and TradingView integration for deep technical analysis.

## 💡 Architecture Highlights

- **Live Market Ticker:** A globally available, sticky top bar streaming live ticker data, ensuring you never miss a beat regardless of which page you are on.
- **Context-Aware Routing:** The application intelligently distinguishes between guests and authenticated users, ensuring secure routes are protected and logged-in users are routed straight to their customized dashboard upon visiting the landing page.
- **Modular Components:** The codebase relies on highly reusable, pure components (`MarketCard`, `SparklineChart`, `WsStatusBadge`) maintaining a clean, scalable structure.
