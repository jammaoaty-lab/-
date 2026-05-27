import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Plus,
  MoreHorizontal,
  Send,
  Square,
  Mic,
  Paperclip,
  PenLine,
  Code2,
  Languages,
  ImageIcon,
  Headphones,
  Search,
  Database,
  Bot,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Brain,
  ChevronDown,
  ChevronRight,
  Check,
  Trash2,
} from 'lucide-react'
import { useToast } from '../components/Toast'

interface Props {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

const quickActionPrompts: Record<string, string> = {
  'AI写作': '请帮我写一篇关于',
  '代码生成': '请用以下语言编写代码：',
  '翻译': '请将以下内容翻译成英文：',
  'OCR识图': '请识别并提取图片中的文字内容',
  '语音助手': '我想使用语音助手功能，请帮我',
  'AI搜索': '请帮我搜索关于',
  '知识库': '请从知识库中检索关于',
  'Agent': '请调用 Agent 帮我完成以下任务：',
}

const quickActions = [
  { icon: PenLine, label: 'AI写作' },
  { icon: Code2, label: '代码生成' },
  { icon: Languages, label: '翻译' },
  { icon: ImageIcon, label: 'OCR识图' },
  { icon: Headphones, label: '语音助手' },
  { icon: Search, label: 'AI搜索' },
  { icon: Database, label: '知识库' },
  { icon: Bot, label: 'Agent' },
]

interface ThinkingStep {
  id: number
  content: string
  done: boolean
}

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  model?: string
  status?: 'streaming' | 'done'
  deepThinking?: boolean
  thinkingSteps?: ThinkingStep[]
  thinkingExpanded?: boolean
  copied?: boolean
  liked?: boolean | null
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'user',
    content: '帮我写一个 Python 数据分析脚本，读取 CSV 文件并生成统计摘要',
  },
  {
    id: 2,
    role: 'ai',
    content: `好的，这是一个使用 pandas 的数据分析脚本：

\`\`\`python
import pandas as pd
import numpy as np

def analyze_csv(filepath: str) -> dict:
    df = pd.read_csv(filepath)
    
    summary = {
        'shape': df.shape,
        'columns': df.dtypes.to_dict(),
        'null_counts': df.isnull().sum().to_dict(),
        'numeric_stats': df.describe().to_dict()
    }
    
    return summary

if __name__ == '__main__':
    result = analyze_csv('data.csv')
    print(result)
\`\`\`

这个脚本会读取 CSV 文件并返回以下信息：
- **数据形状**：行数和列数
- **列类型**：每列的数据类型
- **空值统计**：每列的缺失值数量
- **数值统计**：均值、标准差、最值等

需要我添加可视化功能吗？`,
    model: 'OmniAI 3B',
    status: 'done',
  },
  {
    id: 3,
    role: 'user',
    content: '加上 matplotlib 可视化',
  },
  {
    id: 4,
    role: 'ai',
    content: `已添加可视化模块：

\`\`\`python
import matplotlib.pyplot as plt

def plot_distributions(df: pd.DataFrame):
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    fig, axes = plt.subplots(
        len(numeric_cols), 2,
        figsize=(12, 4 * len(numeric_cols))
    )
    
    for i, col in enumerate(numeric_cols):
        axes[i][0].hist(df[col].dropna(), bins=30, color='#3B82F6', alpha=0.7)
        axes[i][0].set_title(f'{col} - Distribution')
        
        axes[i][1].boxplot(df[col].dropna(), vert=True)
        axes[i][1].set_title(f'{col} - Box Plot')
    
    plt.tight_layout()
    plt.savefig('analysis.png', dpi=150)
    plt.show()
\`\`\`

会为每个数值列生成直方图和箱线图，保存为 \`analysis.png\`。`,
    model: 'OmniAI 3B',
    status: 'done',
  },
]

