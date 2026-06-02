'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 节点类型定义 ───
const NODE_TYPES = {
  browser: { color: '#FF6B6B', icon: '🌐' },
  cdn: { color: '#FFD166', icon: '📦' },
  frontend: { color: '#00E5FF', icon: '🖥️' },
  api_gateway: { color: '#6C5CE7', icon: '🔌' },
  backend: { color: '#00F2A9', icon: '⚙️' },
  database: { color: '#E040FB', icon: '🗄️' },
  cache: { color: '#FF9100', icon: '⚡' },
  queue: { color: '#FF6B6B', icon: '📨' },
  storage: { color: '#6C5CE7', icon: '💾' },
} as const;

// ─── 节点详细信息 ───
const NODE_DETAILS: Record<string, { title: string; desc: string; tech: string[] }> = {
  browser: { title: '浏览器', desc: '用户交互层，负责渲染界面、处理用户输入和本地状态管理。', tech: ['Chrome', 'Safari', 'Firefox', 'Edge'] },
  cdn: { title: 'CDN', desc: '内容分发网络，加速静态资源交付，降低延迟。', tech: ['CloudFlare', 'AWS CloudFront', 'Vercel Edge'] },
  frontend: { title: '前端应用', desc: '单页应用或 SSR 渲染层，管理路由、状态和 UI 组件。', tech: ['React', 'Next.js', 'Vue', 'Svelte'] },
  api_gateway: { title: 'API 网关', desc: '统一入口，负责认证、限流、路由转发和协议转换。', tech: ['Kong', 'Nginx', 'Traefik', 'Envoy'] },
  backend: { title: '后端服务', desc: '业务逻辑核心，处理请求、调用数据层和第三方服务。', tech: ['Node.js', 'Go', 'Python', 'Rust'] },
  database: { title: '数据库', desc: '持久化存储，管理结构化/非结构化业务数据。', tech: ['PostgreSQL', 'MySQL', 'MongoDB'] },
  cache: { title: '缓存层', desc: '热点数据缓存，降低数据库压力，提升响应速度。', tech: ['Redis', 'Memcached', 'Valkey'] },
  queue: { title: '消息队列', desc: '异步任务调度，削峰填谷，保证系统最终一致性。', tech: ['RabbitMQ', 'Kafka', 'SQS', 'BullMQ'] },
  storage: { title: '对象存储', desc: '静态文件存储，图片、视频、日志等大规模数据。', tech: ['S3', 'MinIO', 'Cloudinary'] },
};

// ─── 初始节点布局 ───
const INITIAL_NODES = [
  { id: 'browser', label: 'Browser', type: 'browser', x: 40, y: 100, width: 130, height: 50 },
  { id: 'cdn', label: 'CDN', type: 'cdn', x: 230, y: 100, width: 110, height: 50 },
  { id: 'frontend', label: 'Frontend', type: 'frontend', x: 400, y: 100, width: 130, height: 50 },
  { id: 'api_gateway', label: 'API Gateway', type: 'api_gateway', x: 590, y: 100, width: 140, height: 50 },
  { id: 'backend', label: 'Backend', type: 'backend', x: 790, y: 100, width: 130, height: 50 },
  { id: 'database', label: 'Database', type: 'database', x: 980, y: 40, width: 140, height: 50 },
  { id: 'cache', label: 'Cache', type: 'cache', x: 980, y: 115, width: 140, height: 50 },
  { id: 'queue', label: 'Queue', type: 'queue', x: 980, y: 190, width: 140, height: 50 },
  { id: 'storage', label: 'Storage', type: 'storage', x: 980, y: 265, width: 140, height: 50 },
];

// ─── 初始连线 ───
const INITIAL_CONNS = [
  { id: 'c1', from: 'browser', to: 'cdn' },
  { id: 'c2', from: 'cdn', to: 'frontend' },
  { id: 'c3', from: 'frontend', to: 'api_gateway' },
  { id: 'c4', from: 'api_gateway', to: 'backend' },
  { id: 'c5', from: 'backend', to: 'database' },
  { id: 'c6', from: 'backend', to: 'cache' },
  { id: 'c7', from: 'backend', to: 'queue' },
  { id: 'c8', from: 'backend', to: 'storage' },
];

