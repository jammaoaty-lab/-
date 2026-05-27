import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, FileText, Database, Clock, ChevronDown } from 'lucide-react'
import { useToast } from '../components/Toast'

const knowledgeBases = [
  {
    id: 1,
    name: '产品文档库',
    docs: 128,
    size: '45.2 MB',
    updated: '2小时前',
    icon: FileText,
    documents: [
      { name: 'v2.5 更新日志.pdf', size: '2.3 MB', date: '2026-05-27' },
      { name: '用户手册 v3.0.docx', size: '5.1 MB', date: '2026-05-25' },
      { name: '产品路线图.xlsx', size: '1.2 MB', date: '2026-05-20' },
      { name: '需求规格说明书.pdf', size: '3.8 MB', date: '2026-05-15' },
    ],
  },
  {
    id: 2,
    name: '技术规范库',
    docs: 67,
    size: '23.8 MB',
    updated: '1天前',
    icon: Database,
    documents: [
      { name: '认证模块设计.md', size: '856 KB', date: '2026-05-26' },
      { name: '数据库设计规范.pdf', size: '4.2 MB', date: '2026-05-22' },
      { name: '微服务架构方案.docx', size: '6.7 MB', date: '2026-05-18' },
    ],
  },
  {
    id: 3,
    name: 'API 参考手册',
    docs: 234,
    size: '12.5 MB',
    updated: '3天前',
    icon: BookOpen,
    documents: [
      { name: 'REST API 接口列表.yaml', size: '320 KB', date: '2026-05-24' },
      { name: 'WebSocket 协议说明.md', size: '1.1 MB', date: '2026-05-21' },
      { name: 'GraphQL Schema.graphql', size: '540 KB', date: '2026-05-19' },
      { name: '错误码参考表.xlsx', size: '280 KB', date: '2026-05-12' },
    ],
  },
]

const recentDocs = [
  { name: 'v2.5 更新日志.pdf', kb: '产品文档库', time: '2小时前' },
  { name: '认证模块设计.md', kb: '技术规范库', time: '1天前' },
  { name: 'REST API 接口列表.yaml', kb: 'API 参考手册', time: '3天前' },
]

export default function KnowledgePage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast } = useToast()

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 px-4 bg-white border-b border-border-light">
        <div className="flex items-center justify-between h-12">
          <h1 className="text-base font-semibold text-text-primary">知识库</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(prev => !prev)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <Search size={18} className={showSearch ? 'text-primary' : 'text-text-secondary'} />
            </button>
            <button
              onClick={() => showToast('新建知识库功能即将上线', 'info')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <Plus size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pb-3"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索知识库或文档..."
                className="w-full h-8 px-3 text-sm bg-surface-tertiary rounded-lg outline-none focus:ring-1 focus:ring-primary/30 text-text-primary placeholder:text-text-tertiary"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
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
                className="bg-white rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(kb.id)}
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:shadow-sm transition-shadow"
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
                  <motion.div
                    animate={{ rotate: expandedId === kb.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-text-tertiary" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedId === kb.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3 space-y-1">
                        {kb.documents.map((doc, docIdx) => (
                          <motion.div
                            key={docIdx}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: docIdx * 0.04, duration: 0.2 }}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
                          >
                            <FileText size={14} className="text-text-tertiary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] text-text-primary block truncate">{doc.name}</span>
                              <span className="text-[11px] text-text-tertiary">{doc.size} · {doc.date}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                onClick={() => showToast(`正在打开: ${doc.name}`, 'info')}
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
