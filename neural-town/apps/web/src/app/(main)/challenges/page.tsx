'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useAuthStore } from '@/stores/auth-store';
import toast from 'react-hot-toast';

/* ─── 类型定义 ─── */

interface PastChallenge {
  id: string;
  title: string;
  participants: number;
  winnerName: string;
  winnerWork: string;
  gradient: string;
}

interface UpcomingChallenge {
  id: string;
  title: string;
  icon: string;
  description: string;
  daysUntilStart: number;
  interested: number;
  gradient: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

/* ─── 静态数据 ─── */

const upcomingChallenges: UpcomingChallenge[] = [
  {
    id: 'nature',
    title: '自然之声',
    icon: '🌿',
    description: '设计一个与自然和谐共生的产品',
    daysUntilStart: 3,
    interested: 67,
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'digital-life',
    title: '数字生灵',
    icon: '🤖',
    description: '创作一个AI驱动的虚拟角色',
    daysUntilStart: 7,
    interested: 94,
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    id: 'star-traveler',
    title: '星际旅人',
    icon: '🌌',
    description: '设计太空旅行体验',
    daysUntilStart: 14,
    interested: 51,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
];

const pastChallenges: PastChallenge[] = [
  {
    id: 'color-revolution',
    title: '色彩革命',
    participants: 156,
    winnerName: '星云设计师',
    winnerWork: '霓虹森林UI',
    gradient: 'from-orange-500/30 via-pink-500/30 to-red-500/30',
  },
  {
    id: 'minimalism',
    title: '极简主义',
    participants: 203,
    winnerName: '前端宇航员',
    winnerWork: '纯白代码',
    gradient: 'from-gray-400/20 via-white/10 to-gray-500/20',
  },
  {
    id: 'ai-awakening',
    title: 'AI觉醒',
    participants: 189,
    winnerName: 'AI导演',
    winnerWork: '机器之梦',
    gradient: 'from-nebulae-purple/30 via-ai-blue/20 to-cyan-500/30',
  },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: '星云设计师', points: 9820, isCurrentUser: false },
  { rank: 2, name: '前端宇航员', points: 8750, isCurrentUser: false },
  { rank: 3, name: 'AI导演', points: 8120, isCurrentUser: false },
  { rank: 4, name: '赛博诗人', points: 7650, isCurrentUser: false },
  { rank: 5, name: '数据航海家', points: 6980, isCurrentUser: false },
  { rank: 6, name: '像素魔法师', points: 6210, isCurrentUser: false },
  { rank: 7, name: '量子工程师', points: 5840, isCurrentUser: true },
  { rank: 8, name: '创世架构师', points: 5010, isCurrentUser: false },
  { rank: 9, name: '维度旅行者', points: 4560, isCurrentUser: false },
  { rank: 10, name: '光影编织者', points: 3980, isCurrentUser: false },
];

function getRankGlow(rank: number): string {
  if (rank === 1) return 'bg-gradient-to-r from-warning-gold/20 to-transparent border-l-2 border-warning-gold';
  if (rank === 2) return 'bg-gradient-to-r from-gray-300/10 to-transparent border-l-2 border-gray-300';
  if (rank === 3) return 'bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-amber-600';
  return '';
}

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/* ─── 组件入口 ─── */

export default function ChallengesPage() {
  const { user } = useAuthStore();

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-12">
      {/* ═══════════════════════════════════════════
          1. Hero
          ═══════════════════════════════════════════ */}
      <section className="text-center pt-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold text-gradient mb-3"
        >
          情感挑战赛
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-white/50"
        >
          释放创意，点亮星河
        </motion.p>
      </section>

      {/* ═══════════════════════════════════════════
          2. Current Challenge
          ═══════════════════════════════════════════ */}
      <section>
        <CosmicCard padding="none" glow className="overflow-hidden">
          <div className="relative">
            {/* 顶部渐变背景 */}
            <div className="h-3 bg-gradient-to-r from-nebulae-purple via-ai-blue to-nebulae-purple" />

            <div className="p-6 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                {/* 左侧信息 */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-nebulae-purple/20 text-nebulae-purple text-xs font-medium">
                      当前挑战
                    </span>
                    <span className="px-3 py-1 rounded-full bg-ai-blue/20 text-ai-blue text-xs font-medium">
                      赛博朋克
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-display font-bold">
                    未来城市 2049
                  </h2>

                  <p className="text-white/60 leading-relaxed">
                    设计你心中的未来城市，可以是UI界面、建筑概念、服装设计或任何形式的创作
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-warning-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/70">
                        剩余 <strong className="text-warning-gold font-mono">3 天 12 小时</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-ai-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-white/70">
                        <strong className="text-ai-blue">128</strong> 人已参赛
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span>🏅</span>
                    <span>奖励：<strong className="text-warning-gold">星云创作者勋章 + 1000 星尘</strong></span>
                  </div>
                </div>

                {/* 右侧 CTA */}
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-nebulae-purple/30 to-ai-blue/20 border border-nebulae-purple/30 flex items-center justify-center">
                    <span className="text-5xl">🏙️</span>
                  </div>
                  <CosmicButton
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        toast.error('请先登录后再参赛');
                        return;
                      }
                      toast.success('已报名参赛！前往工作台开始创作吧 🚀');
                    }}
                    className="w-full whitespace-nowrap"
                  >
                    立即参赛
                  </CosmicButton>
                </div>
              </div>
            </div>
          </div>
        </CosmicCard>
      </section>

      {/* ═══════════════════════════════════════════
          3. Upcoming Challenges
          ═══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📅</span>
          <h2 className="text-2xl font-display font-bold text-gradient">即将到来</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingChallenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CosmicCard padding="md" className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{challenge.icon}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
                    {challenge.daysUntilStart}天后开始
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{challenge.title}</h3>
                <p className="text-sm text-white/50 mb-4 flex-1">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">
                    {challenge.interested} 人感兴趣
                  </span>
                  <CosmicButton
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success(`已预约「${challenge.title}」，开始时会通知你 ✨`)}
                  >
                    预约提醒
                  </CosmicButton>
                </div>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. Past Challenges
          ═══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📜</span>
          <h2 className="text-2xl font-display font-bold text-gradient">往期挑战</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastChallenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CosmicCard padding="none" className="overflow-hidden h-full flex flex-col">
                {/* 缩略图渐变 */}
                <div
                  className={`h-24 bg-gradient-to-br ${challenge.gradient} flex items-center justify-center`}
                >
                  <span className="text-2xl opacity-60">
                    {challenge.id === 'color-revolution' ? '🎨' : challenge.id === 'minimalism' ? '⬜' : '🧠'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-display font-semibold mb-1">{challenge.title}</h3>
                  <p className="text-xs text-white/40 mb-3">{challenge.participants}人参与</p>

                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5">
                    <span className="text-sm">🏅</span>
                    <div>
                      <p className="text-xs text-white/50">冠军</p>
                      <p className="text-sm font-medium text-warning-gold">{challenge.winnerName}</p>
                      <p className="text-xs text-white/40">作品：{challenge.winnerWork}</p>
                    </div>
                  </div>

                  <CosmicButton
                    variant="secondary"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => toast.success(`正在跳转到「${challenge.title}」作品展...`)}
                  >
                    查看作品
                  </CosmicButton>
                </div>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. 排行榜
          ═══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🏅</span>
          <h2 className="text-2xl font-display font-bold text-gradient">月度排行榜</h2>
          <span className="text-xs text-white/30 ml-auto">本月 · 创作积分</span>
        </div>

        <CosmicCard padding="none" className="overflow-hidden">
          {/* 表头 */}
          <div className="flex items-center px-5 py-3 border-b border-cosmic-border text-xs text-white/40 font-mono">
            <span className="w-12">排名</span>
            <span className="flex-1">创作者</span>
            <span>积分</span>
          </div>

          {/* 排行列表 */}
          <div className="divide-y divide-cosmic-border/50">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center px-5 py-3 transition-colors hover:bg-white/[0.02] ${
                  getRankGlow(entry.rank)
                } ${entry.isCurrentUser ? 'bg-nebulae-purple/10 border-l-2 border-nebulae-purple' : ''}`}
              >
                <span
                  className={`w-12 font-mono text-sm ${
                    entry.rank <= 3 ? 'text-lg' : 'text-white/50'
                  }`}
                >
                  {getRankBadge(entry.rank)}
                </span>

                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      entry.isCurrentUser
                        ? 'bg-nebulae-purple/30 ring-2 ring-nebulae-purple/50'
                        : 'bg-white/10'
                    }`}
                  >
                    {entry.name[0]}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      entry.isCurrentUser ? 'text-nebulae-purple' : ''
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-[10px] text-nebulae-purple/70">(你)</span>
                    )}
                  </span>
                </div>

                <span className={`font-mono text-sm ${entry.rank <= 3 ? 'text-warning-gold font-semibold' : 'text-white/50'}`}>
                  {entry.points.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </CosmicCard>
      </section>

      {/* ═══════════════════════════════════════════
          6. How it works
          ═══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🚀</span>
          <h2 className="text-2xl font-display font-bold text-gradient">如何参与</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: '接受挑战', desc: '选择你感兴趣的挑战主题', icon: '🎯' },
            { step: '2', title: '创作作品', desc: '在工作台完成你的创作', icon: '🎨' },
            { step: '3', title: '赢取奖励', desc: '社区投票选出最佳作品', icon: '🏆' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <CosmicCard padding="md" className="text-center h-full">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="w-8 h-8 rounded-full bg-nebulae-purple/20 flex items-center justify-center mx-auto mb-3 text-sm font-bold text-nebulae-purple">
                  {item.step}
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 底部留白 */}
      <div className="h-8" />
    </div>
  );
}