import { motion } from 'framer-motion'
import {
  ChevronRight,
  Cpu,
  Flame,
  Database,
  Headphones,
  HardDrive,
  Download,
  Shield,
  Terminal,
  Cloud,
  Monitor,
  Crown,
  LogOut,
  LogIn,
  UserX,
} from 'lucide-react'
import type { Page } from '../App'

interface Props {
  onNavigate: (page: Page) => void
  onLogout: () => void
  isGuest: boolean
  onLogin: () => void
}

const menuSections = [
  {
    items: [
      { icon: Cpu, label: '模型中心', desc: '管理与切换模型', page: 'models' as Page },
      { icon: Flame, label: 'LoRA 训练', desc: '自定义微调', page: 'lora' as Page },
      { icon: Database, label: '知识库', desc: '文档与检索', page: 'knowledge' as Page },
      { icon: Headphones, label: '语音助手', desc: '语音交互设置', page: null },
    ],
  },
  {
    items: [
      { icon: HardDrive, label: '缓存管理', desc: '已用 2.4 GB', page: null },
      { icon: Download, label: '下载管理', desc: '1 个任务进行中', page: null },
      { icon: Shield, label: '隐私与安全', desc: '数据保护设置', page: null },
      { icon: Terminal, label: '开发者模式', desc: '高级选项', page: null },
    ],
  },
]

export default function ProfilePage({ onNavigate, onLogout, isGuest, onLogin }: Props) {
  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-white border-b border-border-light">
        <h1 className="text-base font-semibold text-text-primary">我的</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4">
          {isGuest ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                  <UserX size={24} className="text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-base font-semibold text-text-primary">游客用户</span>
                  <p className="text-xs text-text-tertiary mt-0.5">登录后可解锁更多功能</p>
                </div>
                <button
                  onClick={onLogin}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <LogIn size={14} />
                  登录
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xl">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-text-primary">User</span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-medium rounded-full flex items-center gap-0.5">
                      <Crown size={9} /> Pro
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-tertiary">UID: 100248</span>
                    <div className="flex items-center gap-1">
                      <Monitor size={11} className="text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">2 设备</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-tertiary" />
              </div>
            </motion.div>
          )}

          {!isGuest && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="bg-white rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">会员状态</span>
                <span className="text-xs text-primary font-medium">续费</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="text-lg font-semibold text-text-primary">Pro</div>
                  <div className="text-[11px] text-text-tertiary">当前等级</div>
                </div>
                <div className="w-px h-8 bg-border-light" />
                <div className="flex-1 text-center">
                  <div className="text-lg font-semibold text-text-primary">∞</div>
                  <div className="text-[11px] text-text-tertiary">对话额度</div>
                </div>
                <div className="w-px h-8 bg-border-light" />
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Cloud size={14} className="text-success" />
                    <span className="text-lg font-semibold text-text-primary">ON</span>
                  </div>
                  <div className="text-[11px] text-text-tertiary">云同步</div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-3 pb-6">
            {menuSections.map((section, sIdx) => (
              <motion.div
                key={sIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + sIdx * 0.05, duration: 0.25 }}
                className="bg-white rounded-xl overflow-hidden"
              >
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={iIdx}
                      onClick={() => item.page && onNavigate(item.page)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-text-primary block">{item.label}</span>
                        <span className="text-[11px] text-text-tertiary">{item.desc}</span>
                      </div>
                      <ChevronRight size={16} className="text-text-tertiary" />
                    </button>
                  )
                })}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25 }}
              className="bg-white rounded-xl overflow-hidden"
            >
              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-text-secondary" />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-text-primary block">设置中心</span>
                  <span className="text-[11px] text-text-tertiary">账号、推理、隐私</span>
                </div>
                <ChevronRight size={16} className="text-text-tertiary" />
              </button>
            </motion.div>

            <div className="text-center pt-2 pb-4">
              <span className="text-[11px] text-text-tertiary">OmniAI Assistant v2.5.0</span>
            </div>

            {isGuest ? (
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <LogIn size={16} />
                登录账号
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white rounded-xl text-sm text-danger font-medium hover:bg-danger-light transition-colors"
              >
                <LogOut size={16} />
                退出登录
              </button>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