const aiResponseTemplates = [
  '好的，让我来帮你处理这个问题。\n\n根据你的需求，我建议以下方案：\n\n1. 首先明确问题的核心目标\n2. 选择合适的技术方案\n3. 逐步实施并验证\n\n如果你能提供更多细节，我可以给出更精准的建议。',
  '这是一个很好的问题！让我为你详细分析：\n\n**关键要点：**\n- 需要考虑实际场景和约束条件\n- 选择最适合当前需求的方案\n- 注意边界情况和异常处理\n\n你可以告诉我更多具体需求，我来帮你优化方案。',
  '收到！我来为你提供解决方案。\n\n\`\`\`python\ndef solution(data):\n    # 处理输入数据\n    result = process(data)\n    return result\n\`\`\`\n\n以上是一个基础框架，你可以根据实际需求进行调整。需要我进一步完善吗？',
  '让我从多个角度来分析这个问题：\n\n**方案一：** 直接处理\n- 优点：简单快速\n- 缺点：可能不够灵活\n\n**方案二：** 分步处理\n- 优点：更可控、可扩展\n- 缺点：实现稍复杂\n\n建议根据你的具体场景选择合适方案，需要详细实现吗？',
]

const deepThinkingStepsPool: string[][] = [
  [
    '让我先理解用户的需求...',
    '分析问题的关键要素和约束条件',
    '回忆相关的知识领域和最佳实践',
    '构建解决方案的初步框架',
    '验证方案的可行性和边界情况',
    '优化并组织最终回答',
  ],
  [
    '正在分析问题结构...',
    '识别核心概念和关键变量',
    '检索相关领域知识',
    '评估多种可能的解决路径',
    '选择最优方案并补充细节',
    '检查逻辑完整性和一致性',
  ],
  [
    '理解问题背景和上下文...',
    '拆解问题为可处理的子任务',
    '为每个子任务匹配最佳策略',
    '整合各部分形成完整方案',
    '审视潜在风险和改进空间',
    '生成最终结构化回答',
  ],
]

function renderContent(content: string, onCopyCode?: (code: string) => void) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3)
      const firstNewline = lines.indexOf('\n')
      const lang = firstNewline > -1 ? lines.slice(0, firstNewline).trim() : ''
      const code = firstNewline > -1 ? lines.slice(firstNewline + 1) : lines
      return (
        <div key={i} className="relative group">
          <div className="code-block">
            {lang && (
              <div className="flex items-center justify-between mb-2 text-[11px] text-gray-500">
                <span>{lang}</span>
                <button
                  onClick={() => onCopyCode?.(code)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-gray-300"
                >
                  <Copy size={11} /> 复制
                </button>
              </div>
            )}
            <pre className="whitespace-pre-wrap m-0">{code}</pre>
          </div>
        </div>
      )
    }

    const lines = part.split('\n')
    return lines.map((line, j) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-surface-tertiary text-text-primary px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>')

      if (processed.startsWith('- ')) {
        processed = '• ' + processed.slice(2)
      }

      return (
        <span key={`${i}-${j}`}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {j < lines.length - 1 && <br />}
        </span>
      )
    })
  })
}

