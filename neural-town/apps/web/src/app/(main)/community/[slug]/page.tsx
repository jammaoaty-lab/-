'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import CosmicLoading from '@/components/cosmic/CosmicLoading';
import { particleBurst } from '@/stores/particle-store';
import type { Post } from '@neural-town/shared';

interface PostListResponse {
  items: Post[];
  total: number;
  cursor: string | null;
  hasMore: boolean;
}

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/posts?channel=${slug}&sort=latest&limit=20`);
        const data: PostListResponse = await res.json();
        setPosts(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [slug]);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    particleBurst(rect.left, rect.top, '#FF6B6B');
    try {
      await fetch(`/api/v1/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CosmicLoading text="调整频道信号..." />;

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-gradient mb-6 capitalize">
        #{slug} 频道
      </h1>
      {posts.length === 0 ? (
        <p className="text-white/40 text-center py-20">此频道暂无信号</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CosmicCard padding="md">
                {post.title && <h3 className="text-lg font-display font-semibold mb-2">{post.title}</h3>}
                <p className="text-sm text-white/70">{post.bodyPlain || post.body}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
                  <span>@{post.author?.username}</span>
                  <button onClick={(e) => handleLike(post.id, e)} className="hover:text-danger-red">
                    ♥ {post.likeCount || 0}
                  </button>
                  <span>💬 {post.commentCount || 0}</span>
                </div>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}