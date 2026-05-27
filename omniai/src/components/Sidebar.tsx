import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Plus,
  Cloud,
  Pin,
  Trash2,
  Settings,
  HelpCircle,
  Search,
} from 'lucide-react'
import type { Page } from '../App'
import { useToast } from '../components/Toast'

interface Props {
  onClose: () => void
  onNavigate: (page: Page) => void
}

const initialConversations = [
  { id: 1, title: 'Python 数据分析脚本', time: '10分钟前', model: 'OmniAI 3B', pinned: true },
  { id: 2, title: 'React 组件优化方案', time: '1小时前', model: 'OmniAI 7B', pinned: false },
  { id: 3, title: '机器学习模型调参', time: '3小时前', model: 'OmniAI 3B', pinned: false },
  { id: 4, title: 'API 接口文档生成', time: '昨天', model: '云端增强', pinned: true },
  { id: 5, title: 'SQL 查询优化建议', time: '昨天', model: 'OmniAI 3B', pinned: false },
  { id: 6, title: '产品需求文档撰写', time: '2天前', model: 'OmniAI 7B', pinned: false },
  { id: 7, title: '代码审查与重构', time: '3天前', model: 'OmniAI 3B', pinned: false },
]

export default function Sidebar({ onClose, onNavigate }: Props) {
  const { showToast } = useToast()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [conversationsList, setConversationsList] = useState(initialConversations)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const filteredConversations = conversationsList.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewConversation = () => {
    showToast('已创建新对话', 'success')
  }

  const handleDelete = (id: number) => {
    if (confirmDeleteId === id) {
      setConversationsList((prev) => prev.filter((c) => c.id !== id))
      setConfirmDeleteId(null)
      if (activeId === id) setActiveId(null)
      showToast('对话已删除', 'success')
    } else {
      setConfirmDeleteId(id)
    }
  }

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
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <Plus size={16} />
            新建对话
          </button>
        </div>

        <div className="px-3 pb-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索对话..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-surface-secondary rounded-xl border border-transparent focus:border-primary/30 focus:outline-none text-text-primary placeholder:text-text-tertiary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="flex items-center justify-between px-1 py-2">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">对话历史</span>
          </div>
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer mb-0.5 ${
                activeId === conv.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-surface-secondary border border-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {conv.pinned && <Pin size={10} className="text-text-tertiary flex-shrink-0" />}
                  <span className={`text-sm truncate ${activeId === conv.id ? 'text-primary font-medium' : 'text-text-primary'}`}>{conv.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-text-tertiary">{conv.time}</span>
                  <span className="text-[10px] text-text-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded">
                    {conv.model}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(conv.id)
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-tertiary rounded-lg flex-shrink-0 ${
                  confirmDeleteId === conv.id ? 'opacity-100 bg-danger/10' : ''
                }`}
              >
                <Trash2 size={13} className={confirmDeleteId === conv.id ? 'text-danger' : 'text-text-tertiary'} />
              </button>
              {confirmDeleteId === conv.id && (
                <span className="text-[10px] text-danger font-medium self-center flex-shrink-0">确认?</span>
              )}
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-text-tertiary text-sm">未找到匹配的对话</div>
          )}
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
