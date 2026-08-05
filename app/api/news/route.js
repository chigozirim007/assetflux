import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

const CATEGORY_MAP = {
  crypto: 'cryptocurrency bitcoin ethereum',
  forex: 'forex currency market',
  stocks: 'stock market nasdaq sp500',
  shares: 'dividend stocks etf',
  'real-estate': 'real estate market reit',
  global: 'global economy finance'
};

async function fetchRss(query) {
  return new Promise((resolve, reject) => {
    // Single unified query to reduce round-trips
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Fetch timeout'));
    });
  });
}

function parseRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 20) {
    const content = match[1];
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const dateMatch = content.match(/<pubDate>(.*?)<\/pubDate>/);
    const linkMatch = content.match(/<link>(.*?)<\/link>/);

    if (titleMatch && dateMatch) {
      let fullTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      const parts = fullTitle.split(' - ');
      const source = parts.pop();
      const headline = parts.join(' - ') || fullTitle;

      // Determine category based on keywords in headline
      let category = 'global';
      const lowerHeadline = headline.toLowerCase();
      if (lowerHeadline.includes('crypto') || lowerHeadline.includes('bitcoin') || lowerHeadline.includes('eth')) category = 'crypto';
      else if (lowerHeadline.includes('forex') || lowerHeadline.includes('currency') || lowerHeadline.includes('dollar')) category = 'forex';
      else if (lowerHeadline.includes('estate') || lowerHeadline.includes('housing')) category = 'real-estate';
      else if (lowerHeadline.includes('stock') || lowerHeadline.includes('market') || lowerHeadline.includes('nasdaq')) category = 'stocks';

      items.push({
        id: Math.random().toString(36).substr(2, 9),
        headline,
        source: source || 'Market News',
        timestamp: new Date(dateMatch[1]).toISOString(),
        category,
        url: linkMatch ? linkMatch[1] : '#',
        content: `BREAKING [${category.toUpperCase()}]: ${headline}. This development is being closely monitored by professional traders. Institutional flow indicates heightened interest in ${category} assets following this report from ${source}. Analysts expect immediate volatility impact as the market digests these implications.`
      });
    }
  }
  return items;
}

/* ── In-memory cache: Google News RSS is only hit once every 60 seconds
      per unique category combination, regardless of user count ── */
const newsCache = new Map(); // key: sorted categories string, value: { data, timestamp }
const NEWS_CACHE_TTL_MS = 60000; // 60 seconds
const newsFetchInFlight = new Map(); // dedup concurrent requests

const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    headline: "Global Markets Steady Amid Policy Shifts",
    source: "AssetFlux Intel",
    timestamp: new Date().toISOString(),
    category: "global",
    content: "Terminal is resyncing live feeds. Markets are currently showing moderate volatility as investors await upcoming economic data points."
  },
  {
    id: 'fallback-2',
    headline: "Crypto Sentiment Remains Neutral in Quiet Session",
    source: "AssetFlux Intel",
    timestamp: new Date().toISOString(),
    category: "crypto",
    content: "On-chain data indicates steady accumulation despite a lack of major price catalysts in the last hour."
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const catsParam = searchParams.get('categories');
    const userCats = catsParam ? catsParam.split(',') : ['global'];
    const cacheKey = [...userCats].sort().join(',');

    // Serve from cache if fresh
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Dedup: if a fetch for this key is already in flight, wait for it
    if (!newsFetchInFlight.has(cacheKey)) {
      const fetchPromise = (async () => {
        const unifiedQuery = userCats
          .map(c => CATEGORY_MAP[c] || CATEGORY_MAP.global)
          .join(' OR ');

        const xml = await fetchRss(unifiedQuery);
        const news = parseRss(xml);

        if (news.length === 0) throw new Error('No items parsed');

        const filteredNews = news
          .filter(n => userCats.includes(n.category) || n.category === 'global')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        newsCache.set(cacheKey, { data: filteredNews, timestamp: Date.now() });
        newsFetchInFlight.delete(cacheKey);
        return filteredNews;
      })().catch(err => {
        newsFetchInFlight.delete(cacheKey);
        throw err;
      });

      newsFetchInFlight.set(cacheKey, fetchPromise);
    }

    const result = await newsFetchInFlight.get(cacheKey);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Live News Sync Error:', err);
    // Return stale cache if available
    const { searchParams } = new URL(request.url);
    const catsParam = searchParams.get('categories');
    const userCats = catsParam ? catsParam.split(',') : ['global'];
    const cacheKey = [...userCats].sort().join(',');
    const stale = newsCache.get(cacheKey);
    if (stale) return NextResponse.json(stale.data);

    return NextResponse.json(FALLBACK_NEWS);
  }
}
