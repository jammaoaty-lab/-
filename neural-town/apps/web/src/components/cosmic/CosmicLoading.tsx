'use client';
/**
 * @file CosmicLoading - 星环旋转 + 脉冲星加载动画
 */

import { motion } from 'framer-motion';

interface CosmicLoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function CosmicLoading({ text = '曲速跃迁中...', fullScreen = false }: CosmicLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* 旋转星环 */}
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-nebulae-purple/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-ai-blue"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-warning-gold/30"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 中心脉冲星 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 bg-nebulae-purple rounded-full"
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* 文字 */}
      <motion.p
        className="text-sm text-white/50 font-mono"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-space-deep flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}