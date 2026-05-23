import { STOCKS, FOREX, SHARES, REAL_ESTATE } from '../../constants/instruments';
import https from 'https';

export const dynamic = 'force-dynamic';

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  Accept: 'application/json',
};

const ALL_TICKERS = [
  ...STOCKS.map(s => s.symbol),
  ...FOREX.map(f => f.symbol),
  ...SHARES.map(s => s.symbol),
  ...REAL_ESTATE.map(r => r.symbol),
];

function fetchIPv4(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { family: 4, headers: YAHOO_HEADERS }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

export async function GET() {
  try {
    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < ALL_TICKERS.length; i += CHUNK_SIZE) {
      chunks.push(ALL_TICKERS.slice(i, i + CHUNK_SIZE));
    }

    const payload = {};
    const now = Math.floor(Date.now() / 1000);

    for (const chunk of chunks) {
      const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${chunk.join(',')}`;
      try {
        const data = await fetchIPv4(url);
        
        Object.keys(data).forEach(symbol => {
          const item = data[symbol];
          if (!item || !item.close || !item.close.length) return;
          
          const price = item.close[item.close.length - 1];
          const prev  = item.previousClose;
          const change = prev ? ((price - prev) / prev) * 100 : 0;
          
          const lastTime = item.timestamp ? item.timestamp[item.timestamp.length - 1] : 0;
          const isRecent = (now - lastTime) < 1800; // 30 mins
          
          payload[symbol] = {
            price,
            change,
            marketState: isRecent ? 'REGULAR' : 'CLOSED',
          };
        });
      } catch (err) {
        console.error('Chunk fetch failed:', err);
      }
      
      // Short delay to avoid aggressive rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    return Response.json(payload);
  } catch (err) {
    console.error('[/api/prices] Error:', err);
    return Response.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}

