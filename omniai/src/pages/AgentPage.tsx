import { motion } from 'framer-motion'
import { Bot, Zap, Globe, FileText, Code2, MessageSquare } from 'lucide-react'

const agents = [
  {
    id: 1,
    name: '代码助手',
    desc: '代码生成、调试、重构',
    icon: Code2,
    color: 'bg-blue-50 text-blue-500',
    status: '在线',
  },
  {
    id: 2,
    name: '写作助手',
    desc: '文案、文章、报告撰写',
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-500',
    status: '在线',
  },
  {
    id: 3,
    name: '搜索助手',
    desc: '联网搜索、信息整合',
    icon: Globe,
    color: 'bg-amber-50 text-amber-500',
    status: '在线',
  },
  {
    id: 4,
    name: '对话助手',
    desc: '日常对话、知识问答',
    icon: MessageSquare,
    color: 'bg-violet-50 text-violet-500',
    status: '在线',
  },
  {
    id: 5,
    name: '效率助手',
    desc: '任务规划、工作流自动化',
    icon: Zap,
    color: 'bg-rose-50 text-rose-500',
    status: '离线',
  },
]

const recentTasks = [
  { agent: '代码助手', task: '生成 React 组件模板', time: '10分钟前', status: '完成' },
  { agent: '写作助手', task: '撰写产品发布公告', time: '1小时前', status: '完成' },
  { agent: '搜索助手', task: '调研竞品功能对比', time: '3小时前', status: '完成' },
]

export default function AgentPage() {
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
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
              >
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
                <Bot size={16} className="text-text-tertiary" />
              </motion.div>
            ))}
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
