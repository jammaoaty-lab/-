import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Cpu,
  Zap,
  HardDrive,
  Shield,
  Terminal,
  Info,
  ChevronRight,
} from 'lucide-react'

interface Props {
  onBack: () => void
}

interface SettingItem {
  icon: React.ElementType
  label: string
  type: 'toggle' | 'navigate' | 'info'
  value?: boolean | string
}

const sections: { title: string; items: SettingItem[] }[] = [
  {
    title: '账号设置',
    items: [
      { icon: User, label: '账号信息', type: 'navigate' },
      { icon: Shield, label: '隐私设置', type: 'navigate' },
    ],
  },
  {
    title: 'AI 设置',
    items: [
      { icon: Cpu, label: '默认模型', type: 'info', value: 'OmniAI 3B' },
      { icon: Zap, label: 'GPU 加速', type: 'toggle', value: true },
      { icon: HardDrive, label: '推理精度', type: 'info', value: 'FP16' },
      { icon: Cpu, label: '最大上下文长度', type: 'info', value: '4096' },
    ],
  },
  {
    title: '存储与缓存',
    items: [
      { icon: HardDrive, label: '缓存大小', type: 'info', value: '2.4 GB' },
      { icon: HardDrive, label: '自动清理缓存', type: 'toggle', value: false },
    ],
  },
  {
    title: '高级',
    items: [
      { icon: Terminal, label: '开发者模式', type: 'toggle', value: false },
      { icon: Info, label: '关于 OmniAI', type: 'navigate' },
    ],
  },
]

export default function SettingsPage({ onBack }: Props) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'GPU 加速': true,
    '自动清理缓存': false,
    '开发者模式': false,
  })

  const handleToggle = (label: string) => {
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center gap-3 px-4 h-12 bg-white border-b border-border-light">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <h1 className="text-base font-semibold text-text-primary">设置</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 space-y-4 pb-6">
          {sections.map((section, sIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.05, duration: 0.25 }}
            >
              <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h2>
              <div className="bg-white rounded-xl overflow-hidden">
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={iIdx}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-text-secondary" />
                      </div>
                      <span className="flex-1 text-sm text-text-primary">{item.label}</span>
                      {item.type === 'toggle' && (
                        <button
                          onClick={() => handleToggle(item.label)}
                          className="transition-colors"
                        >
                          {toggles[item.label] ? (
                            <div className="w-11 h-6 bg-primary rounded-full relative transition-colors">
                              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-all" />
                            </div>
                          ) : (
                            <div className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors">
                              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm transition-all" />
                            </div>
                          )}
                        </button>
                      )}
                      {item.type === 'info' && (
                        <span className="text-sm text-text-tertiary">{item.value}</span>
                      )}
                      {item.type === 'navigate' && (
                        <ChevronRight size={16} className="text-text-tertiary" />
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
