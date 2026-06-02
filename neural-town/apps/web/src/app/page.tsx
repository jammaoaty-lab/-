'use client';
/**
 * @file 首页 - 超空间入口 + 快速跳转
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';

const HyperspaceEntrance = dynamic(() => import('@/components/cosmic/HyperspaceEntrance'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/cosmic/ParticleBackground'), { ssr: false });

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [showEntrance, setShowEntrance] = useState(false);

  useEffect(() => {
    const visited = !localStorage.getItem('nt-visited');
    setShowEntrance(visited);
  }, []);

  return (
    <div className="min-h-screen bg-space-deep">
      <ParticleBackground />

      {showEntrance && <HyperspaceEntrance />}

      {/* 主内容 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showEntrance ? 0 : 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center max-w-2xl"
        >
          {/* Logo */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-nebulae-purple rounded-full animate-pulse-slow opacity-30" />
            <div className="absolute inset-0 border-4 border-nebulae-purple/50 rounded-full animate-spin-slow" />
            <div className="absolute inset-3 bg-space-deep rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-gradient">N</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient mb-4">
            Neural Town
          </h1>
          <p className="text-xl md:text-2xl text-white/60 mb-2 font-display">
            无限星河
          </p>
          <p className="text-sm md:text-base text-white/40 mb-10 max-w-md mx-auto">
            AI 原生宇宙社区 · 每位创造者都有一艘星舰
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/community">
                  <CosmicButton size="lg">进入社区星云</CosmicButton>
                </Link>
                <Link href="/workbench">
                  <CosmicButton variant="secondary" size="lg">我的工作台</CosmicButton>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <CosmicButton size="lg">登上母舰</CosmicButton>
                </Link>
                <Link href="/login">
                  <CosmicButton variant="secondary" size="lg">登入舰桥</CosmicButton>
                </Link>
              </>
            )}
          </div>

          {/* 角色预览 */}
          <div className="mt-16 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { icon: '🎨', label: '设计师' },
              { icon: '💻', label: '开发者' },
              { icon: '📊', label: '产品经理' },
              { icon: '🌱', label: '初学者' },
              { icon: '🚀', label: 'AI 爱好者' },
            ].map(({ icon, label }) => (
              <CosmicCard key={label} padding="sm" hoverable className="text-center">
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-xs text-white/50">{label}</span>
              </CosmicCard>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}