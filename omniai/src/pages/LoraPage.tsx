import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Download,
  Sliders,
  FileText,
  Activity,
} from 'lucide-react'

interface Props {
  onBack: () => void
}

const trainParams = [
  { label: '基础模型', value: 'OmniAI-3B-Instruct' },
  { label: '学习率', value: '2e-4' },
  { label: 'Epochs', value: '3' },
  { label: 'Batch Size', value: '4' },
  { label: 'LoRA Rank', value: '16' },
  { label: 'LoRA Alpha', value: '32' },
  { label: '数据集', value: 'custom_data.jsonl' },
]

const logLines = [
  '[INFO] Loading base model: OmniAI-3B-Instruct',
  '[INFO] Applying LoRA adapter (r=16, alpha=32)',
  '[INFO] Dataset loaded: 1,247 samples',
  '[INFO] Starting training loop...',
  '[TRAIN] Epoch 1/3 - Step 50/312 - Loss: 2.341',
  '[TRAIN] Epoch 1/3 - Step 100/312 - Loss: 1.876',
  '[TRAIN] Epoch 1/3 - Step 150/312 - Loss: 1.542',
  '[TRAIN] Epoch 1/3 - Step 200/312 - Loss: 1.321',
  '[TRAIN] Epoch 1/3 - Step 250/312 - Loss: 1.198',
  '[TRAIN] Epoch 1/3 - Step 312/312 - Loss: 1.087',
  '[INFO] Epoch 1 completed. Avg Loss: 1.393',
  '[TRAIN] Epoch 2/3 - Step 50/312 - Loss: 0.934',
  '[TRAIN] Epoch 2/3 - Step 100/312 - Loss: 0.856',
]

export default function LoraPage({ onBack }: Props) {
  const [training, setTraining] = useState<'idle' | 'running' | 'paused'>('running')
  const [progress] = useState(54)

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center gap-3 px-4 h-12 bg-white border-b border-border-light">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <h1 className="text-base font-semibold text-text-primary">LoRA 训练</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 space-y-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sliders size={14} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">训练参数</span>
            </div>
            <div className="space-y-2">
              {trainParams.map((param) => (
                <div key={param.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-text-secondary">{param.label}</span>
                  <span className="text-xs text-text-primary font-mono">{param.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">训练进度</span>
              </div>
              <span className="text-xs text-primary font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-tertiary">
              <span>Epoch 2/3 · Step 100/312</span>
              <span>预计剩余 12 分钟</span>
            </div>

            <div className="mt-4 h-24 relative">
              <svg viewBox="0 0 300 80" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,70 20,65 40,58 60,52 80,48 100,42 120,38 140,35 160,30 180,28 200,24 220,22 240,20 260,18 280,16 300,14"
                />
                <polyline
                  fill="url(#gradient)"
                  stroke="none"
                  points="0,70 20,65 40,58 60,52 80,48 100,42 120,38 140,35 160,30 180,28 200,24 220,22 240,20 260,18 280,16 300,14 300,80 0,80"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-0 right-0 text-[10px] text-text-tertiary">Loss</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">训练日志</span>
            </div>
            <div className="bg-[#1E1E2E] rounded-lg p-3 max-h-40 overflow-y-auto">
              {logLines.map((line, i) => (
                <div key={i} className="text-[11px] font-mono leading-5">
                  <span className={line.startsWith('[INFO]') ? 'text-blue-400' : line.startsWith('[TRAIN]') ? 'text-emerald-400' : 'text-gray-400'}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="flex gap-2"
          >
            {training === 'running' ? (
              <button
                onClick={() => setTraining('paused')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <Pause size={16} /> 暂停训练
              </button>
            ) : training === 'paused' ? (
              <button
                onClick={() => setTraining('running')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/5 text-primary rounded-xl text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <Play size={16} /> 继续训练
              </button>
            ) : (
              <button
                onClick={() => setTraining('running')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Play size={16} /> 开始训练
              </button>
            )}
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-danger-light text-danger rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
              <Square size={16} /> 停止
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-tertiary text-text-secondary rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              <Download size={16} /> 导出
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
