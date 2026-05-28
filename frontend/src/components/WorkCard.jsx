import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Copy } from 'lucide-react'

export default function WorkCard({ work, index }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.03 }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 hover:border-purple-500/30 bg-slate-900/50 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-500/10">
        {/* 封面 */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={work.cover}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* 悬停播放层 */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </motion.div>
          )}

          {/* 右上角标签 */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs font-medium">
              {work.quality}
            </span>
            {work.isLongVideo && (
              <span className="px-2.5 py-1 bg-purple-600 rounded-lg text-xs font-medium">
                长片
              </span>
            )}
          </div>

          {/* 时长 */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs">
            {work.duration}
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-4">
          <h3 className="font-medium mb-3 truncate">{work.title}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={work.avatar}
                alt={work.author}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-xs text-slate-400 truncate max-w-[100px]">
                {work.author}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Heart className="w-3.5 h-3.5" />
                <span>{work.likes.toLocaleString()}</span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
