import { motion } from 'framer-motion'
import { BookOpen, Plus, Search, FileText, Database, MoreHorizontal, Clock } from 'lucide-react'

const knowledgeBases = [
  {
    id: 1,
    name: '产品文档库',
    docs: 128,
    size: '45.2 MB',
    updated: '2小时前',
    icon: FileText,
  },
  {
    id: 2,
    name: '技术规范库',
    docs: 67,
    size: '23.8 MB',
    updated: '1天前',
    icon: Database,
  },
  {
    id: 3,
    name: 'API 参考手册',
    docs: 234,
    size: '12.5 MB',
    updated: '3天前',
    icon: BookOpen,
  },
]

const recentDocs = [
  { name: 'v2.5 更新日志.pdf', kb: '产品文档库', time: '2小时前' },
  { name: '认证模块设计.md', kb: '技术规范库', time: '1天前' },
  { name: 'REST API 接口列表.yaml', kb: 'API 参考手册', time: '3天前' },
]

export default function KnowledgePage() {
  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-white border-b border-border-light">
        <h1 className="text-base font-semibold text-text-primary">知识库</h1>
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
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">我的知识库</h2>
          <div className="space-y-2">
            {knowledgeBases.map((kb, idx) => (
              <motion.div
                key={kb.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <kb.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-text-primary block">{kb.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-tertiary">{kb.docs} 文档</span>
                    <span className="text-[11px] text-text-tertiary">·</span>
                    <span className="text-[11px] text-text-tertiary">{kb.size}</span>
                    <span className="text-[11px] text-text-tertiary">·</span>
                    <span className="text-[11px] text-text-tertiary">{kb.updated}</span>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors">
                  <MoreHorizontal size={16} className="text-text-tertiary" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4 pb-6">
          <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">最近文档</h2>
          <div className="space-y-1">
            {recentDocs.map((doc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                <FileText size={16} className="text-text-tertiary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary block truncate">{doc.name}</span>
                  <span className="text-[11px] text-text-tertiary">{doc.kb} · {doc.time}</span>
                </div>
                <Clock size={12} className="text-text-tertiary" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
