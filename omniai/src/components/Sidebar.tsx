import { motion } from 'framer-motion'
import {
  X,
  Plus,
  Cloud,
  Pin,
  Trash2,
  Settings,
  HelpCircle,
} from 'lucide-react'
import type { Page } from '../App'

interface Props {
  onClose: () => void
  onNavigate: (page: Page) => void
}

const conversations = [
  { id: 1, title: 'Python 数据分析脚本', time: '10分钟前', model: 'OmniAI 3B', pinned: true },
  { id: 2, title: 'React 组件优化方案', time: '1小时前', model: 'OmniAI 7B', pinned: false },
  { id: 3, title: '机器学习模型调参', time: '3小时前', model: 'OmniAI 3B', pinned: false },
  { id: 4, title: 'API 接口文档生成', time: '昨天', model: '云端增强', pinned: true },
  { id: 5, title: 'SQL 查询优化建议', time: '昨天', model: 'OmniAI 3B', pinned: false },
  { id: 6, title: '产品需求文档撰写', time: '2天前', model: 'OmniAI 7B', pinned: false },
  { id: 7, title: '代码审查与重构', time: '3天前', model: 'OmniAI 3B', pinned: false },
]

export default function Sidebar({ onClose, onNavigate }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="absolute left-0 top-0 bottom-0 w-80 bg-surface z-50 flex flex-col shadow-xl"
      >
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">OmniAI</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-text-primary truncate">User</span>
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">
                  Pro
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Cloud size={10} className="text-success" />
                <span className="text-[11px] text-text-tertiary">已同步</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-2">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
            <Plus size={16} />
            新建对话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="flex items-center justify-between px-1 py-2">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">对话历史</span>
          </div>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer mb-0.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {conv.pinned && <Pin size={10} className="text-text-tertiary flex-shrink-0" />}
                  <span className="text-sm text-text-primary truncate">{conv.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-text-tertiary">{conv.time}</span>
                  <span className="text-[10px] text-text-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded">
                    {conv.model}
                  </span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-tertiary rounded-lg">
                <Trash2 size={13} className="text-text-tertiary" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border-light p-3 space-y-1">
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-colors"
          >
            <Settings size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">设置</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-colors">
            <HelpCircle size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">帮助与反馈</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
