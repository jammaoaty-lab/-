'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES_META } from '@neural-town/shared';
import type { UserProfile, UserRole, RoleMeta } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 本地类型定义 ───

type TabKey = 'timeline' | 'works' | 'bookmarks' | 'certs';

interface ActivityItem {
  id: string;
  type: 'creation' | 'comment' | 'like' | 'task';
  icon: string;
  text: string;
  time: string;
  timeAgo: string;
}

interface ProjectItem {
  id: string;
  title: string;
  type: UserRole;
  gradient: string;
  date: string;
}

interface BookmarkItem {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  preview: string;
  date: string;
}

interface CertificationItem {
  role: UserRole;
  level: string;
  date: string;
}

// ─── 示例数据 ───

const DEMO_USER: UserProfile = {
  id: 'demo-001',
  username: 'cosmic_explorer',
  email: 'explorer@neural-town.io',
  displayName: '星际探索者',
  avatarUrl: '',
  bio: '穿梭于代码星河与设计宇宙之间，用 AI 编织未来的形状。✨',
  roleTags: ['frontend_dev', 'uiux_designer', 'ai_ml_dev'],
  certifiedRoles: ['frontend_dev', 'uiux_designer'],
  createdAt: '2025-06-01T00:00:00Z',
};

const DEMO_STATS = {
  posts: 128,
  projects: 23,
  followers: 3642,
  following: 218,
};

const DEMO_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'creation', icon: '✨', text: '发布了新作品「星云音乐播放器」', time: '2026-05-30T14:20:00Z', timeAgo: '3 天前' },
  { id: 'a2', type: 'comment', icon: '💬', text: '评论了「设计趋势 2026」帖子', time: '2026-05-30T10:15:00Z', timeAgo: '3 天前' },
  { id: 'a3', type: 'like', icon: '❤️', text: '点赞了「AI 生成的 3D 角色模型」', time: '2026-05-29T18:45:00Z', timeAgo: '4 天前' },
  { id: 'a4', type: 'task', icon: '✅', text: '完成了每日任务「代码审查 3 次」', time: '2026-05-29T09:00:00Z', timeAgo: '4 天前' },
  { id: 'a5', type: 'creation', icon: '✨', text: '发布了新作品「暗物质粒子模拟器」', time: '2026-05-28T16:30:00Z', timeAgo: '5 天前' },
  { id: 'a6', type: 'comment', icon: '💬', text: '评论了「Web3 与设计融合」专题', time: '2026-05-27T11:00:00Z', timeAgo: '6 天前' },
  { id: 'a7', type: 'like', icon: '❤️', text: '点赞了「动态星空品牌手册」', time: '2026-05-26T20:10:00Z', timeAgo: '7 天前' },
  { id: 'a8', type: 'task', icon: '✅', text: '完成了每日任务「发布一篇技术帖子」', time: '2026-05-26T08:30:00Z', timeAgo: '7 天前' },
];

const DEMO_PROJECTS: ProjectItem[] = [
  { id: 'p1', title: '星云音乐播放器', type: 'frontend_dev', gradient: 'from-nebulae-purple to-ai-blue', date: '2026-05-30' },
  { id: 'p2', title: '暗物质粒子模拟器', type: 'ai_ml_dev', gradient: 'from-success-green to-ai-blue', date: '2026-05-28' },
  { id: 'p3', title: '星际品牌视觉系统', type: 'uiux_designer', gradient: 'from-nebulae-purple to-danger-red', date: '2026-05-25' },
  { id: 'p4', title: '跨维度数据仪表盘', type: 'data_engineer', gradient: 'from-ai-blue to-success-green', date: '2026-05-20' },
  { id: 'p5', title: 'AI 角色动画引擎', type: 'ai_ml_dev', gradient: 'from-warning-gold to-danger-red', date: '2026-05-15' },
  { id: 'p6', title: '移动端宇宙主题组件库', type: 'mobile_dev', gradient: 'from-danger-red to-nebulae-purple', date: '2026-05-10' },
];

