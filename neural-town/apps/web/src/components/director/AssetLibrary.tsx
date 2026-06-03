'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type AssetCategory = 'ai-generated' | 'characters' | 'scenes' | 'props' | 'music' | 'effects' | 'transitions';

interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  thumbnail: string; // gradient or emoji
  tags: string[];
  size?: string;
}

const CATEGORIES: { key: AssetCategory; label: string; icon: string }[] = [
  { key: 'ai-generated', label: 'AI 生成', icon: '✨' },
  { key: 'characters', label: '角色', icon: '🎭' },
  { key: 'scenes', label: '场景', icon: '🌌' },
  { key: 'props', label: '道具', icon: '🎒' },
  { key: 'music', label: '音乐', icon: '🎵' },
  { key: 'effects', label: '特效', icon: '💫' },
  { key: 'transitions', label: '转场', icon: '➡️' },
];

const DEMO_ASSETS: AssetItem[] = [
  { id: 'a1', name: '赛博朋克城市夜景', category: 'ai-generated', thumbnail: 'linear-gradient(135deg, #1a1a3e, #ff006e)', tags: ['城市', '夜晚', '霓虹'] },
  { id: 'a2', name: '浮空玻璃建筑群', category: 'ai-generated', thumbnail: 'linear-gradient(135deg, #0a1628, #00f5d4)', tags: ['建筑', '科幻', '透明'] },
  { id: 'a3', name: '星际港口全景', category: 'ai-generated', thumbnail: 'linear-gradient(135deg, #0d1b2a, #ffd166)', tags: ['太空', '港口', '宏大'] },
  { id: 'a4', name: '量子森林', category: 'ai-generated', thumbnail: 'linear-gradient(135deg, #1b0000, #00ff88)', tags: ['自然', '奇幻', '发光'] },
  { id: 'c1', name: '艾拉 (主角)', category: 'characters', thumbnail: '👩‍🚀', tags: ['女性', '宇航员', '主角'] },
  { id: 'c2', name: '诺瓦 (AI助手)', category: 'characters', thumbnail: '🤖', tags: ['AI', '机器人', '辅助'] },
  { id: 's1', name: '曙光号驾驶舱', category: 'scenes', thumbnail: 'linear-gradient(135deg, #2d1810, #5c3d2e)', tags: ['内景', '驾驶舱', '暖色'] },
  { id: 's2', name: '未知星域', category: 'scenes', thumbnail: 'linear-gradient(135deg, #0a0a1a, #6c5ce7)', tags: ['外景', '深空', '神秘'] },
  { id: 'm1', name: '星际序曲', category: 'music', thumbnail: '🎼', tags: ['管弦乐', '史诗', 'BGM'], size: '3:24' },
  { id: 'm2', name: '紧张脉冲', category: 'music', thumbnail: '🎹', tags: ['电子', '紧张', '音效'], size: '0:45' },
  { id: 'e1', name: '镜头光晕', category: 'effects', thumbnail: '✨', tags: ['光效', '后期', '叠加'] },
  { id: 'e2', name: '粒子爆发', category: 'effects', thumbnail: '💥', tags: ['粒子', '爆炸', '视觉'] },
  { id: 't1', name: '交叉溶解', category: 'transitions', thumbnail: '🌀', tags: ['溶解', '柔和', '经典'] },
  { id: 't2', name: '星尘擦除', category: 'transitions', thumbnail: '⭐', tags: ['粒子', '创意', '宇宙'] },
];

export default function AssetLibrary() {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('ai-generated');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = DEMO_ASSETS.filter(asset => {
    const matchCat = asset.category === activeCategory;
    const matchSearch = !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleAddToTimeline = (asset: AssetItem) => {
    toast.success(`"${asset.name}" 已添加到时间轴`, { icon: asset.thumbnail.startsWith('linear') ? '🖼️' : asset.thumbnail });
  };

  return (
    <div className="h-full flex flex-col bg-[#050812] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
        <span className="text-[11px] font-display tracking-wider text-white/50 uppercase">📦 素材库</span>
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索素材..."
          className="cosmic-input text-[10px] h-6 w-28"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 py-2 border-b border-white/[0.04] shrink-0 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-[#6C5CE7]/20 text-[#B388FF] border border-[#6C5CE7]/30'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Assets grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {filteredAssets.map(asset => (
            <motion.button
              key={asset.id}
              onClick={() => handleAddToTimeline(asset)}
              className="group relative rounded-lg overflow-hidden border border-white/[0.06] hover:border-[#6C5CE7]/40 transition-all text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Thumbnail */}
              <div
                className="aspect-video w-full flex items-center justify-center"
                style={
                  asset.thumbnail.startsWith('linear')
                    ? { background: asset.thumbnail }
                    : {}
                }
              >
                {!asset.thumbnail.startsWith('linear') && (
                  <span className="text-3xl">{asset.thumbnail}</span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] px-2 py-1 rounded bg-[#6C5CE7]/80 text-white">+ 添加到轨道</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-1.5">
                <p className="text-[10px] text-white/70 truncate font-medium">{asset.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {asset.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[8px] px-1 py-px rounded bg-white/[0.05] text-white/30">{tag}</span>
                  ))}
                  {asset.size && <span className="text-[8px] text-white/20 ml-auto">{asset.size}</span>}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-xs text-white/30">
            没有找到匹配的素材
          </div>
        )}
      </div>

      {/* Footer: AI generate button */}
      <div className="p-2 border-t border-white/[0.05] shrink-0">
        <button
          onClick={() => toast.loading('AI 正在生成新素材...', { id: 'gen-asset' })}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] bg-gradient-to-r from-[#FF9100]/20 to-[#E040FB]/20 border border-[#FF9100]/30 text-[#FFD166] hover:from-[#FF9100]/30 hover:to-[#E040FB]/30 transition-all"
        >
          ✨ AI 生成新素材
        </button>
      </div>
    </div>
  );
}
