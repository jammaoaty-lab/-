'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

type PMTool = 'whiteboard' | 'journey' | 'competitive' | 'funnel' | 'prd';

interface WhiteboardCard {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  cluster: string;
}

interface JourneyPoint {
  id: string;
  label: string;
  emotion: number;
  description: string;
}

export default function PMWorkbench() {
  const meta = ROLES_META.pm;
  const [tool, setTool] = useState<PMTool>('whiteboard');

  // 引力白板
  const [cards, setCards] = useState<WhiteboardCard[]>([
    { id: 'c1', text: '用户画像', x: 80, y: 60, color: '#6C5CE7', cluster: 'research' },
    { id: 'c2', text: '痛点分析', x: 250, y: 50, color: '#FF6B6B', cluster: 'research' },
    { id: 'c3', text: '竞品调研', x: 160, y: 180, color: '#00E5FF', cluster: 'research' },
    { id: 'c4', text: '核心功能', x: 500, y: 60, color: '#00F2A9', cluster: 'feature' },
    { id: 'c5', text: 'MVP 范围', x: 520, y: 160, color: '#FFD166', cluster: 'feature' },
    { id: 'c6', text: '技术方案', x: 800, y: 80, color: '#E040FB', cluster: 'tech' },
    { id: 'c7', text: '测试计划', x: 820, y: 180, color: '#FF9100', cluster: 'tech' },
  ]);
  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [newCardText, setNewCardText] = useState('');

  // 用户旅程
  const [journeyPoints, setJourneyPoints] = useState<JourneyPoint[]>([
    { id: 'j1', label: '发现', emotion: 0.6, description: '社交媒体看到广告' },
    { id: 'j2', label: '注册', emotion: 0.5, description: '填写注册表单' },
    { id: 'j3', label: '首次使用', emotion: 0.7, description: '探索核心功能' },
    { id: 'j4', label: '深度使用', emotion: 0.85, description: '创建工作台项目' },
    { id: 'j5', label: '分享', emotion: 0.9, description: '发布作品到社区' },
    { id: 'j6', label: '留存', emotion: 0.65, description: '每日打卡活跃' },
  ]);

  // 竞品分析
  const [competitors] = useState([
    { name: 'Notion', x: 0.7, y: 0.8, size: 22, color: '#6C5CE7' },
    { name: 'Figma', x: 0.8, y: 0.7, size: 20, color: '#00E5FF' },
    { name: 'Miro', x: 0.5, y: 0.6, size: 18, color: '#FF6B6B' },
    { name: 'Linear', x: 0.6, y: 0.45, size: 14, color: '#00F2A9' },
    { name: 'Airtable', x: 0.45, y: 0.75, size: 16, color: '#FFD166' },
  ]);

  // PRD
  const [prdSections] = useState([
    { title: '背景与目标', content: 'Neural Town 旨在构建 AI 原生创作社区，当前市场缺乏面向多角色创作者的统一平台...' },
    { title: '用户画像', content: '设计师、开发者、产品经理、AI 爱好者等多角色创作者群体...' },
    { title: '核心功能', content: '角色专属工作台、社区星云、AIGC 导演工作台、资讯空间站...' },
    { title: '技术架构', content: 'Next.js 14 + FastAPI + PostgreSQL + Redis + Celery + Docker...' },
    { title: '里程碑', content: 'Phase1: 母舰启航 → Phase2: 设计师工作台 → Phase3: 开发者星舰 → Phase4: 全宇宙互联' },
  ]);

  const addCard = () => {
    if (!newCardText.trim()) return;
    const card: WhiteboardCard = {
      id: `c${Date.now()}`,
      text: newCardText,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      color: ['#6C5CE7', '#00E5FF', '#00F2A9', '#FFD166', '#FF6B6B'][Math.floor(Math.random() * 5)],
      cluster: 'custom',
    };
    setCards(prev => [...prev, card]);
    setNewCardText('');
    toast.success('灵感卡片已添加');
  };

  const handleCardDrag = (id: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 20;
    setCards(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  };

  const aiCluster = () => {
    toast.loading('AI 分析中...', { id: 'cluster' });
    setTimeout(() => {
      setCards(prev => prev.map((c, i) => ({
        ...c,
        x: 100 + (i % 3) * 350,
        y: 60 + Math.floor(i / 3) * 130,
        cluster: ['功能', '体验', '技术'][i % 3],
      })));
      toast.success('AI 聚类完成', { id: 'cluster' });
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {([
            { k: 'whiteboard', l: '引力白板', i: '⬡' },
            { k: 'journey', l: '用户旅程', i: '📍' },
            { k: 'competitive', l: '竞品分析', i: '🔍' },
            { k: 'funnel', l: '营销漏斗', i: '📊' },
            { k: 'prd', l: 'PRD助手', i: '📝' },
          ] as { k: PMTool; l: string; i: string }[]).map(t => (
            <button
              key={t.k}
              onClick={() => setTool(t.k)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                tool === t.k ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>{t.i}</span> {t.l}
            </button>
          ))}
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #pm 频道')}>发布</CosmicButton>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* 引力白板 */}
          {tool === 'whiteboard' && (
            <motion.div key="wb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
              <div className="px-4 py-2 flex items-center gap-2">
                <input className="cosmic-input text-xs h-8 flex-1" placeholder="添加灵感卡片..." value={newCardText} onChange={e => setNewCardText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCard()} />
                <CosmicButton size="sm" onClick={addCard}>+ 添加</CosmicButton>
                <CosmicButton size="sm" variant="secondary" onClick={aiCluster}>🤖 AI 聚类</CosmicButton>
              </div>
              <div className="flex-1 relative bg-[#0a0a14] overflow-hidden" onMouseMove={e => { if (draggingCard) handleCardDrag(draggingCard, e); }} onMouseUp={() => setDraggingCard(null)}>
                {/* 网格背景 */}
                <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="100%" y2={i * 40} stroke="white" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 40 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="100%" stroke="white" strokeWidth="0.5" />
                  ))}
                </svg>
                {cards.map(card => (
                  <div
                    key={card.id}
                    onMouseDown={(e) => { e.stopPropagation(); setDraggingCard(card.id); }}
                    className="absolute p-3 rounded-xl cursor-move text-sm shadow-lg border transition-shadow hover:shadow-xl"
                    style={{
                      left: card.x, top: card.y, width: 140,
                      backgroundColor: card.color + '20',
                      borderColor: card.color + '40',
                      color: 'white',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full mb-1.5" style={{ backgroundColor: card.color }} />
                    <p className="text-xs text-white/80">{card.text}</p>
                    <span className="text-[9px] px-1 py-0.5 rounded mt-1 inline-block" style={{ backgroundColor: card.color + '30', color: card.color }}>
                      {card.cluster}
                    </span>
                  </div>
                ))}
                {cards.length === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-white/20">添加灵感卡片开始头脑风暴</p>
                )}
              </div>
            </motion.div>
          )}

          {/* 用户旅程星图 */}
          {tool === 'journey' && (
            <motion.div key="jrny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-auto p-6">
              <CosmicCard padding="lg">
                <h3 className="text-lg font-display text-white mb-6">用户旅程星图</h3>
                <div className="relative">
                  {/* 情绪曲线背景 */}
                  <svg viewBox="0 0 800 200" className="w-full">
                    {journeyPoints.map((point, i) => {
                      if (i === journeyPoints.length - 1) return null;
                      const next = journeyPoints[i + 1];
                      const x1 = (i / (journeyPoints.length - 1)) * 760 + 20;
                      const x2 = ((i + 1) / (journeyPoints.length - 1)) * 760 + 20;
                      const y1 = 200 - point.emotion * 180;
                      const y2 = 200 - next.emotion * 180;
                      return (
                        <path key={i} d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 20} ${x2},${y2}`} fill="none" stroke="url(#grad)" strokeWidth={3} strokeLinecap="round" />
                      );
                    })}
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6C5CE7" />
                        <stop offset="50%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#00F2A9" />
                      </linearGradient>
                    </defs>
                    {/* 节点星光 */}
                    {journeyPoints.map((point, i) => {
                      const x = (i / (journeyPoints.length - 1)) * 760 + 20;
                      const y = 200 - point.emotion * 180;
                      const brightness = point.emotion;
                      return (
                        <g key={point.id}>
                          <circle cx={x} cy={y} r={5 + brightness * 6} fill="white" opacity={0.3 + brightness * 0.5}>
                            <animate attributeName="r" values={`${5 + brightness * 6};${7 + brightness * 6};${5 + brightness * 6}`} dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={x} cy={y} r={3} fill="white" />
                          <text x={x} y={215} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11}>{point.label}</text>
                          <text x={x} y={228} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>{point.description}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {journeyPoints.map(p => (
                    <div key={p.id} className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{p.label}</span>
                        <span className="text-xs text-white/40">{Math.round(p.emotion * 100)}% 满意度</span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{p.description}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-nebulae-purple to-ai-blue transition-all" style={{ width: `${p.emotion * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CosmicCard>
            </motion.div>
          )}

          {/* 竞品引力分析 */}
          {tool === 'competitive' && (
            <motion.div key="comp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-auto p-6">
              <CosmicCard padding="lg">
                <h3 className="text-lg font-display text-white mb-6">竞品引力透镜</h3>
                <p className="text-xs text-white/40 mb-4">X轴: 市场覆盖度 — Y轴: 产品创新力 — 大小: 用户规模</p>
                <div className="relative w-full h-96 bg-[#0a0a14] rounded-xl border border-cosmic-border overflow-hidden">
                  {/* 引力透镜图 */}
                  <svg viewBox="0 0 500 400" className="w-full h-full">
                    {/* 引力区域 */}
                    <defs>
                      <radialGradient id="gravity"><stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.1" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                    </defs>
                    <rect x={0} y={0} width={500} height={400} fill="url(#gravity)" />
                    {/* 坐标轴 */}
                    <line x1={50} y1={350} x2={450} y2={350} stroke="rgba(255,255,255,0.2)" />
                    <line x1={50} y1={50} x2={50} y2={350} stroke="rgba(255,255,255,0.2)" />
                    {/* 中心引力线 */}
                    <line x1={250} y1={200} x2={250} y2={200} stroke="#6C5CE7" strokeWidth={0.5} strokeDasharray="3,3" />
                    {[100, 200, 300].map(r => (
                      <circle key={r} cx={250} cy={200} r={r} fill="none" stroke="rgba(108,92,231,0.1)" strokeWidth={0.5} />
                    ))}
                    {/* 竞品星球 */}
                    {competitors.map(comp => (
                      <g key={comp.name}>
                        <circle cx={50 + comp.x * 400} cy={350 - comp.y * 300} r={comp.size} fill={comp.color} opacity={0.6}>
                          <animate attributeName="r" values={`${comp.size};${comp.size + 2};${comp.size}`} dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={50 + comp.x * 400} cy={350 - comp.y * 300} r={comp.size + 2} fill="none" stroke={comp.color} strokeWidth={0.5} opacity={0.3} />
                        <text x={50 + comp.x * 400 + comp.size + 5} y={350 - comp.y * 300 + 4} fill="white" fontSize={11}>{comp.name}</text>
                      </g>
                    ))}
                    {/* Neural Town */}
                    <circle cx={300} cy={150} r={24} fill="#6C5CE7" opacity={0.8}>
                      <animate attributeName="r" values="24;26;24" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={300} cy={150} r={28} fill="none" stroke="#00E5FF" strokeWidth={1.5} opacity={0.5} />
                    <text x={300} y={125} textAnchor="middle" fill="#00E5FF" fontSize={12} fontWeight="bold">Neural Town</text>
                    <text x={300} y={115} textAnchor="middle" fill="white" fontSize={9} opacity={0.6}>我们</text>
                  </svg>
                </div>
              </CosmicCard>
            </motion.div>
          )}

          {/* 营销漏斗 */}
          {tool === 'funnel' && (
            <motion.div key="fnl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-auto p-6">
              <CosmicCard padding="lg" className="max-w-xl mx-auto">
                <h3 className="text-lg font-display text-white mb-6">营销漏斗</h3>
                <div className="space-y-0">
                  {[
                    { label: '曝光', count: 50000, color: '#6C5CE7', pct: 100 },
                    { label: '访问', count: 12000, color: '#00E5FF', pct: 24 },
                    { label: '注册', count: 3500, color: '#00F2A9', pct: 7 },
                    { label: '激活', count: 1800, color: '#FFD166', pct: 3.6 },
                    { label: '付费', count: 420, color: '#FF6B6B', pct: 0.84 },
                  ].map((stage, i) => (
                    <div key={stage.label} className="relative">
                      <div
                        className="mx-auto flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all"
                        style={{
                          width: `${Math.max(20, stage.pct)}%`,
                          backgroundColor: stage.color + '20',
                          border: `1px solid ${stage.color}40`,
                        }}
                      >
                        <span className="text-white">{stage.label}</span>
                        <span className="text-xs text-white/50">{stage.count.toLocaleString()}</span>
                        <span className="text-xs font-mono" style={{ color: stage.color }}>{stage.pct}%</span>
                      </div>
                      {i < 4 && (
                        <div className="text-center py-1">
                          <span className="text-[10px] text-white/20">↓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <CosmicButton size="sm" variant="secondary" className="w-full mt-6" onClick={() => toast.success('AI 优化建议：优化注册流程可提升转化率12%')}>
                  🤖 AI 优化建议
                </CosmicButton>
              </CosmicCard>
            </motion.div>
          )}

          {/* PRD 助手 */}
          {tool === 'prd' && (
            <motion.div key="prd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-auto p-6">
              <CosmicCard padding="lg" className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display text-white">PRD 文档</h3>
                  <div className="flex gap-2">
                    <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('PRD 已保存')}>保存</CosmicButton>
                    <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('AI 正在优化 PRD...')}>🤖 AI 优化</CosmicButton>
                  </div>
                </div>
                <div className="space-y-4">
                  {prdSections.map((section, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <h4 className="text-sm font-medium text-white mb-2">{section.title}</h4>
                      <p className="text-xs text-white/50 leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </div>
                <CosmicButton className="w-full mt-6" onClick={() => toast.success('PRD 已发布到团队看板')}>发布 PRD</CosmicButton>
              </CosmicCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}