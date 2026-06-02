'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

const PIPELINE_NODE_TYPES = {
  'datasource': { color: '#00F2A9', icon: '📡' },
  'clean': { color: '#FFD166', icon: '🧹' },
  'feature': { color: '#6C5CE7', icon: '🔬' },
  'train': { color: '#FF6B6B', icon: '🧠' },
  'evaluate': { color: '#00E5FF', icon: '📊' },
  'deploy': { color: '#E040FB', icon: '🚀' },
  'monitor': { color: '#FF9100', icon: '📈' },
};

const INITIAL_PIPELINE = [
  { id: 'ds', label: 'CSV Dataset', type: 'datasource', x: 40, y: 100, width: 140, height: 50 },
  { id: 'cl', label: 'Data Cleaner', type: 'clean', x: 240, y: 100, width: 140, height: 50 },
  { id: 'fe', label: 'Feature Engineer', type: 'feature', x: 440, y: 100, width: 150, height: 50 },
  { id: 'tr', label: 'LSTM Trainer', type: 'train', x: 640, y: 100, width: 140, height: 50 },
  { id: 'ev', label: 'Model Evaluator', type: 'evaluate', x: 840, y: 100, width: 150, height: 50 },
  { id: 'dp', label: 'API Deploy', type: 'deploy', x: 1040, y: 100, width: 130, height: 50 },
];

const INITIAL_CONNS = [
  { id: 'pc1', from: 'ds', to: 'cl' },
  { id: 'pc2', from: 'cl', to: 'fe' },
  { id: 'pc3', from: 'fe', to: 'tr' },
  { id: 'pc4', from: 'tr', to: 'ev' },
  { id: 'pc5', from: 'ev', to: 'dp' },
];

interface Experiment {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  accuracy: number;
  loss: number;
  epoch: number;
  timestamp: string;
}

const MOCK_EXPERIMENTS: Experiment[] = [
  { id: 'exp1', name: 'LSTM-v3', status: 'completed', accuracy: 0.923, loss: 0.187, epoch: 50, timestamp: '2026-06-01 14:30' },
  { id: 'exp2', name: 'Transformer-v2', status: 'running', accuracy: 0.891, loss: 0.234, epoch: 32, timestamp: '2026-06-02 09:15' },
  { id: 'exp3', name: 'CNN-Baseline', status: 'completed', accuracy: 0.856, loss: 0.312, epoch: 30, timestamp: '2026-05-28 11:00' },
  { id: 'exp4', name: 'ResNet-Finetune', status: 'failed', accuracy: 0.0, loss: 0.0, epoch: 0, timestamp: '2026-05-30 16:45' },
];

