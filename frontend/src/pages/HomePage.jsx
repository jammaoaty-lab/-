import React, { useState } from 'react';
import { Search, Bell, User, Sparkles, Play, Heart, Copy, Wand2, Palette, Layers, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import ToolsSection from '../components/ToolsSection';
import WorkCard from '../components/WorkCard';

// 模拟作品数据
const mockWorks = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `作品 ${i + 1}`,
  author: `创作者 ${i + 1}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  cover: `https://picsum.photos/seed/${i + 100}/400/225`,
  duration: `${Math.floor(Math.random() * 5) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  quality: ['720P', '1080P', '4K', '8K'][Math.floor(Math.random() * 4)],
  likes: Math.floor(Math.random() * 10000),
  isLongVideo: Math.random() > 0.7,
  category: ['漫剧', 'AI短剧', 'AI动漫', '影视片段'][Math.floor(Math.random() * 4)],
}));

// 分类标签
const categories = ['全部', '漫剧', 'AI短剧', 'AI动漫', '影视片段'];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('全部');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* 顶部导航 */}
      <Header />

      {/* 横幅轮播 */}
      <HeroBanner />

      {/* 核心工具展示区 */}
      <ToolsSection />

      {/* 作品展示区 - 6列网格 */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 标题和分类筛选 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              探索作品
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 6列网格布局 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mockWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>

          {/* 加载更多按钮 */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105">
              加载更多
            </button>
          </div>
        </div>
      </section>

      {/* 悬浮创作按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 z-50"
      >
        <Wand2 className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
}
