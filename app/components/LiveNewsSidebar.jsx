'use client';

import { useState, useEffect } from 'react';

export default function LiveNewsSidebar({ categories = [], onSelect }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const catQuery = categories.length ? `?categories=${categories.join(',')}` : '';
      const res = await fetch(`/api/news${catQuery}`);
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 60000);
    return () => clearInterval(id);
  }, [categories]);

  // Group news by category
  const groupedNews = categories.reduce((acc, cat) => {
    acc[cat] = news.filter(n => n.category === cat);
    return acc;
  }, {});

  // Add 'global' as a fallback if not in interests but returned by API
  if (!groupedNews.global && news.some(n => n.category === 'global')) {
    groupedNews.global = news.filter(n => n.category === 'global');
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0f1e] border-l border-violet-900/20 relative">
      <div className="p-4 border-b border-violet-900/10 flex items-center justify-between sticky top-0 bg-[#0d0f1e]/80 backdrop-blur-md z-10">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Market Intelligence</h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-zinc-500 font-bold tracking-tighter">LIVE FEED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && news.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">Syncing...</span>
          </div>
        ) : (
          <div className="pb-8">
            {Object.entries(groupedNews).map(([cat, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mt-2">
                  <div className="px-4 py-3 bg-white/[0.02] border-y border-white/[0.03] flex items-center gap-2">
                     <div className="w-1 h-3 bg-violet-500 rounded-full" />
                     <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cat} News</h3>
                  </div>
                  <div className="divide-y divide-white/[0.03]">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => onSelect && onSelect(item)}
                        className="p-4 hover:bg-white/[0.03] transition-all cursor-pointer group border-l-2 border-transparent hover:border-violet-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-violet-400/80 uppercase">
                            {item.source}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-medium">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-zinc-300 leading-relaxed group-hover:text-white transition-colors">
                          {item.headline}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-violet-600/5 border-t border-violet-900/10">
        <button className="w-full py-2 rounded-lg bg-violet-600/10 border border-violet-600/20 text-violet-400 text-[11px] font-bold hover:bg-violet-600 hover:text-white transition-all">
          Global Market Analytics
        </button>
      </div>
    </div>
  );
}

