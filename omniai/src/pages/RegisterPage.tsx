import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  Check,
} from 'lucide-react'

interface Props {
  onBack: () => void
  onGoLogin: () => void
  onRegister: () => void
}

export default function RegisterPage({ onBack, onGoLogin, onRegister }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = passwordStrength()
  const strengthLabels = ['', '弱', '一般', '较强', '强']
  const strengthColors = ['', 'bg-danger', 'bg-warning', 'bg-emerald-400', 'bg-success']

  const isValid = name.trim() && email.trim() && password.length >= 8 && agreeTerms

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onRegister()
    }, 1500)
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

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-center px-8 pb-12">
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
            <h1 className="text-2xl font-semibold text-text-primary mt-6 mb-1">创建账号</h1>
            <p className="text-sm text-text-secondary mb-8">开始你的 AI 之旅</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">昵称</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="你的昵称"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-secondary border border-border-light text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

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
                    placeholder="至少 8 位字符"
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
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength ? strengthColors[strength] : 'bg-surface-tertiary'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] mt-1 block ${
                      strength <= 1 ? 'text-danger' : strength === 2 ? 'text-warning' : 'text-success'
                    }`}>
                      密码强度：{strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-start gap-2.5 text-left"
              >
                <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  agreeTerms ? 'bg-primary' : 'border border-border'
                }`}>
                  {agreeTerms && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-text-secondary leading-relaxed">
                  我已阅读并同意{' '}
                  <span className="text-primary">服务条款</span>
                  {' '}和{' '}
                  <span className="text-primary">隐私政策</span>
                </span>
              </button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                type="submit"
                disabled={!isValid || loading}
                className={`w-full h-11 rounded-xl text-sm font-medium transition-colors ${
                  isValid && !loading
                    ? 'bg-primary text-white'
                    : 'bg-surface-tertiary text-text-tertiary'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    注册中...
                  </div>
                ) : (
                  '注册'
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
              已有账号？{' '}
              <button onClick={onGoLogin} className="text-primary font-medium">
                登录
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
