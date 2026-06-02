'use client';
/**
 * @file 搜索结果页
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import CosmicLoading from '@/components/cosmic/CosmicLoading';
import type { Post, Project, UserProfile } from '@neural-town/shared';

interface SearchResult {
  posts: Post[];
  projects: Project[];
  users: UserProfile[];
  total: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [q]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-gradient mb-2">
        搜索结果
      </h1>
      <p className="text-sm text-white/50 mb-6">
        {q ? `搜索 "${q}" 的结果` : '请输入搜索关键词'}
      </p>

      {loading ? (
        <CosmicLoading text="搜索星域中..." />
      ) : results ? (
        <div className="space-y-8">
          {results.posts.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-semibold mb-3 text-white/80">帖子</h2>
              <div className="space-y-3">
                {results.posts.map((post) => (
                  <CosmicCard key={post.id} padding="md">
                    <h3 className="font-medium text-white">{post.title}</h3>
                    <p className="text-sm text-white/50 mt-1 line-clamp-2">{post.bodyPlain}</p>
                  </CosmicCard>
                ))}
              </div>
            </div>
          )}

          {results.users.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-semibold mb-3 text-white/80">用户</h2>
              <div className="space-y-3">
                {results.users.map((user) => (
                  <CosmicCard key={user.id} padding="md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-sm text-white/40">@{user.username}</p>
                      </div>
                    </div>
                  </CosmicCard>
                ))}
              </div>
            </div>
          )}

          {results.total === 0 && (
            <p className="text-white/40 text-center py-20">未找到相关结果</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<CosmicLoading text="搜索星域中..." />}>
      <SearchContent />
    </Suspense>
  );
}