// ─── 模板数据 ───
interface TemplateConfig {
  name: string;
  icon: string;
  description: string;
  structure: string;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  'nextjs-fastapi': {
    name: 'Next.js + FastAPI',
    icon: '⚛️',
    description: '全栈类型安全方案：Next.js 14 前端 + FastAPI Python 后端，内置 Docker Compose 编排。',
    structure: `my-app/
├── frontend/                # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   └── api/             # API Routes
│   ├── components/
│   │   ├── ui/              # UI 组件
│   │   └── layout/          # 布局组件
│   ├── lib/                 # 工具函数
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── main.py          # 入口
│   │   ├── core/
│   │   │   └── config.py    # 配置
│   │   ├── models/          # 数据模型
│   │   ├── routers/         # API 路由
│   │   └── services/        # 业务逻辑
│   ├── migrations/          # Alembic 迁移
│   ├── requirements.txt
│   └── alembic.ini
├── docker-compose.yml       # 容器编排
├── .env.example
└── README.md`,
  },
  mern: {
    name: 'MERN Stack',
    icon: '🍃',
    description: '经典全栈组合：MongoDB + Express + React + Node.js，快速构建 Web 应用。',
    structure: `mern-app/
├── client/                  # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/        # API 调用
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tailwind.config.js
├── server/                  # Express + Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts         # 入口
│   ├── package.json
│   └── tsconfig.json
├── .env.example
└── README.md`,
  },
  t3: {
    name: 'T3 Stack',
    icon: '🔺',
    description: 'Type-Safe 全栈：Next.js + tRPC + Prisma + NextAuth，端到端类型安全。',
    structure: `t3-app/
├── src/
│   ├── app/
│   │   ├── _components/     # 页面组件
│   │   ├── api/
│   │   │   └── trpc/[trpc]/ # tRPC 端点
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/     # tRPC 路由
│   │   │   └── root.ts
│   │   └── db/
│   │       ├── schema.ts    # Prisma Schema
│   │       └── index.ts     # DB 客户端
│   ├── trpc/
│   │   ├── react.tsx        # tRPC Provider
│   │   └── server.ts        # 服务端调用
│   ├── lib/
│   ├── styles/
│   └── env.js               # 环境变量校验
├── prisma/
│   └── schema.prisma
├── next.config.js
├── tailwind.config.ts
├── package.json
├── tsconfig.json
└── .env.example`,
  },
};

