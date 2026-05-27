import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Globe, FileText, Code2, MessageSquare, ChevronDown } from 'lucide-react'
import { useToast } from '../components/Toast'

const agents = [
  {
    id: 1,
    name: '代码助手',
    desc: '代码生成、调试、重构',
    icon: Code2,
    color: 'bg-blue-50 text-blue-500',
    status: '在线',
    capabilities: ['代码生成', 'Bug 调试', '代码重构', '单元测试', '代码审查'],
    examplePrompts: ['帮我写一个 React 自定义 Hook', '这段代码有什么问题？', '将这个类组件重构为函数组件'],
  },
  {
    id: 2,
    name: '写作助手',
    desc: '文案、文章、报告撰写',
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-500',
    status: '在线',
    capabilities: ['文案撰写', '文章润色', '报告生成', '翻译', '摘要提取'],
    examplePrompts: ['帮我写一篇产品发布公告', '润色这段文字使其更专业', '将这篇长文总结为三个要点'],
  },
  {
    id: 3,
    name: '搜索助手',
    desc: '联网搜索、信息整合',
    icon: Globe,
    color: 'bg-amber-50 text-amber-500',
    status: '在线',
    capabilities: ['联网搜索', '信息整合', '数据对比', '趋势分析', '来源追溯'],
    examplePrompts: ['调研竞品功能对比', '搜索最新的 AI 行业报告', '对比 React 和 Vue 的生态差异'],
  },
  {
    id: 4,
    name: '对话助手',
    desc: '日常对话、知识问答',
    icon: MessageSquare,
    color: 'bg-violet-50 text-violet-500',
    status: '在线',
    capabilities: ['知识问答', '日常对话', '头脑风暴', '学习辅导', '建议推荐'],
    examplePrompts: ['解释量子计算的基本原理', '帮我头脑风暴一个创业点子', '推荐适合初学者的编程语言'],
  },
  {
    id: 5,
    name: '效率助手',
    desc: '任务规划、工作流自动化',
    icon: Zap,
    color: 'bg-rose-50 text-rose-500',
    status: '离线',
    capabilities: ['任务规划', '工作流自动化', '日程管理', '模板生成', '流程优化'],
    examplePrompts: ['帮我制定一个项目计划', '优化我的日常工作流程', '生成一份会议纪要模板'],
  },
]

const recentTasks = [
  { agent: '代码助手', task: '生成 React 组件模板', time: '10分钟前', status: '完成' },
  { agent: '写作助手', task: '撰写产品发布公告', time: '1小时前', status: '完成' },
  { agent: '搜索助手', task: '调研竞品功能对比', time: '3小时前', status: '完成' },
]

export default function AgentPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { showToast } = useToast()

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleStartChat = (agentName: string) => {
    showToast(`已进入${agentName}模式`, 'success')
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-white border-b border-border-light">
        <h1 className="text-base font-semibold text-text-primary">Agent</h1>
        <button className="text-sm text-primary font-medium">自定义</button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">可用 Agent</h2>
          <div className="space-y-2">
            {agents.map((agent, idx) => {
              const isExpanded = expandedId === agent.id
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  className="bg-white rounded-xl hover:shadow-sm transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => toggleExpand(agent.id)}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.color}`}>
                      <agent.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                        <span className={`text-[10px] ${agent.status === '在线' ? 'text-success' : 'text-text-tertiary'}`}>
                          {agent.status}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">{agent.desc}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-text-tertiary" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-border-light">
                          <div className="mb-3">
                            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">能力标签</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {agent.capabilities.map((cap) => (
                                <span
                                  key={cap}
                                  className={`text-[11px] px-2 py-0.5 rounded-full ${agent.color}`}
                                >
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">示例提示</span>
                            <div className="space-y-1.5 mt-1.5">
                              {agent.examplePrompts.map((prompt) => (
                                <button
                                  key={prompt}
                                  className="w-full text-left text-xs text-text-secondary bg-surface-secondary hover:bg-surface-tertiary px-2.5 py-2 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartChat(agent.name)
                                  }}
                                >
                                  {prompt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            className="w-full text-sm font-medium text-white bg-primary hover:bg-primary/90 py-2 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartChat(agent.name)
                            }}
                          >
                            开始对话
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="px-4 pt-4 pb-6">
          <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">最近任务</h2>
          <div className="space-y-2">
            {recentTasks.map((task, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">{task.agent}</span>
                    <span className="text-[11px] text-text-tertiary">{task.time}</span>
                  </div>
                  <span className="text-sm text-text-primary mt-0.5 block">{task.task}</span>
                </div>
                <span className="text-[11px] text-success">{task.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
