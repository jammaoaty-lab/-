'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas, type FlowNode } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── ETL 节点类型定义 ───
const ETL_NODE_TYPES = {
  ingest: { color: '#FF9F43', icon: '🔽' },
  transform: { color: '#6C5CE7', icon: '⚡' },
  validate: { color: '#00F2A9', icon: '✅' },
  enrich: { color: '#FFD166', icon: '✨' },
  aggregate: { color: '#E040FB', icon: '📊' },
  sink: { color: '#00E5FF', icon: '💾' },
};

const INITIAL_NODES = [
  { id: 'ingest', label: 'Data Ingest', type: 'ingest', x: 40, y: 60, width: 140, height: 50 },
  { id: 'transform', label: 'Transform', type: 'transform', x: 220, y: 60, width: 140, height: 50 },
  { id: 'validate', label: 'Validate', type: 'validate', x: 400, y: 60, width: 140, height: 50 },
  { id: 'enrich', label: 'Enrich', type: 'enrich', x: 580, y: 60, width: 140, height: 50 },
  { id: 'aggregate', label: 'Aggregate', type: 'aggregate', x: 760, y: 60, width: 140, height: 50 },
  { id: 'sink', label: 'Data Sink', type: 'sink', x: 940, y: 60, width: 140, height: 50 },
];

const INITIAL_CONNS = [
  { id: 'conn-ingest-transform', from: 'ingest', to: 'transform' },
  { id: 'conn-transform-validate', from: 'transform', to: 'validate' },
  { id: 'conn-validate-enrich', from: 'validate', to: 'enrich' },
  { id: 'conn-enrich-aggregate', from: 'enrich', to: 'aggregate' },
  { id: 'conn-aggregate-sink', from: 'aggregate', to: 'sink' },
];

// ─── 数据质量指标 ───
interface QualityMetric {
  key: string;
  name: string;
  icon: string;
  value: string;
  percent: number;
  status: 'good' | 'warning' | 'critical';
}

const QUALITY_METRICS: QualityMetric[] = [
  { key: 'completeness', name: '数据完整性', icon: '🧩', value: '98.5%', percent: 98.5, status: 'good' },
  { key: 'freshness', name: '数据新鲜度', icon: '⏱️', value: '94.2%', percent: 94.2, status: 'good' },
  { key: 'anomaly', name: '异常检测', icon: '🔍', value: '3 项', percent: 12, status: 'warning' },
  { key: 'volume', name: '数据量', icon: '📦', value: '2.4 TB', percent: 76, status: 'good' },
];

// ─── 数据质量检查记录 ───
interface QualityCheck {
  dataset: string;
  checkType: string;
  result: string;
  time: string;
  status: 'pass' | 'fail' | 'warn';
}

const QUALITY_CHECKS: QualityCheck[] = [
  { dataset: 'user_analytics', checkType: '完整性检查', result: '通过', time: '10分钟前', status: 'pass' },
  { dataset: 'order_events', checkType: '新鲜度检查', result: '通过', time: '23分钟前', status: 'pass' },
  { dataset: 'payment_logs', checkType: '唯一性检查', result: '警告', time: '45分钟前', status: 'warn' },
  { dataset: 'user_sessions', checkType: '异常检测', result: '通过', time: '1小时前', status: 'pass' },
  { dataset: 'click_stream', checkType: '数据量检查', result: '失败', time: '2小时前', status: 'fail' },
];

// ─── Schema 字段定义 ───
interface SchemaField {
  name: string;
  type: string;
  constraint: string;
  description: string;
}

const SCHEMA_FIELDS: SchemaField[] = [
  { name: 'user_id', type: 'UUID', constraint: 'PRIMARY KEY', description: '用户唯一标识符' },
  { name: 'session_id', type: 'VARCHAR(64)', constraint: 'NOT NULL', description: '会话 ID，关联 session 表' },
  { name: 'event_type', type: 'VARCHAR(32)', constraint: 'NOT NULL', description: '事件类型：page_view / click / purchase' },
  { name: 'event_data', type: 'JSONB', constraint: 'DEFAULT \'{}\'', description: '事件负载数据，JSON 格式' },
  { name: 'created_at', type: 'TIMESTAMPTZ', constraint: 'NOT NULL DEFAULT NOW()', description: '事件发生时间戳' },
];

