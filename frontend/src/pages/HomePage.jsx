import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Wand2, 
  Play, 
  Heart, 
  Copy, 
  Clock, 
  Search, 
  Bell, 
  User,
  Layers,
  UserRound,
  Clapperboard,
  Zap,
  ChevronRight
} from 'lucide-react'
import Header from '../components/Header'
import WorkCard from '../components/WorkCard'

// 模拟作品数据
const mockWorks = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: ['古风仙侠', '现代都市', '科幻未来', '奇幻冒险', '校园爱情'][i % 5],
  author: ['创作工坊', '星辰画室', '漫动空间', '影像工厂', '灵感部落'][i % 5],
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`,
  cover: `https://picsum.photos/seed/${200 + i}/400/225`,
  duration: `${Math.floor(Math.random() * 5) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  quality: ['720P', '1080P', '4K', '8K'][i % 4],
  likes: Math.floor(Math.random() * 15000),
  isLongVideo: i % 7 === 0,
  category: ['漫剧', 'AI短剧', 'AI动漫', '影视片段'][i % 4],
}))

const categories = ['全部', '漫剧', 'AI短剧', 'AI动漫', '影视片段']

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('全部')

  return (
    <div className="min-h-screen bg-slate-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-600/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* 导航栏 */}
      <Header />

      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="pt-24 pb-16 lg:pt-32 lg:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧文案 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">AI 赋能 · 创意无限</span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance">
                    用 AI 创造
                    <br />
                    <span className="gradient-text">你的下一部作品</span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-lg text-balance">
                    从剧本到成片，一键生成漫剧、短剧、动漫。专业级创作工具，人人都能当导演。
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button className="btn-gradient text-white px-8 py-4 rounded-xl font-medium text-lg inline-flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    开始创作
                  </button>
                  <button className="px-8 py-4 rounded-xl font-medium text-lg inline-flex items-center gap-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 transition-all">
                    <Play className="w-5 h-5" />
                    观看案例
                  </button>
                </div>

                {/* 信任标志 */}
                <div className="pt-6 border-t border-slate-800/50">
                  <p className="text-sm text-slate-500 mb-4">已被 100,000+ 创作者选择</p>
                  <div className="flex flex-wrap gap-8 items-center opacity-50">
                    {['爱奇艺', '腾讯视频', 'B站', '抖音', '快手'].map((brand, i) => (
                      <span key={i} className="text-xl font-bold tracking-wider text-slate-400">{brand}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 右侧视频预览 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 group">
                  <img 
                    src="https://picsum.photos/seed/hero/1200/675" 
                    alt="AIDrama Preview" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* 播放按钮 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* 底部标签 */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-4">
                    <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-medium">4K</span>
                    <span className="text-white/80 text-sm">示例 · 古风仙侠漫剧</span>
                  </div>
                </div>

                {/* 装饰元素 */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-16 lg:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wand2, title: 'AI 编剧', desc: '一句话生成完整剧本' },
              { icon: UserRound, title: '角色捏脸', desc: '定制你的专属角色' },
              { icon: Layers, title: '无限画布', desc: '自由创作分镜画面' },
              { icon: Clapperboard, title: '导演工作台', desc: '运镜特效一键搞定' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="p-6 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 作品展示区 - 6列网格 */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* 标题和筛选 */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">探索作品</h2>
              <p className="text-slate-400">发现社区创作者的精彩内容</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 6列网格作品 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {mockWorks.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} />
            ))}
          </div>

          {/* 加载更多 */}
          <div className="mt-16 text-center">
            <button className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-xl font-medium hover:bg-slate-800 transition-all inline-flex items-center gap-2">
              查看更多作品
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 lg:py-32 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            准备好创作了吗？
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            加入 100,000+ 创作者，用 AI 释放你的创意潜能
          </p>
          <button className="btn-gradient text-white px-10 py-5 rounded-xl font-medium text-lg inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            免费开始
          </button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-12 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AIDrama</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 AIDrama. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