export default function ChatPage({ onToggleSidebar }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isGenerating, setIsGenerating] = useState(false)
  const [deepThinking, setDeepThinking] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [thinkingTime, setThinkingTime] = useState(0)
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingSteps])

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current)
    }
  }, [])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setIsGenerating(false)
    setThinkingSteps([])
    setDeepThinking(false)
    showToast('已创建新对话', 'success')
  }, [showToast])

  const handleCopyMessage = useCallback((msgId: number, content: string) => {
    navigator.clipboard?.writeText(content)
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, copied: true } : m))
    showToast('已复制到剪贴板', 'success')
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, copied: false } : m))
    }, 2000)
  }, [showToast])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard?.writeText(code)
    showToast('代码已复制', 'success')
  }, [showToast])

  const handleLike = useCallback((msgId: number, type: boolean | null) => {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, liked: type } : m))
    showToast(type === true ? '感谢你的反馈！' : '已收到反馈，我会继续改进', 'info')
  }, [showToast])

  const handleRegenerate = useCallback((msgId: number) => {
    const msgIdx = messages.findIndex((m) => m.id === msgId)
    if (msgIdx < 0) return
    const newAiContent = aiResponseTemplates[Math.floor(Math.random() * aiResponseTemplates.length)]
    setMessages((prev) => [
      ...prev.slice(0, msgIdx),
      { ...prev[msgIdx], content: newAiContent, model: 'OmniAI 3B' },
    ])
    showToast('已重新生成回复', 'success')
  }, [messages, showToast])

  const handleDeleteMessage = useCallback((msgId: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
    setShowMenu(null)
    showToast('消息已删除', 'success')
  }, [showToast])

  const handleSend = () => {
    if (!input.trim() || isGenerating) return
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsGenerating(true)
    inputRef.current?.focus()

    if (deepThinking) {
      setThinkingSteps([])
      setThinkingTime(0)

      thinkingTimerRef.current = setInterval(() => {
        setThinkingTime((t) => t + 1)
      }, 1000)

      const stepsPool = deepThinkingStepsPool[Math.floor(Math.random() * deepThinkingStepsPool.length)]
      let stepIdx = 0

      const addStep = () => {
        if (stepIdx < stepsPool.length) {
          setThinkingSteps((prev) => [
            ...prev.slice(0, -1).map((s) => (s.done ? s : { ...s, done: true })),
            { id: Date.now() + stepIdx, content: stepsPool[stepIdx], done: false },
          ])
          stepIdx++
          setTimeout(addStep, 800 + Math.random() * 1200)
        } else {
          setThinkingSteps((prev) => prev.map((s) => ({ ...s, done: true })))
          if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current)

          setTimeout(() => {
            const aiContent = aiResponseTemplates[Math.floor(Math.random() * aiResponseTemplates.length)]
            const aiMsg: Message = {
              id: Date.now() + 1,
              role: 'ai',
              content: aiContent,
              model: 'OmniAI 3B · 深度思考',
              status: 'done',
              deepThinking: true,
              thinkingSteps: stepsPool.map((s, i) => ({ id: i, content: s, done: true })),
              thinkingExpanded: false,
            }
            setMessages((prev) => [...prev, aiMsg])
            setThinkingSteps([])
            setIsGenerating(false)
          }, 600)
        }
      }

      setTimeout(addStep, 500)
    } else {
      setTimeout(() => {
        const aiContent = aiResponseTemplates[Math.floor(Math.random() * aiResponseTemplates.length)]
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: 'ai',
          content: aiContent,
          model: 'OmniAI 3B',
          status: 'done',
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsGenerating(false)
      }, 1200 + Math.random() * 800)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (label: string) => {
    const prompt = quickActionPrompts[label] || ''
    setInput(prompt)
    inputRef.current?.focus()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}分${s}秒` : `${s}秒`
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-white border-b border-border-light">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <Menu size={20} className="text-text-secondary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-text-primary">OmniAI 3B</span>
          <span className="text-[11px] text-text-tertiary">本地推理中</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
            title="新建对话"
          >
            <Plus size={18} className="text-text-secondary" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors">
            <MoreHorizontal size={18} className="text-text-secondary" />
          </button>
        </div>
      </header>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">开始新对话</h2>
            <p className="text-sm text-text-secondary mb-6">选择快捷操作或直接输入你的问题</p>
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {quickActions.slice(0, 4).map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl text-xs text-text-secondary hover:bg-surface-tertiary transition-colors text-left"
                >
                  <action.icon size={14} className="text-primary flex-shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                )}
                <div>
                  {msg.deepThinking && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <div className="mb-2">
                      <button
                        onClick={() => {
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id ? { ...m, thinkingExpanded: !m.thinkingExpanded } : m
                            )
                          )
                        }}
                        className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors"
                      >
                        <Brain size={12} />
                        <span>深度思考过程</span>
                        {msg.thinkingExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <AnimatePresence>
                        {msg.thinkingExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1.5 px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/10">
                              {msg.thinkingSteps.map((step) => (
                                <div key={step.id} className="flex items-start gap-2 py-1">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${step.done ? 'bg-primary' : 'bg-primary/40 animate-pulse'}`} />
                                  <span className={`text-[11px] leading-relaxed ${step.done ? 'text-text-secondary' : 'text-primary/70'}`}>
                                    {step.content}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-user-bubble text-text-primary rounded-br-md'
                        : 'bg-white text-text-primary rounded-bl-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    {msg.role === 'ai' ? renderContent(msg.content, handleCopyCode) : msg.content}
                  </div>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-3 mt-1.5 px-1">
                      <span className="text-[10px] text-text-tertiary">{msg.model}</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 rounded hover:bg-surface-tertiary transition-colors"
                          title="复制"
                        >
                          {msg.copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-text-tertiary" />}
                        </button>
                        <button
                          onClick={() => handleLike(msg.id, msg.liked === true ? null : true)}
                          className={`p-1 rounded transition-colors ${msg.liked === true ? 'text-primary' : 'hover:bg-surface-tertiary text-text-tertiary'}`}
                          title="有帮助"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={() => handleLike(msg.id, msg.liked === false ? null : false)}
                          className={`p-1 rounded transition-colors ${msg.liked === false ? 'text-danger' : 'hover:bg-surface-tertiary text-text-tertiary'}`}
                          title="需改进"
                        >
                          <ThumbsDown size={12} />
                        </button>
                        <button
                          onClick={() => handleRegenerate(msg.id)}
                          className="p-1 rounded hover:bg-surface-tertiary transition-colors"
                          title="重新生成"
                        >
                          <RotateCcw size={12} className="text-text-tertiary" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowMenu(showMenu === msg.id ? null : msg.id)}
                            className="p-1 rounded hover:bg-surface-tertiary transition-colors"
                          >
                            <MoreHorizontal size={12} className="text-text-tertiary" />
                          </button>
                          <AnimatePresence>
                            {showMenu === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute left-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-border-light py-1 min-w-[100px] z-10"
                              >
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-danger-light transition-colors"
                                >
                                  <Trash2 size={11} />
                                  删除消息
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {isGenerating && deepThinking && thinkingSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain size={14} className="text-primary animate-pulse" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={12} className="text-primary" />
                      <span className="text-xs font-medium text-primary">深度思考中</span>
                      <span className="text-[10px] text-text-tertiary">{formatTime(thinkingTime)}</span>
                    </div>
                    <div className="space-y-1">
                      {thinkingSteps.map((step) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2 py-0.5"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${step.done ? 'bg-primary' : 'bg-primary/40 animate-pulse'}`} />
                          <span className={`text-[11px] leading-relaxed ${step.done ? 'text-text-secondary' : 'text-primary/70'}`}>
                            {step.content}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isGenerating && (!deepThinking || thinkingSteps.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="flex-shrink-0 bg-white border-t border-border-light">
        {messages.length > 0 && (
          <div className="px-4 pt-2 pb-1">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary rounded-full text-xs text-text-secondary hover:bg-surface-tertiary transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <action.icon size={13} className="text-text-tertiary" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="px-4 pb-3 flex items-end gap-2">
          <button
            onClick={() => showToast('附件功能即将上线', 'info')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-tertiary transition-colors flex-shrink-0 mb-0.5"
          >
            <Paperclip size={18} className="text-text-tertiary" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入内容、图片或语音..."
              rows={1}
              className="w-full resize-none rounded-2xl bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow max-h-32"
              style={{ minHeight: '40px' }}
            />
          </div>
          <button
            onClick={() => setDeepThinking(!deepThinking)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 mb-0.5 ${
              deepThinking
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-surface-tertiary text-text-tertiary'
            }`}
            title={deepThinking ? '关闭深度思考' : '开启深度思考'}
          >
            <Brain size={18} />
          </button>
          <button
            onClick={() => showToast('语音输入功能即将上线', 'info')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-tertiary transition-colors flex-shrink-0 mb-0.5"
          >
            <Mic size={18} className="text-text-tertiary" />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onClick={handleSend}
            disabled={!input.trim() && !isGenerating}
            className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 mb-0.5 transition-colors ${
              input.trim() || isGenerating
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-tertiary text-text-tertiary'
            }`}
          >
            {isGenerating ? <Square size={14} /> : <Send size={14} />}
          </motion.button>
        </div>
        {deepThinking && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1.5 text-[10px] text-primary/70">
              <Brain size={10} />
              <span>深度思考模式已开启，AI 将进行多步骤推理后再回答</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
