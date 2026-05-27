import { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'

interface Props {
  onToggleSidebar: () => void
  sidebarOpen: boolean
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

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  model?: string
  status?: 'streaming' | 'done'
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

function renderContent(content: string) {
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
                <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-gray-300">
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
  const [messages, setMessages] = useState(initialMessages)
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: '我正在处理你的请求，请稍候...',
        model: 'OmniAI 3B',
        status: 'done',
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsGenerating(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors">
            <Plus size={18} className="text-text-secondary" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors">
            <MoreHorizontal size={18} className="text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={14} className="text-primary" />
                </div>
              )}
              <div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-user-bubble text-text-primary rounded-br-md'
                      : 'bg-white text-text-primary rounded-bl-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  {msg.role === 'ai' ? renderContent(msg.content) : msg.content}
                </div>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[10px] text-text-tertiary">{msg.model}</span>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-surface-tertiary transition-colors">
                        <Copy size={12} className="text-text-tertiary" />
                      </button>
                      <button className="p-1 rounded hover:bg-surface-tertiary transition-colors">
                        <ThumbsUp size={12} className="text-text-tertiary" />
                      </button>
                      <button className="p-1 rounded hover:bg-surface-tertiary transition-colors">
                        <ThumbsDown size={12} className="text-text-tertiary" />
                      </button>
                      <button className="p-1 rounded hover:bg-surface-tertiary transition-colors">
                        <RotateCcw size={12} className="text-text-tertiary" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {isGenerating && (
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

      <div className="flex-shrink-0 bg-white border-t border-border-light">
        <div className="px-4 pt-2 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary rounded-full text-xs text-text-secondary hover:bg-surface-tertiary transition-colors whitespace-nowrap flex-shrink-0"
              >
                <action.icon size={13} className="text-text-tertiary" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 pb-3 flex items-end gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-tertiary transition-colors flex-shrink-0 mb-0.5">
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
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-tertiary transition-colors flex-shrink-0 mb-0.5">
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
      </div>
    </div>
  )
}