const STATUS_STYLES = {
  pass: 'bg-success-green/20 text-success-green',
  fail: 'bg-danger-red/20 text-danger-red',
  warn: 'bg-warning-gold/20 text-warning-gold',
  good: 'bg-success-green/20 text-success-green',
  warning: 'bg-warning-gold/20 text-warning-gold',
  critical: 'bg-danger-red/20 text-danger-red',
};

type SectionTab = 'etl' | 'dashboard' | 'schema';

export default function DataEngineerPage() {
  const meta = ROLES_META.data_engineer;
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [activeSection, setActiveSection] = useState<SectionTab>('etl');

  const handleNodeSelect = useCallback((node: FlowNode) => {
    setSelectedNode(node);
  }, []);

  const handleRunPipeline = () => {
    toast.loading('运行 ETL 管道...', { id: 'etl-run' });
    setTimeout(() => toast.success('ETL 管道执行完成 ✓', { id: 'etl-run' }), 2000);
  };

  const handleRunQualityCheck = () => {
    toast.loading('执行数据质量检查...', { id: 'quality' });
    setTimeout(() => toast.success('质量检查完成：3/5 通过', { id: 'quality' }), 1500);
  };

  const handleExportDDL = () => {
    const ddl = `CREATE TABLE user_analytics (\n${SCHEMA_FIELDS.map(
      (f) => `  ${f.name} ${f.type} ${f.constraint}${f.constraint !== 'PRIMARY KEY' ? ' -- ' + f.description : ''}`
    ).join(',\n')}\n);`;
    navigator.clipboard.writeText(ddl).then(() => toast.success('DDL 已复制到剪贴板'));
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ─── 头部 ─── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>

        {/* Section 导航标签 */}
        <div className="flex items-center gap-1 ml-6 bg-white/5 rounded-xl p-0.5">
          {([
            { key: 'etl', label: 'ETL 编辑器', icon: '⚙️' },
            { key: 'dashboard', label: '质量仪表盘', icon: '📈' },
            { key: 'schema', label: 'Schema 设计', icon: '🗂️' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSection(tab.key);
                setSelectedNode(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeSection === tab.key
                  ? 'bg-nebulae-purple/30 text-white shadow-[0_0_12px_rgba(108,92,231,0.3)]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {activeSection === 'etl' && (
            <CosmicButton size="sm" onClick={handleRunPipeline}>▶ 运行管道</CosmicButton>
          )}
          {activeSection === 'dashboard' && (
            <CosmicButton size="sm" onClick={handleRunQualityCheck}>🔄 执行检查</CosmicButton>
          )}
          {activeSection === 'schema' && (
            <CosmicButton size="sm" onClick={handleExportDDL}>📋 导出 DDL</CosmicButton>
          )}
          <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('发布到 #dev 频道')}>发布</CosmicButton>
        </div>
      </div>

      {/* ─── 主内容区 ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ETL 管道编辑器 */}
        {activeSection === 'etl' && (
          <>
            <div className="flex-1 relative">
              <FlowCanvas
                nodes={INITIAL_NODES}
                connections={INITIAL_CONNS}
                nodeTypes={ETL_NODE_TYPES}
                onSelectNode={handleNodeSelect}
              />
            </div>

            {/* 右侧属性面板 */}
            {selectedNode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-cosmic-border overflow-hidden shrink-0"
              >
                <div className="glass-panel h-full p-4 space-y-4 rounded-none border-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {ETL_NODE_TYPES[selectedNode.type as keyof typeof ETL_NODE_TYPES]?.icon ?? '⬡'}
                      </span>
                      <h3 className="text-sm font-display font-bold text-white">
                        {selectedNode.label}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-white/40 hover:text-white/80 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-white/40">
                      类型:{' '}
                      <span className="text-white/70">{selectedNode.type}</span>
                    </p>
                    <p className="text-white/40">
                      ID:{' '}
                      <span className="text-white/50 font-mono">{selectedNode.id}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">节点名称</label>
                      <input
                        className="cosmic-input text-xs h-8 mt-1"
                        defaultValue={selectedNode.label}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">描述</label>
                      <textarea
                        className="cosmic-input text-xs h-20 resize-none mt-1"
                        placeholder="节点描述 / SQL 片段 / 转换逻辑..."
                      />
                    </div>
                    <CosmicButton
                      size="sm"
                      className="w-full"
                      onClick={() => toast.success('节点属性已更新')}
                    >
                      更新属性
                    </CosmicButton>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* 数据质量仪表盘 */}
        {activeSection === 'dashboard' && (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* 指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUALITY_METRICS.map((metric) => (
                <CosmicCard key={metric.key} padding="md" hoverable>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{metric.icon}</span>
                    <div>
                      <p className="text-xs text-white/50">{metric.name}</p>
                      <p className="text-xl font-display font-bold text-white">{metric.value}</p>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${
                          metric.status === 'good'
                            ? '#00F2A9'
                            : metric.status === 'warning'
                            ? '#FFD166'
                            : '#FF6B6B'
                        }, ${
                          metric.status === 'good'
                            ? '#00E5FF'
                            : metric.status === 'warning'
                            ? '#FF9100'
                            : '#E040FB'
                        })`,
                        boxShadow: `0 0 8px ${
                          metric.status === 'good'
                            ? 'rgba(0,242,169,0.4)'
                            : metric.status === 'warning'
                            ? 'rgba(255,209,102,0.4)'
                            : 'rgba(255,107,107,0.4)'
                        }`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-white/30">{metric.percent}%</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        STATUS_STYLES[metric.status]
                      }`}
                    >
                      {metric.status === 'good' ? '正常' : metric.status === 'warning' ? '注意' : '严重'}
                    </span>
                  </div>
                </CosmicCard>
              ))}
            </div>

            {/* 质量检查记录表 */}
            <CosmicCard padding="md">
              <h3 className="text-sm font-display font-semibold text-white mb-4">最近数据质量检查</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-cosmic-border">
                      <th className="text-left py-2 px-3 text-white/40 font-medium">数据集</th>
                      <th className="text-left py-2 px-3 text-white/40 font-medium">检查类型</th>
                      <th className="text-left py-2 px-3 text-white/40 font-medium">结果</th>
                      <th className="text-left py-2 px-3 text-white/40 font-medium">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUALITY_CHECKS.map((check, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-2.5 px-3 text-white/80 font-mono">{check.dataset}</td>
                        <td className="py-2.5 px-3 text-white/60">{check.checkType}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              STATUS_STYLES[check.status]
                            }`}
                          >
                            {check.result}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white/40">{check.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CosmicCard>
          </div>
        )}

        {/* Schema 设计器 */}
        {activeSection === 'schema' && (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <CosmicCard padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🗂️</span>
                  <div>
                    <h3 className="text-sm font-display font-semibold text-white">user_analytics</h3>
                    <p className="text-[10px] text-white/40">用户行为分析事件表</p>
                  </div>
                </div>
                <CosmicButton size="sm" onClick={handleExportDDL}>📋 导出 DDL</CosmicButton>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-cosmic-border">
                      <th className="text-left py-3 px-4 text-white/40 font-medium w-1/6">字段名</th>
                      <th className="text-left py-3 px-4 text-white/40 font-medium w-1/6">类型</th>
                      <th className="text-left py-3 px-4 text-white/40 font-medium w-1/4">约束</th>
                      <th className="text-left py-3 px-4 text-white/40 font-medium">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEMA_FIELDS.map((field, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-nebulae-purple font-mono font-semibold">
                            {field.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-ai-blue font-mono">{field.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              field.constraint === 'PRIMARY KEY'
                                ? 'bg-warning-gold/20 text-warning-gold'
                                : field.constraint.startsWith('NOT NULL')
                                ? 'bg-nebulae-purple/20 text-nebulae-purple'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {field.constraint}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/50">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CosmicCard>

            {/* DDL 预览 */}
            <CosmicCard padding="md">
              <h3 className="text-sm font-display font-semibold text-white mb-3">DDL 预览</h3>
              <pre className="bg-[#0a0a14] p-4 rounded-xl overflow-auto text-xs font-mono text-green-400 leading-relaxed">
                <code>{`CREATE TABLE user_analytics (\n  user_id     UUID          PRIMARY KEY,\n  session_id  VARCHAR(64)   NOT NULL,\n  event_type  VARCHAR(32)   NOT NULL,\n  event_data  JSONB         DEFAULT '{}',\n  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()\n);`}</code>
              </pre>
            </CosmicCard>
          </div>
        )}
      </div>
    </div>
  );
}