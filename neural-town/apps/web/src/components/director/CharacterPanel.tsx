'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDirectorStore, type Character } from '@/stores/director-store';
import toast from 'react-hot-toast';

const EMOTION_COLORS: Record<string, { emoji: string; color: string }> = {
  joy: { emoji: '😊', color: '#FFD166' },
  sadness: { emoji: '😢', color: '#6C5CE7' },
  anger: { emoji: '😠', color: '#FF6B6B' },
  fear: { emoji: '😨', color: '#00F2A9' },
  surprise: { emoji: '😲', color: '#00E5FF' },
};

const PERSONALITY_LABELS: Record<string, { label: string; icon: string; left: string; right: string }> = {
  optimism: { label: '乐观度', icon: '☀️', left: '悲观', right: '乐观' },
  gentleness: { label: '温柔度', icon: '🌸', left: '暴躁', right: '温柔' },
  energy: { label: '能量值', icon: '⚡', left: '沉静', right: '活跃' },
};

// Simple SVG-based emotion wheel component
function EmotionWheel({ emotions, onEmotionChange }: {
  emotions: Character['emotion'];
  onEmotionChange: (key: string, value: number) => void;
}) {
  const emotionsArr = Object.entries(emotions) as [string, number][];
  const centerX = 70;
  const centerY = 70;
  const radius = 55;

  // Calculate position on wheel for each emotion
  const positions = emotionsArr.map(([key], i) => {
    const angle = (i / emotionsArr.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative w-[140px] h-[140px] mx-auto my-3">
      <svg viewBox="0 0 140 140" className="w-full h-full">
        {/* Background circle */}
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#1A1F35" strokeWidth="1.5" />
        
        {/* Emotion dots and labels */}
        {emotionsArr.map(([key, value], i) => {
          const pos = positions[i];
          const info = EMOTION_COLORS[key] || { emoji: '•', color: '#888' };
          const dotRadius = 6 + value * 8; // size based on intensity
          
          return (
            <g key={key}>
              {/* Connection line to center */}
              <line
                x1={centerX} y1={centerY}
                x2={pos.x} y2={pos.y}
                stroke={`${info.color}30`}
                strokeWidth={value * 3}
              />
              {/* Dot */}
              <circle cx={pos.x} cy={pos.y} r={dotRadius} fill={info.color} opacity={0.6 + value * 0.4} className="cursor-pointer hover:opacity-100 transition-opacity" />
              {/* Emoji label */}
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="14" dominantBaseline="middle">{info.emoji}</text>
              {/* Value text */}
              <text x={pos.x} y={pos.y + 18} textAnchor="middle" fontSize="8" fill="#888">{Math.round(value * 100)}%</text>
            </g>
          );
        })}
        
        {/* Center indicator */}
        <circle cx={centerX} cy={centerY} r={12} fill="#0D1020" stroke="#6C5CE7" strokeWidth="1" />
        <text x={centerX} y={centerY + 4} textAnchor="middle" fontSize="10" fill="#B388FF">🧠</text>
      </svg>
    </div>
  );
}

export default function CharacterPanel() {
  const {
    characters, activeCharacterId, shots, selectedShotId,
    setActiveCharacter, updateCharacterPersonality, updateCharacterEmotion, saveSnapshot,
  } = useDirectorStore();

  const activeChar = characters.find(c => c.id === activeCharacterId);

  const handleSaveSnapshot = () => {
    if (!activeCharacterId) return;
    saveSnapshot(activeCharacterId, `快照 #${(activeChar?.snapshots.length || 0) + 1}`);
    toast.success('表演快照已保存');
  };

  const handleAIReadMind = () => {
    toast.loading('AI 分析台词中...', { id: 'read-mind' });
    setTimeout(() => {
      toast.success('口型与微表情已自动生成', { id: 'read-mind' });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#050812] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
        <span className="text-[11px] font-display tracking-wider text-white/50 uppercase">🎭 角色面板</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Character selector */}
        <div className="space-y-1.5">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setActiveCharacter(char.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                activeCharacterId === char.id
                  ? 'bg-[#6C5CE7]/15 border border-[#6C5CE7]/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-lg">{char.avatarEmoji}</span>
              <span className="text-white/80 flex-1 text-left truncate">{char.name}</span>
              {activeCharacterId === char.id && <span className="text-[8px] text-[#6C5CE7]">ACTIVE</span>}
            </button>
          ))}
        </div>

        {!activeChar && (
          <div className="text-center py-6 text-xs text-white/30">
            选择一个角色开始编辑
          </div>
        )}

        {activeChar && (
          <>
            {/* Avatar Preview */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-[#0D1020] to-[#0A0E1A] border border-white/[0.05]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C5CE7]/20 to-[#00E5FF]/20 border-2 border-[#6C5CE7]/30 flex items-center justify-center mb-2 relative group cursor-grab">
                <motion.span
                  className="text-4xl"
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  {activeChar.avatarEmoji}
                </motion.span>
                {/* Rotation hint */}
                <div className="absolute inset-0 rounded-full border border-dashed border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -bottom-1 text-[8px] text-white/20 group-hover:text-white/40 transition-colors">拖拽旋转</span>
              </div>
              <p className="text-sm font-display text-white/80">{activeChar.name}</p>
              <p className="text-[10px] text-white/30">当前镜头: #{shots.find(s => s.selected)?.index ?? '?'}</p>
            </div>

            {/* Personality Sliders */}
            <div>
              <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">性格参数</h4>
              {(Object.entries(PERSONALITY_LABELS) as [keyof typeof PERSONALITY_LABELS, typeof PERSONALITY_LABELS[string]][]).map(([key, config]) => (
                <div key={key} className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-white/50">
                      {config.icon} {config.label}
                    </span>
                    <span className="text-[9px] text-white/30">
                      {config.left} · {Math.round(activeChar.personality[key as keyof typeof activeChar.personality] * 100)}% · {config.right}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={activeChar.personality[key as keyof typeof activeChar.personality]}
                    onChange={(e) => updateCharacterPersonality(activeChar.id, key as keyof typeof activeChar.personality, Number(e.target.value))}
                    className="w-full h-1 appearance-none rounded-full bg-[#1A1F35] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6C5CE7] [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(108,92,231,0.4)]"
                  />
                </div>
              ))}
            </div>

            {/* Emotion Wheel */}
            <div>
              <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">情感色轮</h4>
              <EmotionWheel
                emotions={activeChar.emotion}
                onEmotionChange={(k, v) => updateCharacterEmotion(activeChar.id, k as any, v)}
              />
              
              {/* Individual emotion sliders */}
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {(Object.entries(EMOTION_COLORS) as [string, typeof EMOTION_COLORS[string]][]).map(([key, info]) => (
                  <div key={key} className="flex items-center gap-1 px-1.5 py-1 rounded bg-white/[0.02]">
                    <span className="text-[10px]">{info.emoji}</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={activeChar.emotion[key as keyof typeof activeChar.emotion]}
                      onChange={(e) => updateCharacterEmotion(activeChar.id, key as keyof typeof activeChar.emotion, Number(e.target.value))}
                      className="flex-1 h-1 appearance-none rounded-full bg-[#1A1F35] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full"
                      style={{ accentColor: info.color }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Micro-expression editor placeholder */}
            <div>
              <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">微表情曲线</h4>
              <div className="h-16 rounded-lg border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center">
                <p className="text-[9px] text-white/20">20+ 面部关键帧控制区</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
              <button
                onClick={handleAIReadMind}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors"
              >
                🎤 AI 读心 (念台词生成口型)
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#FFD166] hover:bg-[#FFD166]/20 transition-colors"
              >
                📸 保存表演快照
              </button>
              
              {/* Snapshots list */}
              {activeChar.snapshots.length > 0 && (
                <div className="mt-2">
                  <p className="text-[9px] text-white/30 mb-1">已保存快照:</p>
                  {activeChar.snapshots.map(snap => (
                    <div key={snap.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.02] text-[10px] text-white/40">
                      <span>📸</span>
                      <span>{snap.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