export default function AIMLEngineerWorkbench() {
  const meta = ROLES_META.ai_ml_dev;
  const [mode, setMode] = useState<'pipeline' | 'experiments' | 'deploy'>('pipeline');
  const [selectedExp, setSelectedExp] = useState<string | null>(null);

  const handleTrain = () => {
    toast.loading('提交训练任务...', { id: 'train' });
    setTimeout(() => toast.success('训练任务已提交到 GPU 集群', { id: 'train' }), 2000);
  };

  const handleDeploy = () => {
    toast.loading('部署模型...', { id: 'deploy' });
    setTimeout(() => toast.success('模型已部署为 API: https://api.neural.town/models/v1', { id: 'deploy' }), 1500);
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
          {(['pipeline', 'experiments', 'deploy'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              mode === m ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30' : 'text-white/50 hover:text-white/80'
            }`}>
              {m === 'pipeline' ? '🔗 数据管道' : m === 'experiments' ? '📊 实验追踪' : '🚀 部署'}
            </button>
          ))}
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #dev 频道')}>发布</CosmicButton>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {mode === 'pipeline' && (
          <div className="flex-1 relative">
            <FlowCanvas
              nodes={INITIAL_PIPELINE}
              connections={INITIAL_CONNS}
              nodeTypes={PIPELINE_NODE_TYPES}
              readOnly
            />
            {/* 操作栏 */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <CosmicButton size="sm" onClick={handleTrain}>▶ 运行管道</CosmicButton>
              <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('管道配置已保存')}>💾 保存</CosmicButton>
            </div>
          </div>
        )}

        {mode === 'experiments' && (
          <div className="flex-1 flex">
            {/* 实验列表 */}
            <div className="w-72 border-r border-cosmic-border p-3 space-y-3">
              <h3 className="text-xs font-mono text-white/60 uppercase">实验列表</h3>
              <div className="space-y-2">
                {MOCK_EXPERIMENTS.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExp(exp.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedExp === exp.id ? 'bg-nebulae-purple/20 border border-nebulae-purple/30' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        exp.status === 'running' ? 'bg-ai-blue animate-pulse' :
                        exp.status === 'completed' ? 'bg-success-green' : 'bg-danger-red'
                      }`} />
                      <span className="text-sm text-white/80">{exp.name}</span>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-white/40">
                      <span>Acc: {(exp.accuracy * 100).toFixed(1)}%</span>
                      <span>Loss: {exp.loss.toFixed(3)}</span>
                      <span>Epoch: {exp.epoch}</span>
                    </div>
                    <p className="text-[9px] text-white/20 mt-1">{exp.timestamp}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 实验详情 - 损失曲线轨道图 */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {selectedExp ? (
                <div className="w-full max-w-2xl">
                  <h3 className="text-sm font-display text-white mb-4">
                    Loss 曲线轨道图 — {MOCK_EXPERIMENTS.find(e => e.id === selectedExp)?.name}
                  </h3>
                  <div className="relative w-full h-64 bg-[#0a0a14] rounded-xl border border-cosmic-border overflow-hidden">
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {/* 轨道环 */}
                      {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
                        <ellipse key={i} cx={200} cy={100} rx={180 * r} ry={90 * r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
                      ))}
                      {/* Loss 曲线 - 螺旋轨道 */}
                      <path
                        d="M40,150 C100,140 120,80 160,90 C200,100 240,40 280,50 C320,60 340,30 380,35"
                        fill="none" stroke="#FF6B6B" strokeWidth={2} strokeLinecap="round"
                      />
                      {/* 数据点（行星） */}
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                        const t = i / 10;
                        const x = 40 + t * 340;
                        const y = 150 - 120 * Math.exp(-t * 3) + 20 * Math.sin(t * Math.PI * 4);
                        return <circle key={i} cx={x} cy={y} r={3} fill="#FF6B6B" opacity={0.8} />;
                      })}
                      {/* 轴标签 */}
                      <text x={200} y={190} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>Epochs →</text>
                      <text x={15} y={100} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} transform="rotate(-90, 15, 100)">Loss ↓</text>
                    </svg>
                  </div>
                  <div className="flex justify-around mt-4 text-xs text-white/40">
                    <span>Accuracy: 92.3%</span>
                    <span>Best Loss: 0.187</span>
                    <span>Epochs: 50</span>
                    <span>Time: 2h 34m</span>
                  </div>
                </div>
              ) : (
                <p className="text-white/30">选择一个实验查看损失曲线轨道图</p>
              )}
            </div>
          </div>
        )}

        {mode === 'deploy' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <CosmicCard padding="lg" className="max-w-md w-full">
              <div className="text-center mb-4">
                <span className="text-4xl block mb-2">🚀</span>
                <h3 className="text-lg font-display text-white">模型部署</h3>
                <p className="text-xs text-white/40 mt-1">一键将训练好的模型部署为 API</p>
              </div>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-success-green">✓</span> 模型: LSTM-v3 (ONNX)
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-success-green">✓</span> 推理环境: GPU (T4)
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-warning-gold">⟳</span> 端点: https://api.neural.town/models/lstm-v3/predict
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <CosmicButton className="w-full" onClick={handleDeploy}>部署模型</CosmicButton>
                <CosmicButton variant="secondary" className="w-full" onClick={() => toast.success('监控面板已启动')}>
                  启动监控
                </CosmicButton>
              </div>
            </CosmicCard>
          </div>
        )}
      </div>
    </div>
  );
}