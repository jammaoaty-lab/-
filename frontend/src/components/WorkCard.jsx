import React, { useState } from 'react';
import { Play, Heart, Copy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkCard({ work }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/30 transition-all group-hover:shadow-xl group-hover:shadow-purple-500/10">
        {/* 封面区域 */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={work.cover}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* 悬停时的播放按钮 */}
          {isHovered && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </motion.div>
          )}

          {/* 右上角标签 */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-medium">
              {work.quality}
            </span>
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-medium">
              {work.duration}
            </span>
            {work.isLongVideo && (
              <span className="px-2 py-0.5 bg-purple-600 rounded text-xs font-medium">
                长片
              </span>
            )}
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-3">
          <h3 className="font-medium text-sm mb-2 truncate">{work.title}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={work.avatar}
                alt={work.author}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-slate-400 truncate max-w-[80px]">
                {work.author}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Heart className="w-3 h-3" />
                <span>{work.likes}</span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
