'use client';
/**
 * @file MainLayout - 主布局：导航栏 + 星图导航 + 粒子背景 + 内容区
 * 用于社区、工作台等内页
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import CosmicNavbar from '@/components/cosmic/CosmicNavbar';
import StarNavigation from '@/components/cosmic/StarNavigation';
import { useAuthStore } from '@/stores/auth-store';

const ParticleBackground = dynamic(() => import('@/components/cosmic/ParticleBackground'), { ssr: false });

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { refreshFromToken, isAuthenticated } = useAuthStore();

  // 初始化时刷新认证状态
  useEffect(() => {
    refreshFromToken();
  }, [refreshFromToken]);

  // 不在某些页面显示侧边栏
  const hideSidebar = pathname === '/login' || pathname === '/register' || pathname === '/profile';

  return (
    <div className="min-h-screen bg-space-deep">
      <ParticleBackground />
      <CosmicNavbar />

      {/* 侧边栏（仅登录后显示） */}
      {isAuthenticated && !hideSidebar && <StarNavigation />}

      {/* 主内容区 */}
      <motion.main
        className={isAuthenticated && !hideSidebar ? 'ml-64' : ''}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pt-16 min-h-screen">
          {children}
        </div>
      </motion.main>
    </div>
  );
}