const DEMO_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'b1', author: '设计先锋', authorAvatar: '设',
    title: '2026 年 UI/UX 设计趋势报告', preview: '暗色模式、玻璃态、AI 辅助设计正在重塑数字产品的视觉语言……',
    date: '2026-05-28',
  },
  {
    id: 'b2', author: 'AI 研究员', authorAvatar: 'A',
    title: '扩散模型在创意设计中的应用', preview: '从 Stable Diffusion 到 Midjourney V7，AI 生成艺术已经进入黄金时代……',
    date: '2026-05-25',
  },
  {
    id: 'b3', author: '全栈船长', authorAvatar: '全',
    title: 'Next.js 15 服务端组件深度解析', preview: 'React Server Components 彻底改变了前端架构的思维方式……',
    date: '2026-05-20',
  },
  {
    id: 'b4', author: '3D 艺术家', authorAvatar: '3',
    title: 'Three.js + AI：实时 3D 渲染的未来', preview: 'WebGPU 的普及让浏览器端 3D 渲染性能达到了新高度……',
    date: '2026-05-18',
  },
];

const DEMO_CERTIFICATIONS: CertificationItem[] = [
  { role: 'frontend_dev', level: '高级', date: '2025-12-15' },
  { role: 'uiux_designer', level: '中级', date: '2025-11-01' },
];

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'timeline', label: '星轨', icon: '🌌' },
  { key: 'works', label: '作品', icon: '🎨' },
  { key: 'bookmarks', label: '收藏', icon: '⭐' },
  { key: 'certs', label: '认证', icon: '🏅' },
];

// ─── 辅助函数 ───

function getRoleColor(role: UserRole): string {
  return ROLES_META[role]?.color ?? '#888888';
}

