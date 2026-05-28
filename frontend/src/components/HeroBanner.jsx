import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="relative bg-gradient-to-br from-purple-900/50 via-slate-900 to-pink-900/50 rounded-2xl overflow-hidden border border-purple-500/20">
          {/* 背景装饰 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
            {/* 左侧内容 */}
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm">
                  <Sparkles className="w-4 h-4" />
                  全新升级 · AI长视频功能上线
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  一键生成
                </span>
                <br />
                属于你的精彩漫剧
              </motion.h1>

              <motion.p
                className="text-slate-400 text-lg max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                支持AI编剧、角色捏脸、无限画布、导演运镜，从创意到成片，一站式完成你的漫剧创作。
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  立即创作
                </button>
                <button className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl font-medium hover:bg-slate-700 transition-all">
                  查看案例
                </button>
              </motion.div>
            </div>

            {/* 右侧视频预览 */}
            <motion.div
              className="flex-1 w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/10">
                <img
                  src="https://picsum.photos/seed/drama/800/450"
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-sm text-white/80">示例 · 古风漫剧</span>
                  <span className="px-2 py-1 bg-purple-600 rounded text-xs font-medium">4K</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
