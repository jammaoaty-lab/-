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
}

export default function LoginPage({ onBack, onGoRegister, onLogin }: Props) {
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
      <header className="flex-shrink-0 flex items-center px-4 h-12">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
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
            <span className="text-[11px] text-text-tertiary">其他方式</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-border-light bg-surface hover:bg-surface-secondary transition-colors text-sm text-text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-border-light bg-surface hover:bg-surface-secondary transition-colors text-sm text-text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
              </svg>
              Facebook
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
