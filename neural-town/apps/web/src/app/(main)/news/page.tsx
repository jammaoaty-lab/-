'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import CosmicLoading from '@/components/cosmic/CosmicLoading';
import type { NewsItem } from '@neural-town/shared';

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/v1/news');
        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <CosmicLoading text="扫描空间站信号..." />;

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📡</span>
        <h1 className="text-2xl font-display font-bold text-gradient">资讯空间站</h1>
        <span className="text-xs text-white/40 ml-auto">全球 AI 资讯广播</span>
      </div>

      {items.length === 0 ? (
        <p className="text-white/40 text-center py-20">暂无空间站广播信号</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CosmicCard padding="md" className="cursor-pointer">
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-ai-blue">{item.sourceName}</span>
                      <span className="text-xs text-white/30">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : ''}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white/90 line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-xs text-white/50 line-clamp-2">{item.summary}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CosmicCard>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}