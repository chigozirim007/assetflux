export const dynamic = 'force-dynamic';

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

async function getBinanceCandles(symbol, interval) {
  const LIMIT = { '1m': 500, '5m': 500, '15m': 400, '1h': 300, '4h': 200, '1d': 365 };
  const limit = LIMIT[interval] ?? 300;
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
  const res  = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (!Array.isArray(data)) throw new Error('Binance error for ' + symbol);

  const candles = data.map(k => ({
    time:  Math.floor(k[0] / 1000),
    open:  parseFloat(k[1]),
    high:  parseFloat(k[2]),
    low:   parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));

  const volumes = data.map(k => ({
    time:  Math.floor(k[0] / 1000),
    value: parseFloat(k[5]),
    color: parseFloat(k[4]) >= parseFloat(k[1]) ? '#10b98122' : '#ef444422',
  }));

  return { candles, volumes };
}

async function getYahooCandles(symbol, interval, range) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
  const res  = await fetch(url, { headers: YAHOO_HEADERS, cache: 'no-store' });
  const data = await res.json();
  const result = data?.chart?.result?.[0];

  if (!result?.timestamp) throw new Error('No Yahoo data for ' + symbol);

  const ts    = result.timestamp;
  const quote = result.indicators.quote[0];

  const candles = ts
    .map((t, i) => ({
      time:  t,
      open:  quote.open[i],
      high:  quote.high[i],
      low:   quote.low[i],
      close: quote.close[i],
    }))
    .filter(c => c.open != null && c.close != null && c.high != null && c.low != null);

  const volumes = ts
    .map((t, i) => ({
      time:  t,
      value: quote.volume?.[i] ?? 0,
      color: (quote.close[i] ?? 0) >= (quote.open[i] ?? 0) ? '#10b98122' : '#ef444422',
    }))
    .filter((_, i) => quote.open[i] != null);

  return { candles, volumes };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol   = searchParams.get('symbol');
  const type     = searchParams.get('type')     || 'stock';
  const interval = searchParams.get('interval') || '1m';
  const range    = searchParams.get('range')    || '1d';

  if (!symbol) return Response.json({ error: 'Missing symbol' }, { status: 400 });

  try {
    const data = type === 'crypto'
      ? await getBinanceCandles(symbol, interval)
      : await getYahooCandles(symbol, interval, range);
    return Response.json(data);
  } catch (err) {
    console.error('[/api/candles]', symbol, err.message);
    return Response.json({ error: err.message, candles: [], volumes: [] }, { status: 500 });
  }
}

