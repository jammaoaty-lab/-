import { motion } from 'framer-motion'
import {
  MessageSquare,
  Bot,
  BookOpen,
  Cpu,
  User,
} from 'lucide-react'
import type { Page } from '../App'

const tabs: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: '聊天', icon: MessageSquare },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'models', label: '模型', icon: Cpu },
  { id: 'profile', label: '我的', icon: User },
]

interface Props {
  current: Page
  onNavigate: (page: Page) => void
}

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-border-light px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = current === tab.id || (tab.id === 'profile' && (current === 'settings'))
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-text-tertiary'
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-text-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
