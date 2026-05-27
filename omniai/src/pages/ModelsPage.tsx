import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  HardDrive,
  Zap,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  Search,
  Plus,
  Flame,
} from 'lucide-react'
import type { Page } from '../App'

interface Props {
  onNavigate?: (page: Page) => void
}

interface Model {
  id: number
  name: string
  size: string
  quant: string
  status: 'loaded' | 'running' | 'idle' | 'download'
  gpu: boolean
  lora?: boolean
}

const models: Model[] = [
  { id: 1, name: 'OmniAI-3B-Instruct', size: '1.8 GB', quant: 'Q4_K_M', status: 'running', gpu: true },
  { id: 2, name: 'OmniAI-7B-Instruct', size: '4.1 GB', quant: 'Q5_K_M', status: 'loaded', gpu: true, lora: true },
  { id: 3, name: 'OmniAI-1.5B-Chat', size: '0.9 GB', quant: 'Q8_0', status: 'idle', gpu: false },
  { id: 4, name: 'OmniAI-13B-Base', size: '7.3 GB', quant: 'Q4_K_M', status: 'download', gpu: false },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  running: { label: '运行中', color: 'bg-emerald-50 text-emerald-600' },
  loaded: { label: '已加载', color: 'bg-blue-50 text-blue-600' },
  idle: { label: '未加载', color: 'bg-gray-50 text-gray-500' },
  download: { label: '下载中', color: 'bg-amber-50 text-amber-600' },
}

export default function ModelsPage({ onNavigate }: Props) {
  const [enabledModels, setEnabledModels] = useState<Set<number>>(new Set([1, 2]))

  const toggleModel = (id: number) => {
    setEnabledModels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-white border-b border-border-light">
        <h1 className="text-base font-semibold text-text-primary">模型管理</h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors">
            <Search size={18} className="text-text-secondary" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors">
            <Plus size={18} className="text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
              <Cpu size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">当前活跃模型</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">运行中</span>
              </div>
              <span className="text-xs text-text-secondary">OmniAI-3B-Instruct · GPU 加速</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">本地模型</h2>
            <button
              onClick={() => onNavigate?.('lora')}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              <Flame size={12} /> LoRA 训练
            </button>
          </div>

          <div className="space-y-2 pb-6">
            {models.map((model, idx) => {
              const status = statusConfig[model.status]
              const enabled = enabledModels.has(model.id)
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  className="bg-white rounded-xl p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HardDrive size={16} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">{model.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-text-tertiary">{model.size}</span>
                        <span className="text-[11px] text-text-tertiary">·</span>
                        <span className="text-[11px] text-text-tertiary">{model.quant}</span>
                        {model.gpu && (
                          <>
                            <span className="text-[11px] text-text-tertiary">·</span>
                            <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Zap size={9} /> GPU
                            </span>
                          </>
                        )}
                        {model.lora && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">LoRA</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleModel(model.id)}
                        className="transition-colors"
                      >
                        {enabled ? (
                          <ToggleRight size={24} className="text-primary" />
                        ) : (
                          <ToggleLeft size={24} className="text-text-tertiary" />
                        )}
                      </button>
                      <button className="p-1 rounded hover:bg-surface-tertiary transition-colors">
                        <MoreHorizontal size={16} className="text-text-tertiary" />
                      </button>
                    </div>
                  </div>
                  {model.status === 'download' && (
                    <div className="mt-3 ml-12">
                      <div className="h-1 bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '67%' }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-text-tertiary">4.9 / 7.3 GB</span>
                        <span className="text-[10px] text-text-tertiary">2.4 MB/s</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
