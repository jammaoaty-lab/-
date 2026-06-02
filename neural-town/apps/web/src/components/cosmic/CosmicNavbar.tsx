'use client';
/**
 * @file CosmicNavbar - 顶部透明导航栏（毛玻璃效果）
 * 左侧logo、中间全局搜索、右侧通知铃铛和用户头像
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import NotificationBell from '@/components/cosmic/NotificationBell';
import clsx from 'clsx';

export default function CosmicNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // 关闭菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

 return (
    <nav className="cosmic-navbar h-16 px-4 flex items-center gap-4 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0 group">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-nebulae-purple rounded-full animate-pulse-slow opacity-50" />
          <div className="absolute inset-1 bg-space-deep rounded-full flex items-center justify-center">
            <span className="text-nebulae-purple text-sm font-bold">N</span>
          </div>
          {/* 环 */}
          <div className="absolute inset-[-2px] border border-nebulae-purple/30 rounded-full animate-spin-slow" />
        </div>
        <span className="text-lg font-display font-bold text-gradient hidden sm:block group-hover:scale-105 transition-transform">
          Neural Town
        </span>
      </Link>

      {/* 全局搜索 */}
      <div className="flex-1 max-w-lg mx-auto relative">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="搜索星域..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              setTimeout(() => setSearchOpen(false), 200);
            }}
            className={clsx(
              'w-full cosmic-input text-sm h-10',
              'pl-10 pr-4',
              'transition-all duration-300'
            )}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* 搜索全息面板 */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 right-0 glass-panel p-4 z-50"
            >
              <p className="text-sm text-white/50">输入关键词搜索帖子、项目或用户</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-3 shrink-0">
        {/* 通知铃铛 */}
        <NotificationBell />

        {/* 用户区域 */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center text-sm font-medium">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-panel p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-cosmic-border mb-1">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-white/50">@{user.username}</p>
                  </div>

                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                    onClick={() => { router.push('/profile'); setMenuOpen(false); }}
                  >
                    我的星图
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                    onClick={() => { router.push('/workbench'); setMenuOpen(false); }}
                  >
                    工作台
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-danger-red"
                    onClick={() => { logout(); setMenuOpen(false); }}
                  >
                    退出母舰
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm rounded-xl border border-cosmic-border hover:border-nebulae-purple transition-colors"
            >
              登入
            </Link>
            <Link
              href="/register"
              className="cosmic-btn px-4 py-2 text-sm"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}