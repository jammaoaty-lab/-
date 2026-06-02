'use client';
/**
 * @file StarNavigation - 左侧星图导航（星座连线形式展示频道和工作台）
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { DEFAULT_CHANNELS, ROLES_META } from '@neural-town/shared';
import { useAuthStore } from '@/stores/auth-store';

export default function StarNavigation() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { user } = useAuthStore();

  // 根据用户角色过滤工作台
  const userWorkbenches = user?.roleTags
    ?.filter((r) => r !== 'normal')
    ?.map((r) => ROLES_META[r])
    .filter(Boolean) || [];

  const channelGroups = groupChannels(DEFAULT_CHANNELS);

  return (
    <>
      {/* 切换按钮 */}
      <button
        className="fixed left-4 top-20 z-50 p-2 rounded-lg bg-space-card border border-cosmic-border hover:border-nebulae-purple transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className={clsx('w-5 h-5 text-white/70 transition-transform', isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="star-navigation w-64 overflow-y-auto"
          >
            <div className="p-4 space-y-6">
              {/* 工作台入口（按角色） */}
              {userWorkbenches.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-nebulae-purple uppercase tracking-wider mb-3 px-1">
                    ⬡ 我的舰桥
                  </h3>
                  <nav className="space-y-1">
                    {userWorkbenches.map((meta) => {
                      const isActive = pathname.includes(`/workbench/${meta.key}`);
                      return (
                        <Link
                          key={meta.key}
                          href={`/workbench/${meta.key}`}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                            isActive
                              ? 'bg-nebulae-purple/20 border border-nebulae-purple/30 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <span className="text-lg">{meta.icon}</span>
                          <span className="font-medium truncate">{meta.workbenchName}</span>
                          {isActive && (
                            <motion.div
                              layoutId="active-star"
                              className="ml-auto w-1.5 h-1.5 bg-ai-blue rounded-full"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* 频道星图 */}
              {Object.entries(channelGroups).map(([group, channels]) => (
                <div key={group}>
                  <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3 px-1">
                    {groupIcons[group] || '·'} {groupNames[group] || group}
                  </h3>
                  <nav className="space-y-0.5">
                    {channels.map((ch) => {
                      const href = ch.slug === 'all' ? '/community' : `/community/${ch.slug}`;
                      const isActive = ch.slug === 'all'
                        ? pathname === '/community'
                        : pathname.includes(`/community/${ch.slug}`);
                      return (
                        <Link
                          key={ch.slug}
                          href={href}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
                            isActive
                              ? 'bg-white/10 text-white font-medium'
                              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                          )}
                        >
                          <span className="text-base">{ch.icon}</span>
                          <span className="truncate">{ch.name}</span>
                          {/* 活跃度指示 */}
                          <span className={clsx(
                            'ml-auto w-1.5 h-1.5 rounded-full',
                            isActive ? 'bg-ai-blue' : 'bg-white/20'
                          )} />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* 底部信息 */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="cosmic-card p-3 text-center">
                <p className="text-xs text-white/30 font-mono">Neural Town v0.1</p>
                <p className="text-[10px] text-white/20 mt-0.5">无限星河 · 创造者的母舰</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

const groupIcons: Record<string, string> = {
  discover: '🌐',
  designer: '🎨',
  developer: '💻',
  pm: '📊',
  beginner: '🌱',
  fun: '🚀',
  news: '📡',
};

const groupNames: Record<string, string> = {
  discover: '发现',
  designer: '设计师星系',
  developer: '开发者星舰',
  pm: 'PM引力舱',
  beginner: '新手村',
  fun: '奇点区',
  news: '资讯空间站',
};

function groupChannels(channels: typeof DEFAULT_CHANNELS) {
  const groups: Record<string, typeof DEFAULT_CHANNELS> = {};
  for (const ch of channels) {
    const key = ch.groupName || 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(ch);
  }
  return groups;
}