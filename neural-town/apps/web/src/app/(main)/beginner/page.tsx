'use client';
/**
 * @file 新手训练站 — 星际导航学院
 * 新手引导/学习中心页面
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ROLES_META, DEVELOPER_ROLES, DESIGNER_ROLES } from '@neural-town/shared';
import type { UserRole } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 类型定义 ───

interface LearningPath {
  id: string;
  name: string;
  icon: string;
  courseCount: number;
  courses: string[];
  difficulty: string;
  color: string;
}

interface DailyMission {
  id: string;
  icon: string;
  name: string;
  description: string;
  xp: number;
  progress: number;
  color: string;
}

interface CertificationInfo {
  roleKey: UserRole;
  requirements: string[];
}

interface QuickGuide {
  id: string;
  title: string;
  content: string;
}

// ─── 数据 ───

const learningPaths: LearningPath[] = [
  {
    id: 'designer',
    name: '设计师航线',
    icon: '🎨',
    courseCount: 6,
    courses: ['色彩理论基础', 'UI/UX 入门', 'AIGC 图像生成', '版式与字体设计', '品牌视觉识别', '动效设计入门'],
    difficulty: '入门',
    color: '#FF6B6B',
  },
  {
    id: 'developer',
    name: '开发者航线',
    icon: '💻',
    courseCount: 6,
    courses: ['HTML/CSS 基础', 'JavaScript 入门', 'API 开发入门', 'Git 版本控制', '数据库基础', '部署与运维入门'],
    difficulty: '入门',
    color: '#00E5FF',
  },
  {
    id: 'pm',
    name: '产品航行线',
    icon: '📊',
    courseCount: 4,
    courses: ['产品思维入门', '用户研究基础', 'PRD 写作', '数据分析入门'],
    difficulty: '入门',
    color: '#FFD166',
  },
];

const dailyMissions: DailyMission[] = [
  {
    id: 'daily-drill',
    icon: '✏️',
    name: '每日一练',
    description: '完成一个设计练习',
    xp: 50,
    progress: 0,
    color: '#6C5CE7',
  },
  {
    id: 'knowledge-fragment',
    icon: '📖',
    name: '知识碎片',
    description: '阅读一篇资讯文章',
    xp: 30,
    progress: 0,
    color: '#00E5FF',
  },
  {
    id: 'community-interaction',
    icon: '💬',
    name: '社区互动',
    description: '评论一个帖子',
    xp: 20,
    progress: 0,
    color: '#00F2A9',
  },
];

const certifications: CertificationInfo[] = [
  {
    roleKey: 'graphic_designer',
    requirements: ['完成设计师航线全部课程', '发布 3 个原创作品', '通过设计评审'],
  },
  {
    roleKey: 'frontend_dev',
    requirements: ['完成开发者航线全部课程', '提交 2 个代码项目', '通过代码评审'],
  },
  {
    roleKey: 'pm',
    requirements: ['完成产品航行线全部课程', '撰写 2 篇产品分析', '通过答辩评审'],
  },
];

const quickGuides: QuickGuide[] = [
  {
    id: 'publish-work',
    title: '如何发布第一个作品',
    content: '进入工作台选择你的角色，点击「新建项目」开始创作。完成作品后点击「发布到社区」，选择频道并填写描述即可将你的创作分享给整个社区。发布后的作品将展示在你的个人主页和对应频道中。',
  },
  {
    id: 'remix-creation',
    title: '如何复刻他人的创作',
    content: '浏览社区时，在你喜欢的作品下方点击「复刻」按钮。系统会自动将作品的参数和提示词导入到你的工作台，你可以在此基础上进行二次创作。复刻是学习的最佳途径之一！',
  },
  {
    id: 'join-discussion',
    title: '如何加入社区讨论',
    content: '在社区页面浏览帖子，点击帖子进入详情页即可查看全部评论。你可以在底部输入框撰写评论参与讨论，也可以回复其他用户的评论。记得遵守社区行为准则，友善交流。',
  },
  {
    id: 'use-workbench',
    title: '如何使用工作台',
    content: '工作台是你创作的核心空间。选择你的专业角色后，你将看到专属的工具集和创作面板。左侧面板是参数配置区，中间是预览画布，右侧是历史记录和图层管理。所有创作都会自动保存。',
  },
];

// ─── 动画变体 ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const accordionVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: { height: 'auto', opacity: 1, overflow: 'hidden', transition: { duration: 0.3 } },
};

// ─── 页面组件 ───

export default function BeginnerPage() {
  const [expandedGuides, setExpandedGuides] = useState<Set<string>>(new Set());

  const toggleGuide = (id: string) => {
    setExpandedGuides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStartPath = (pathName: string) => {
    toast.success(`🚀 开始航行：${pathName}`, {
      style: {
        background: 'rgba(13, 17, 23, 0.95)',
        color: '#fff',
        border: '1px solid rgba(108, 92, 231, 0.3)',
      },
    });
  };

  const handleMission = (missionName: string) => {
    toast.success(`✅ 任务已接受：${missionName}`, {
      style: {
        background: 'rgba(13, 17, 23, 0.95)',
        color: '#fff',
        border: '1px solid rgba(108, 92, 231, 0.3)',
      },
    });
  };

  const handleCertify = (roleKey: UserRole) => {
    const meta = ROLES_META[roleKey];
    toast.success(`📋 认证申请已提交：${meta.label}`, {
      style: {
        background: 'rgba(13, 17, 23, 0.95)',
        color: '#fff',
        border: '1px solid rgba(108, 92, 231, 0.3)',
      },
    });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-12">
      {/* ══════════════════════════════════════════════
            Hero 区域
          ══════════════════════════════════════════════ */}
      <motion.div
        className="relative text-center py-12 md:py-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-nebulae-purple/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-ai-blue/8 blur-2xl" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-success-green/8 blur-2xl" />
        </div>

        <div className="relative z-10">
          <motion.span
            className="inline-block text-5xl md:text-6xl mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌱
          </motion.span>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient mb-4">
            星际导航学院
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-4 font-display">
            从零开始，成为宇宙公民
          </p>

          <p className="text-sm md:text-base text-white/40 max-w-xl mx-auto leading-relaxed">
            欢迎来到星际导航学院！无论你是创意设计师、技术开发者还是产品思考者，
            这里都有为你量身定制的学习路径。完成课程、获取认证，
            在星辰大海中找到你的航道。
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
            学习路径
          ══════════════════════════════════════════════ */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
            🗺️ 学习路径
          </h2>
          <p className="text-sm text-white/40 mt-1">选择一条航线，开启你的星际之旅</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {learningPaths.map((path) => (
            <motion.div key={path.id} variants={itemVariants}>
              <CosmicCard padding="lg" className="h-full flex flex-col">
                {/* 路径头部 */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${path.color}15` }}
                  >
                    {path.icon}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-white text-base">
                      {path.name}
                    </h3>
                    <p className="text-xs text-white/40">
                      {path.courseCount} 门课程 · {path.difficulty}
                    </p>
                  </div>
                </div>

                {/* 课程列表 */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {path.courses.map((course, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-white/50 flex items-center gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: path.color }}
                      />
                      {course}
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                <CosmicButton
                  variant="secondary"
                  size="sm"
                  className="w-full mt-auto"
                  onClick={() => handleStartPath(path.name)}
                >
                  开始航行
                </CosmicButton>
              </CosmicCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
            每日任务
          ══════════════════════════════════════════════ */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
            🎯 每日任务
          </h2>
          <p className="text-sm text-white/40 mt-1">完成每日挑战，积累经验值（XP）</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {dailyMissions.map((mission) => (
            <motion.div key={mission.id} variants={itemVariants}>
              <CosmicCard padding="md" className="h-full flex flex-col">
                {/* 任务头部 */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{mission.icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-white text-sm">
                      {mission.name}
                    </h3>
                    <p className="text-xs text-white/40">{mission.description}</p>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-white/40">进度</span>
                    <span className="text-[10px] text-white/30">
                      {mission.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${mission.progress}%`,
                        background: `linear-gradient(90deg, ${mission.color}, ${mission.color}88)`,
                      }}
                      initial={{ width: '0%' }}
                      whileInView={{ width: `${mission.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* XP 奖励 + 按钮 */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-mono text-warning-gold">
                    +{mission.xp} XP
                  </span>
                  <CosmicButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMission(mission.name)}
                  >
                    去完成
                  </CosmicButton>
                </div>
              </CosmicCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
            角色认证
          ══════════════════════════════════════════════ */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
            🏅 角色认证
          </h2>
          <p className="text-sm text-white/40 mt-1">完成航线课程，获取官方角色认证</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {certifications.map((cert) => {
            const meta = ROLES_META[cert.roleKey];
            return (
              <motion.div key={cert.roleKey} variants={itemVariants}>
                <CosmicCard padding="lg" className="h-full flex flex-col">
                  {/* 认证角色头部 */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${meta.color}15` }}
                    >
                      {meta.icon}
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-white text-base">
                        {meta.label}
                      </h3>
                      <p className="text-xs text-white/40">
                        {meta.labelEn}
                      </p>
                    </div>
                  </div>

                  {/* 认证要求 */}
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">
                    认证要求
                  </p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {cert.requirements.map((req, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-white/50 flex items-start gap-2"
                      >
                        <span className="text-success-green mt-0.5 shrink-0">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>

                  {/* 按钮 */}
                  <CosmicButton
                    variant="secondary"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => handleCertify(cert.roleKey)}
                  >
                    申请认证
                  </CosmicButton>
                </CosmicCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
            快速入门（手风琴卡片）
          ══════════════════════════════════════════════ */}
      <section className="pb-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
            📚 快速入门
          </h2>
          <p className="text-sm text-white/40 mt-1">常见问题的快速指引</p>
        </div>

        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {quickGuides.map((guide) => {
            const isExpanded = expandedGuides.has(guide.id);

            return (
              <motion.div key={guide.id} variants={itemVariants}>
                <CosmicCard padding="none" className="overflow-hidden">
                  {/* 标题栏 */}
                  <button
                    type="button"
                    onClick={() => toggleGuide(guide.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-display font-medium text-white text-sm">
                      {guide.title}
                    </span>
                    <motion.span
                      className="text-white/40 text-lg shrink-0 ml-3"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▾
                    </motion.span>
                  </button>

                  {/* 内容 */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                      >
                        <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-cosmic-border">
                          <p className="pt-4">{guide.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CosmicCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}