'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────

interface ExperimentType {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  usageCount: number;
}

interface CommunityExperiment {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
  likes: number;
  gradientFrom: string;
  gradientTo: string;
}

interface InspirationPrompt {
  id: string;
  prompt: string;
  category: string;
  categoryColor: string;
}

interface TopCreator {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  experimentCount: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const EXPERIMENT_TYPES: ExperimentType[] = [
  {
    id: 'text-to-image',
    icon: '🖼️',
    title: '文生图实验室',
    description: '将你的想象力转化为视觉艺术作品，支持多种风格与画布尺寸',
    color: '#FF6B6B',
    usageCount: 12840,
  },
  {
    id: 'music-gen',
    icon: '🎵',
    title: '音乐生成器',
    description: 'AI 驱动的音乐创作体验，从旋律到完整编曲一气呵成',
    color: '#6C5CE7',
    usageCount: 9620,
  },
  {
    id: 'code-playground',
    icon: '💻',
    title: '代码游乐场',
    description: '在交互式环境中用 AI 辅助编写、调试和运行代码',
    color: '#00E5FF',
    usageCount: 7530,
  },
];

const COMMUNITY_EXPERIMENTS: CommunityExperiment[] = [
  {
    id: 'ce-1',
    thumbnail: '',
    title: '星云风格城市天际线',
    author: '星尘旅人',
    likes: 2341,
    gradientFrom: '#FF6B6B',
    gradientTo: '#FFD166',
  },
  {
    id: 'ce-2',
    thumbnail: '',
    title: '赛博合成器音景',
    author: '电路诗人',
    likes: 1892,
    gradientFrom: '#6C5CE7',
    gradientTo: '#00E5FF',
  },
  {
    id: 'ce-3',
    thumbnail: '',
    title: '递归宇宙可视化',
    author: '算法游民',
    likes: 3156,
    gradientFrom: '#00F2A9',
    gradientTo: '#6C5CE7',
  },
  {
    id: 'ce-4',
    thumbnail: '',
    title: '水墨风山水动画',
    author: '墨染星河',
    likes: 1723,
    gradientFrom: '#E040FB',
    gradientTo: '#FF6B6B',
  },
  {
    id: 'ce-5',
    thumbnail: '',
    title: '粒子波动模拟器',
    author: '量子画师',
    likes: 2890,
    gradientFrom: '#00E5FF',
    gradientTo: '#E040FB',
  },
  {
    id: 'ce-6',
    thumbnail: '',
    title: 'AI 剧情互动小说',
    author: '故事引擎',
    likes: 4102,
    gradientFrom: '#FFD166',
    gradientTo: '#FF6B6B',
  },
];

const INSPIRATION_PROMPTS: InspirationPrompt[] = [
  {
    id: 'ip-1',
    prompt: '赛博朋克风格的猫咪咖啡馆',
    category: '图像生成',
    categoryColor: '#FF6B6B',
  },
  {
    id: 'ip-2',
    prompt: '浮在星云上的玻璃城市',
    category: '概念艺术',
    categoryColor: '#6C5CE7',
  },
  {
    id: 'ip-3',
    prompt: '用代码画一幅宇宙风景画',
    category: '创意编程',
    categoryColor: '#00E5FF',
  },
];

const TOP_CREATORS: TopCreator[] = [
  { id: 'tc-1', rank: 1, name: '星尘旅人', avatar: '🧑‍🚀', experimentCount: 347 },
  { id: 'tc-2', rank: 2, name: '量子画师', avatar: '🧑‍🎨', experimentCount: 289 },
  { id: 'tc-3', rank: 3, name: '电路诗人', avatar: '🧑‍💻', experimentCount: 256 },
  { id: 'tc-4', rank: 4, name: '墨染星河', avatar: '👩‍🎨', experimentCount: 198 },
  { id: 'tc-5', rank: 5, name: '算法游民', avatar: '🧑‍🔬', experimentCount: 175 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [, setActiveExperiment] = useState<string | null>(null);

  const handleEnterExperiment = (type: ExperimentType) => {
    setActiveExperiment(type.id);
    toast.success(`正在进入「${type.title}」...`);
  };

  const handleFork = (exp: CommunityExperiment) => {
    toast.success(`已复刻「${exp.title}」到你的实验空间`);
  };

  const handleUseInspiration = (prompt: InspirationPrompt) => {
    toast.success('灵感已加载，开始创作吧！');
  };

  const handleAcceptChallenge = () => {
    toast.success('挑战已接受！祝你创作愉快 🚀');
  };

  const getRankGlow = (rank: number): string => {
    if (rank === 1) return 'shadow-[0_0_15px_rgba(255,215,0,0.5)] border-yellow-400/40';
    if (rank === 2) return 'shadow-[0_0_10px_rgba(192,192,192,0.4)] border-gray-300/30';
    if (rank === 3) return 'shadow-[0_0_8px_rgba(205,127,50,0.35)] border-orange-400/25';
    return '';
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-white/40';
  };

  return (
    <div className="min-h-screen bg-space-deep">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">

        {/* ── Hero Section ──────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-nebulae-purple/20 bg-gradient-to-br from-nebulae-purple/10 via-transparent to-ai-blue/10 px-8 py-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.08),transparent_70%)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 inline-flex text-6xl"
          >
            🚀
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-5xl font-bold text-gradient sm:text-6xl"
          >
            游乐场星云
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-4 text-lg text-white/60"
          >
            打破边界，自由创造
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-sm text-white/30"
          >
            AI 创意实验室 · 你的想象力没有上限
          </motion.p>
        </motion.section>

        {/* ── AI 实验工坊 ──────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <h2 className="font-display text-2xl font-bold text-white">AI 实验工坊</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIMENT_TYPES.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <CosmicCard hoverable glow padding="lg" className="h-full">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                      style={{ background: `${exp.color}15` }}
                    >
                      {exp.icon}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {exp.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {exp.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{formatCount(exp.usageCount)} 次使用</span>
                    </div>
                    <CosmicButton
                      className="mt-5 w-full"
                      onClick={() => handleEnterExperiment(exp)}
                    >
                      进入实验
                    </CosmicButton>
                  </div>
                </CosmicCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 热门实验 ──────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <h2 className="font-display text-2xl font-bold text-white">热门实验</h2>
            <span className="text-sm text-white/30">社区精选</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
              {COMMUNITY_EXPERIMENTS.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index, duration: 0.5 }}
                  className="group relative min-w-[260px] flex-shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <CosmicCard hoverable padding="sm" className="h-full overflow-hidden">
                    {/* gradient border hover effect */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, ${exp.gradientFrom}40, ${exp.gradientTo}40)`,
                        padding: '1px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    <div className="relative z-10">
                      <div
                        className="mb-3 flex h-36 items-center justify-center rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${exp.gradientFrom}20, ${exp.gradientTo}20)`,
                        }}
                      >
                        <span className="text-4xl opacity-30">
                          {['🌌', '🎹', '🌀', '🖌️', '⚛️', '📖'][index]}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-white">
                        {exp.title}
                      </h4>
                      <p className="mt-1 text-xs text-white/40">by {exp.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <svg className="h-3.5 w-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {formatCount(exp.likes)}
                        </span>
                        <CosmicButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFork(exp)}
                        >
                          一键复刻
                        </CosmicButton>
                      </div>
                    </div>
                  </CosmicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 每日灵感 & 排行榜 ──────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 每日灵感 */}
          <section className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <h2 className="font-display text-2xl font-bold text-white">每日灵感</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {INSPIRATION_PROMPTS.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <CosmicCard hoverable padding="lg" className="h-full">
                    <div className="flex flex-col h-full">
                      <span
                        className="mb-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        style={{
                          background: `${item.categoryColor}18`,
                          color: item.categoryColor,
                        }}
                      >
                        {item.category}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-white/80">
                        「{item.prompt}」
                      </p>
                      <CosmicButton
                        size="sm"
                        variant="secondary"
                        className="mt-4"
                        onClick={() => handleUseInspiration(item)}
                      >
                        使用此灵感
                      </CosmicButton>
                    </div>
                  </CosmicCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 排行榜 */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="font-display text-2xl font-bold text-white">排行榜</h2>
            </div>
            <CosmicCard padding="lg" className="h-full">
              <div className="space-y-3">
                {TOP_CREATORS.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.4 }}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5 ${getRankGlow(creator.rank)}`}
                  >
                    <span
                      className={`w-7 text-center font-display text-lg font-bold ${getRankColor(creator.rank)}`}
                    >
                      {creator.rank <= 3 ? ['👑', '🥈', '🥉'][creator.rank - 1] : creator.rank}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg">
                      {creator.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">{creator.name}</p>
                      <p className="text-xs text-white/30">{creator.experimentCount} 个实验</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CosmicCard>
          </section>
        </div>

        {/* ── Mini Challenge ────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-nebulae-purple/20 px-8 py-10"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(0,229,255,0.06))',
          }}
        >
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-nebulae-purple/20 blur-3xl" />
              <span className="relative text-6xl">🎯</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-nebulae-purple/20 px-3 py-1 text-xs text-nebulae-purple">
                <span className="h-1.5 w-1.5 rounded-full bg-nebulae-purple animate-pulse" />
                每周挑战
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                用 AI 生成一幅「时间旅行明信片」
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                用你的想象力和 AI 工具，创作一幅来自过去或未来的明信片画面。可以是维多利亚时代的太空站，也可以是 2099 年的江户城。
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-white/40">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>剩余 4 天 12 小时</span>
                </div>
                <span className="text-sm text-white/20">·</span>
                <span className="text-sm text-white/40">已有 128 人参加</span>
              </div>
            </div>
            <CosmicButton
              className="mt-2 shrink-0 bg-gradient-to-r from-nebulae-purple to-ai-blue text-white sm:mt-0"
              onClick={handleAcceptChallenge}
            >
              接受挑战
            </CosmicButton>
          </div>
        </motion.section>

      </div>
    </div>
  );
}