export default function FullstackDevPage() {
  const meta = ROLES_META.fullstack_dev;
  const [tab, setTab] = useState<'architecture' | 'templates'>('architecture');
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    icon?: string;
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleNodeSelect = useCallback((node: {
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    icon?: string;
  }) => {
    setSelectedNode(node);
  }, []);

  const handleGenerate = useCallback((templateKey: string) => {
    const template = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    if (!template) return;

    setGenerating(true);
    setSelectedTemplate(null);

    toast.loading('正在生成项目结构...', { id: 'generate' });
    setTimeout(() => {
      setSelectedTemplate(templateKey);
      setGenerating(false);
      toast.success(`${template.name} 项目已生成！`, { id: 'generate' });
    }, 1500);
  }, []);

  const nodeDetail = selectedNode
    ? NODE_DETAILS[selectedNode.type as keyof typeof NODE_DETAILS]
    : null;

  const nodeTypeInfo = selectedNode
    ? NODE_TYPES[selectedNode.type as keyof typeof NODE_TYPES]
    : null;

  const tabs = [
    { key: 'architecture' as const, label: '全栈架构图', icon: '🗺️' },
    { key: 'templates' as const, label: '模板生成器', icon: '📋' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ── 头部 ── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">🌐</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">融合反应堆</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>

        {/* 标签切换 */}
        <div className="flex items-center gap-1 ml-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedNode(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                tab === t.key
                  ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
          <CosmicButton
            size="sm"
            onClick={() => toast.success('发布到 #dev 频道')}
          >
            发布
          </CosmicButton>
        </div>
      </div>

      {/* ── 主体内容 ── */}
      <AnimatePresence mode="wait">
        {tab === 'architecture' && (
          <motion.div
            key="architecture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex overflow-hidden"
          >
            {/* 架构图区域 */}
            <div className="flex-1 relative">
              <FlowCanvas
                nodes={INITIAL_NODES}
                connections={INITIAL_CONNS}
                nodeTypes={NODE_TYPES as Record<string, { color: string; icon: string }>}
                onSelectNode={handleNodeSelect}
                readOnly
              />
              {/* 浮动提示 */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-space-card/80 text-[10px] text-white/40 font-mono">
                点击节点查看详情
              </div>
            </div>

            {/* 右侧属性面板 */}
            <AnimatePresence>
              {selectedNode && nodeDetail && nodeTypeInfo && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="border-l border-cosmic-border bg-space-card/60 overflow-hidden"
                >
                  <div className="w-[300px] p-4 h-full flex flex-col">
                    {/* 标题栏 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{nodeTypeInfo.icon}</span>
                        <span
                          className="text-sm font-display font-semibold"
                          style={{ color: nodeTypeInfo.color }}
                        >
                          {nodeDetail.title}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-white/30 hover:text-white/60 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 类型标签 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: nodeTypeInfo.color,
                          color: nodeTypeInfo.color,
                          backgroundColor: `${nodeTypeInfo.color}10`,
                        }}
                      >
                        {selectedNode.type}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">
                        ID: {selectedNode.id}
                      </span>
                    </div>

                    {/* 描述 */}
                    <p className="text-xs text-white/60 leading-relaxed mb-4">
                      {nodeDetail.desc}
                    </p>

                    {/* 技术栈 */}
                    <div>
                      <h4 className="text-[10px] font-mono text-white/30 uppercase mb-2 tracking-wider">
                        常用技术
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {nodeDetail.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/50 border border-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 分隔 */}
                    <div className="my-4 border-t border-cosmic-border" />

                    {/* 节点坐标 */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono text-white/30 uppercase mb-1 tracking-wider">
                        位置信息
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'X', value: selectedNode.x },
                          { label: 'Y', value: selectedNode.y },
                          { label: 'W', value: selectedNode.width },
                        ].map((dim) => (
                          <div
                            key={dim.label}
                            className="p-2 rounded-lg bg-white/5 border border-white/5"
                          >
                            <p className="text-[9px] text-white/30">{dim.label}</p>
                            <p className="text-xs text-white/60 font-mono">{dim.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 底部操作 */}
                    <div className="mt-auto pt-3">
                      <CosmicButton
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          toast.success(`已复制 ${nodeDetail.title} 配置模板`)
                        }
                      >
                        📋 复制配置模板
                      </CosmicButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 无选中时占位 */}
            {!selectedNode && (
              <div className="w-64 border-l border-cosmic-border bg-space-card/30 flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-3xl block mb-2 opacity-30">🗺️</span>
                  <p className="text-xs text-white/30">点击架构图中的节点</p>
                  <p className="text-xs text-white/20">查看组件详情</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex overflow-hidden"
          >
            {/* 模板卡片区域 */}
            <div className="flex-1 overflow-auto p-4">
              <h3 className="text-sm font-display text-white/70 mb-4">
                选择全栈模板，一键生成项目脚手架
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map((key) => {
                  const tmpl = TEMPLATES[key];
                  const isActive = selectedTemplate === key;
                  return (
                    <CosmicCard
                      key={key}
                      padding="md"
                      hoverable
                      glow={isActive}
                      className={isActive ? 'ring-1 ring-nebulae-purple/40' : ''}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{tmpl.icon}</span>
                        <h4 className="font-display text-white text-sm font-semibold">
                          {tmpl.name}
                        </h4>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">
                        {tmpl.description}
                      </p>
                      <CosmicButton
                        size="sm"
                        className="w-full"
                        isLoading={generating && selectedTemplate === null}
                        onClick={() => handleGenerate(key as string)}
                      >
                        一键生成
                      </CosmicButton>
                    </CosmicCard>
                  );
                })}
              </div>
            </div>

            {/* 代码预览区域 */}
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="border-l border-cosmic-border bg-[#0a0a14] overflow-hidden"
                >
                  <div className="w-[380px] h-full flex flex-col">
                    {/* 预览头部 */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-cosmic-border bg-space-card/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]?.icon}
                        </span>
                        <span className="text-xs font-display text-white/70">
                          {TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]?.name}
                        </span>
                      </div>
                      <CosmicButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const tmpl = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];
                          navigator.clipboard.writeText(tmpl?.structure ?? '').then(() =>
                            toast.success('项目结构已复制到剪贴板')
                          );
                        }}
                      >
                        📋 复制
                      </CosmicButton>
                    </div>

                    {/* 项目结构 */}
                    <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                      <pre className="text-green-400/80 whitespace-pre">
                        <code>
                          {TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]?.structure}
                        </code>
                      </pre>
                    </div>

                    {/* 底部提示 */}
                    <div className="px-4 py-2 border-t border-cosmic-border bg-space-card/30">
                      <p className="text-[10px] text-white/30">
                        在终端中运行以上命令即可创建项目
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 无模板选中时占位 */}
            {!selectedTemplate && (
              <div className="w-72 border-l border-cosmic-border bg-space-card/30 flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-3xl block mb-2 opacity-30">💻</span>
                  <p className="text-xs text-white/30">选择一个模板</p>
                  <p className="text-xs text-white/20">查看项目结构预览</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}