// ─── 主组件 ───

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');

  const profile: UserProfile = user ?? DEMO_USER;
  const displayName = profile.displayName || profile.username;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      {/* ─── 封面横幅 ─── */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-nebulae-purple via-space-deep to-ai-blue" />
        {/* 装饰星光 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-ai-blue rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-nebulae-purple rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-success-green rounded-full animate-pulse-slow" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* ─── 用户信息卡片（覆盖在封面上方） ─── */}
      <div className="relative px-4 md:px-8 max-w-4xl mx-auto -mt-20 z-10">
        <CosmicCard padding="lg" className="!p-6 md:!p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* 头像 */}
            <div className="relative flex-shrink-0 self-center md:self-start -mt-16 md:-mt-20">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-nebulae-purple via-ai-blue to-success-green p-[3px] shadow-[0_0_30px_rgba(108,92,231,0.4)]">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-space-card flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-display font-bold text-gradient">
                      {avatarLetter}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                    {displayName}
                  </h1>
                  <p className="text-white/40 text-sm mt-0.5">@{profile.username}</p>
                </div>
                <CosmicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => toast('编辑资料功能即将上线', { icon: '🚀' })}
                >
                  ✏️ 编辑资料
                </CosmicButton>
              </div>

              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                {profile.bio || '这个探索者还没有留下足迹……'}
              </p>

              {/* 角色标签 */}
              {profile.roleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {profile.roleTags.map((role) => {
                    const meta: RoleMeta | undefined = ROLES_META[role];
                    return meta ? (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                        style={{
                          color: meta.color,
                          borderColor: meta.color + '40',
                          backgroundColor: meta.color + '15',
                        }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* 统计行 */}
              <div className="flex items-center gap-6 mt-5 pt-5 border-t border-cosmic-border justify-center md:justify-start">
                <StatItem value={DEMO_STATS.posts} label="帖子" />
                <StatItem value={DEMO_STATS.projects} label="项目" />
                <StatItem value={DEMO_STATS.followers} label="关注者" />
                <StatItem value={DEMO_STATS.following} label="关注中" />
              </div>
            </div>
          </div>
        </CosmicCard>

        {/* ─── Tab 导航 ─── */}
        <div className="flex items-center gap-1 mt-6 pb-2 border-b border-cosmic-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-nebulae-purple/20 text-white border border-nebulae-purple/50'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab 内容区 ─── */}
        <div className="mt-6 pb-12">
          <AnimatePresence mode="wait">
            {activeTab === 'timeline' && (
              <TimelineTab key="timeline" activities={DEMO_ACTIVITIES} />
            )}
            {activeTab === 'works' && (
              <WorksTab key="works" projects={DEMO_PROJECTS} />
            )}
            {activeTab === 'bookmarks' && (
              <BookmarksTab key="bookmarks" bookmarks={DEMO_BOOKMARKS} />
            )}
            {activeTab === 'certs' && (
              <CertsTab key="certs" certifications={DEMO_CERTIFICATIONS} roleTags={profile.roleTags} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── 统计项子组件 ───

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg md:text-xl font-display font-bold text-white">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

// ─── 星轨 Tab ───

function TimelineTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {activities.length === 0 ? (
        <EmptyState message="还没有活动记录" />
      ) : (
        <div className="relative pl-8">
          {/* 时间线轨道 */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-nebulae-purple via-ai-blue to-transparent rounded-full" />
          <div className="space-y-5">
            {activities.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative"
              >
                {/* 光点 */}
                <div className="absolute -left-[1.65rem] top-2 w-3 h-3 rounded-full bg-nebulae-purple shadow-[0_0_10px_rgba(108,92,231,0.6)]" />
                <CosmicCard padding="md" className="!p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80">{item.text}</p>
                      <p className="text-xs text-white/30 mt-1">{item.timeAgo}</p>
                    </div>
                  </div>
                </CosmicCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── 作品 Tab ───

function WorksTab({ projects }: { projects: ProjectItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {projects.length === 0 ? (
        <EmptyState message="还没有作品，去工作台创造吧" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => {
            const meta: RoleMeta | undefined = ROLES_META[project.type];
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <CosmicCard padding="none" className="overflow-hidden cursor-pointer">
                  {/* 缩略图渐变 */}
                  <div className={`h-32 bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                    <span className="text-4xl opacity-40">{meta?.icon ?? '📦'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-medium text-white text-sm truncate">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs"
                        style={{
                          color: meta?.color ?? '#888',
                          backgroundColor: (meta?.color ?? '#888') + '20',
                          border: `1px solid ${(meta?.color ?? '#888')}40`,
                        }}
                      >
                        {meta?.icon} {meta?.label ?? project.type}
                      </span>
                      <span className="text-xs text-white/30">{project.date}</span>
                    </div>
                  </div>
                </CosmicCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── 收藏 Tab ───

function BookmarksTab({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {bookmarks.length === 0 ? (
        <EmptyState message="还没有收藏任何帖子" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarks.map((bm, idx) => (
            <motion.div
              key={bm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <CosmicCard padding="md" className="!p-5 cursor-pointer">
                {/* 原始作者 */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center text-xs font-medium text-white">
                    {bm.authorAvatar}
                  </div>
                  <span className="text-xs text-white/50">{bm.author}</span>
                  <span className="text-xs text-white/20 ml-auto">{bm.date}</span>
                </div>
                <h3 className="font-display font-semibold text-white text-sm mb-2 line-clamp-1">
                  {bm.title}
                </h3>
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {bm.preview}
                </p>
              </CosmicCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── 认证 Tab ───

function CertsTab({
  certifications,
  roleTags,
}: {
  certifications: CertificationItem[];
  roleTags: UserRole[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert, idx) => {
          const meta: RoleMeta | undefined = ROLES_META[cert.role];
          return (
            <motion.div
              key={cert.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <CosmicCard padding="md" className="!p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: (meta?.color ?? '#888') + '20' }}
                  >
                    {meta?.icon ?? '🏅'}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-sm">
                      {meta?.label ?? cert.role}
                    </h3>
                    <span
                      className="text-xs font-medium"
                      style={{ color: meta?.color ?? '#888' }}
                    >
                      {cert.level} 认证
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/30">
                  获得日期：{cert.date}
                </div>
              </CosmicCard>
            </motion.div>
          );
        })}
      </div>

      {/* 可认证角色列表 & 申请按钮 */}
      {roleTags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-cosmic-border">
          <h3 className="text-sm font-display font-medium text-white/50 mb-3">
            可申请认证的角色
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {roleTags.map((role) => {
              const meta: RoleMeta | undefined = ROLES_META[role];
              if (!meta) return null;
              const alreadyCertified = certifications.some((c) => c.role === role);
              return (
                <span
                  key={role}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    alreadyCertified
                      ? 'opacity-50 cursor-default'
                      : 'cursor-pointer hover:opacity-80'
                  }`}
                  style={{
                    color: meta.color,
                    borderColor: meta.color + '40',
                    backgroundColor: alreadyCertified ? meta.color + '10' : meta.color + '15',
                  }}
                >
                  {meta.icon} {meta.label}
                  {alreadyCertified && (
                    <span className="ml-1 text-success-green text-[10px]">✓</span>
                  )}
                </span>
              );
            })}
          </div>

          <CosmicButton
            variant="secondary"
            size="sm"
            onClick={() => toast('认证申请功能即将上线', { icon: '🏅' })}
          >
            🏅 申请新认证
          </CosmicButton>
        </div>
      )}

      {certifications.length === 0 && roleTags.length === 0 && (
        <EmptyState message="还没有认证记录" />
      )}
    </motion.div>
  );
}

// ─── 空状态 ───

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-space-card border border-cosmic-border flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-white/30 text-sm">{message}</p>
    </div>
  );
}