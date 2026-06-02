'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import CosmicLoading from '@/components/cosmic/CosmicLoading';
import { particleBurst } from '@/stores/particle-store';
import type { Post, UserProfile } from '@neural-town/shared';

interface PostListResponse {
  items: Post[];
  total: number;
  cursor: string | null;
  hasMore: boolean;
}

export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [channel, setChannel] = useState('all');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/posts?channel=${channel}&sort=${sort}&limit=20`);
      const data: PostListResponse = await res.json();
      setPosts(data.items || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [channel, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    particleBurst(rect.left, rect.top, '#FF6B6B');

    try {
      await fetch(`/api/v1/posts/${postId}/like`, { method: 'POST' });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: p.likeCount + 1, isLiked: true } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      {/* 排序和频道选择 */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-gradient">社区星云</h1>
        <div className="flex gap-1 ml-auto">
          {(['latest', 'hot'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sort === s
                  ? 'bg-nebulae-purple/20 text-nebulae-purple'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {s === 'latest' ? '最新' : '热门'}
            </button>
          ))}
        </div>
      </div>

      {/* 帖子列表 */}
      {loading ? (
        <CosmicLoading text="正在接收星云信号..." />
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">这片星域还没有信号</p>
          <p className="text-white/20 text-sm mt-2">去工作台创造一些内容吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CosmicCard padding="md" className="cursor-pointer">
                {/* 作者信息 */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center text-xs font-medium">
                    {post.author?.displayName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.author?.displayName || '未知'}</p>
                    <p className="text-xs text-white/40">
                      @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {post.postType === 'creation' && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-warning-gold/20 text-warning-gold">
                      原创超新星
                    </span>
                  )}
                  {post.postType === 'news' && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-ai-blue/20 text-ai-blue">
                      空间站广播
                    </span>
                  )}
                </div>

                {/* 标题 */}
                {post.title && (
                  <h3 className="text-lg font-display font-semibold mb-2">{post.title}</h3>
                )}

                {/* 内容 */}
                <p className="text-sm text-white/70 line-clamp-3 mb-3">{post.bodyPlain || post.body}</p>

                {/* 媒体预览 */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {post.mediaUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                )}

                {/* 操作栏 */}
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <button
                    onClick={(e) => handleLike(post.id, e)}
                    className={`flex items-center gap-1 hover:text-danger-red transition-colors ${
                      post.isLiked ? 'text-danger-red' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likeCount || 0}
                  </button>

                  <button className="flex items-center gap-1 hover:text-ai-blue transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.commentCount || 0}
                  </button>

                  <button className="flex items-center gap-1 hover:text-success-green transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复刻
                  </button>
                </div>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}