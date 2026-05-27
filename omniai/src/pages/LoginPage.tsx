import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react'

interface Props {
  onBack: () => void
  onGoRegister: () => void
  onLogin: () => void
  onSkip: () => void
}

export default function LoginPage({ onBack, onGoRegister, onLogin, onSkip }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1200)
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-12">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-text-tertiary font-medium hover:text-text-secondary transition-colors"
        >
          跳过
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-text-primary">OmniAI</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mt-6 mb-1">欢迎回来</h1>
          <p className="text-sm text-text-secondary mb-8">登录你的 OmniAI 账号</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">邮箱</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-secondary border border-border-light text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-surface-secondary border border-border-light text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-text-tertiary" />
                  ) : (
                    <Eye size={16} className="text-text-tertiary" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-xs text-primary font-medium">
                忘记密码？
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              type="submit"
              disabled={!email.trim() || !password.trim() || loading}
              className={`w-full h-11 rounded-xl text-sm font-medium transition-colors ${
                email.trim() && password.trim() && !loading
                  ? 'bg-primary text-white'
                  : 'bg-surface-tertiary text-text-tertiary'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-[11px] text-text-tertiary">其他方式登录</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-5">
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-[#12B7F5]/10 flex items-center justify-center group-hover:bg-[#12B7F5]/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="#12B7F5"/>
                </svg>
              </div>
              <span className="text-[10px] text-text-tertiary">QQ</span>
            </button>

            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-[#07C160]/10 flex items-center justify-center group-hover:bg-[#07C160]/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.68 4.025c-3.837 0-6.953 2.708-6.953 6.048 0 3.342 3.116 6.048 6.953 6.048.726 0 1.43-.108 2.09-.298a.724.724 0 01.582.08l1.46.854a.262.262 0 00.136.044c.13 0 .235-.108.235-.24 0-.06-.023-.117-.039-.174l-.3-1.133a.474.474 0 01.173-.54C21.822 19.896 24 18.18 24 16.064c0-3.34-3.116-6.048-6.953-6.048h-1.769zm-2.536 2.89c.522 0 .945.43.945.96a.953.953 0 01-.945.958.953.953 0 01-.945-.959c0-.53.423-.959.945-.959zm4.726 0c.522 0 .945.43.945.96a.953.953 0 01-.945.958.953.953 0 01-.945-.959c0-.53.423-.959.945-.959z" fill="#07C160"/>
                </svg>
              </div>
              <span className="text-[10px] text-text-tertiary">微信</span>
            </button>

            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-[#161823]/10 flex items-center justify-center group-hover:bg-[#161823]/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#161823"/>
                </svg>
              </div>
              <span className="text-[10px] text-text-tertiary">抖音</span>
            </button>

            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-11 h-11 rounded-full bg-[#4285F4]/10 flex items-center justify-center group-hover:bg-[#4285F4]/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span className="text-[10px] text-text-tertiary">Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-text-secondary mt-8">
            还没有账号？{' '}
            <button onClick={onGoRegister} className="text-primary font-medium">
              注册
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
