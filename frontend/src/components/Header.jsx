import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Search, Bell, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AIDrama</span>
          </motion.div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center gap-8">
            {['首页', '作品广场', '模型训练', '算力中心'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                href="#"
                className="text-slate-300 hover:text-white transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* 右侧操作区 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
            
            <div className="h-8 w-px bg-slate-800 mx-2" />

            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              开始创作
            </button>
            <button className="p-1.5 bg-slate-800 rounded-full border border-slate-700">
              <User className="w-6 h-6 text-slate-400" />
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
