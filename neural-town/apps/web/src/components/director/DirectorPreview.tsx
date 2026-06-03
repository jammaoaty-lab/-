'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectorStore, type StoryboardShot } from '@/stores/director-store';
import toast from 'react-hot-toast';

const CAMERA_PRESETS = [
  { key: 'wide', label: '远景 Wide', icon: '🌍' },
  { key: 'medium', label: '中景 Medium', icon: '👤' },
  { key: 'close-up', label: '特写 Close-up', icon: '🔍' },
  { key: 'tracking', label: '跟拍 Tracking', icon: '🎥' },
  { key: 'overhead', label: '俯拍 Overhead', icon: '⬇️' },
  { key: 'low-angle', label: '仰拍 Low Angle', icon: '⬆️' },
];

const LIGHTING_PRESETS = [
  { key: 'deep_space', label: '深空', color: '#1a1a3e' },
  { key: 'cockpit_warm', label: '驾驶舱暖光', color: '#3e2723' },
  { key: 'alert_red', label: '警报红', color: '#3e1111' },
  { key: 'heroic_gold', label: '英雄金光', color: '#3e3010' },
  { key: 'starry_dawn', label: '星辰黎明', color: '#1a2030' },
  { key: 'neon_cyber', label: '赛博霓虹', color: '#101828' },
];

export default function DirectorPreview() {
  const {
    shots, selectedShotId, selectShot, viewMode, currentTime,
    characters, activeCharacterId, emotionPoints,
  } = useDirectorStore();

  const selectedShot = shots.find(s => s.id === selectedShotId);
  const activeChar = characters.find(c => c.id === activeCharacterId);

  // Find current shot by time
  const currentShot = shots.find(s => currentTime >= s.startTime && currentTime < s.startTime + s.duration);

  return (
    <div className="h-full flex flex-col bg-[#050812] overflow-hidden">
      {/* Preview Window */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Safe frame overlay */}
        <div className="relative w-[90%] h-[80%] max-w-[720px] max-h-[405px] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
          {/* Preview content */}
          <div className="w-full h-full bg-gradient-to-br from-[#0a0e1a] via-[#12182e] to-[#0a0e1a] flex items-center justify-center relative">
            {/* Scene visualization */}
            {viewMode === 'galaxy' ? (
              /* Galaxy mode: show floating planets */
              <div className="relative w-full h-full">
                {shots.map((shot, i) => {
                  const isActive = shot.id === selectedShotId;
                  const size = 32 + shot.emotionIntensity * 28;
                  const angle = (i / shots.length) * Math.PI * 2 - Math.PI / 2;
                  const cx = 50 + Math.cos(angle) * 30;
                  const cy = 50 + Math.sin(angle) * 30;

                  return (
                    <motion.button
                      key={shot.id}
                      onClick={() => selectShot(shot.id)}
                      className={`absolute rounded-full flex items-center justify-center cursor-pointer transition-shadow ${
                        isActive ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        width: `${size}%`,
                        height: `${size}%`,
                        left: `${cx - size/2}%`,
                        top: `${cy - size/2}%`,
                        background: `radial-gradient(circle at 35% 35%, ${
                          shot.primaryEmotion === 'joy' ? '#FFD16640' :
                          shot.primaryEmotion === 'sadness' ? '#6C5CE740' :
                          shot.primaryEmotion === 'anger' ? '#FF6B6B40' :
                          shot.primaryEmotion === 'fear' ? '#00F2A940' :
                          shot.primaryEmotion === 'hopeful' ? '#00E5FF40' :
                          '#B388FF40'
                        }, transparent)`,
                        boxShadow: isActive
                          ? `0 0 30px ${shot.primaryEmotion === 'joy' ? '#FFD166' : shot.primaryEmotion === 'sadness' ? '#6C5CE7' : '#B388FF'}60`
                          : '0 0 10px rgba(255,255,255,0.05)',
                        border: isActive ? '2px solid rgba(179,136,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-center">
                        <div className="text-lg md:text-2xl">
                          {shot.index + 1}
                        </div>
                        <div className="text-[8px] md:text-[10px] text-white/60 mt-0.5 max-w-[60px] truncate px-1">
                          {shot.title}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Emotion curve overlay on galaxy */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <polyline
                    points={emotionPoints.map(p => {
                      const angle = (p.time / 20) * Math.PI * 2 - Math.PI / 2;
                      const r = 42 + p.intensity * 15;
                      return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#emotionGradient)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                  <defs>
                    <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6C5CE7" />
                      <stop offset="50%" stopColor="#FF6B6B" />
                      <stop offset="100%" stopColor="#00F2A9" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              /* Editor mode: preview frame */
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {/* Safe frame guides */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[7.5%] left-0 right-0 h-px bg-white/10" />
                  <div className="absolute bottom-[7.5%] left-0 right-0 h-px bg-white/10" />
                  <div className="absolute left-[7.5%] top-0 bottom-0 w-px bg-white/10" />
                  <div className="absolute right-[7.5%] top-0 bottom-0 w-px bg-white/10" />
                </div>

                {currentShot ? (
                  <div className="text-center">
                    <motion.div
                      key={currentShot.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-3"
                    >
                      <span className="text-4xl block mb-2">
                        {currentShot.primaryEmotion === 'joy' ? '😊' :
                         currentShot.primaryEmotion === 'sadness' ? '😢' :
                         currentShot.primaryEmotion === 'anger' ? '😠' :
                         currentShot.primaryEmotion === 'fear' ? '😨' :
                         currentShot.primaryEmotion === 'hopeful' ? '🌟' :
                         currentShot.primaryEmotion === 'tense' ? '⚡' :
                         currentShot.primaryEmotion === 'determined' ? '💪' :
                         currentShot.primaryEmotion === 'bittersweet' ? '🌅' : '🎬'}
                      </span>
                      <p className="text-sm text-white/70 font-display">{currentShot.title}</p>
                      <p className="text-xs text-white/40 mt-1 max-w-md">{currentShot.description}</p>

                      {/* Character in scene */}
                      {currentShot.characterIds.includes(activeCharacterId || '') && activeChar && (
                        <motion.div
                          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="text-xl">{activeChar.avatarEmoji}</span>
                          <span className="text-xs text-white/60">{activeChar.name}</span>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Shot metadata */}
                    <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-white/30">
                      <span>#{currentShot.index + 1}</span>
                      <span>|</span>
                      <span>{CAMERA_PRESETS.find(c => c.key === currentShot.cameraAngle)?.label || currentShot.cameraAngle}</span>
                      <span>|</span>
                      <span>情感: {Math.round(currentShot.emotionIntensity * 100)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white/30">
                    <span className="text-4xl block mb-2">🎬</span>
                    <p className="text-sm">预览窗口</p>
                    <p className="text-xs mt-1">选择时间轴片段查看预览</p>
                  </div>
                )}

                {/* Timecode overlay */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/50">
                  REC ● {String(Math.floor(currentTime / 60)).padStart(2,'0')}:{String(Math.floor(currentTime % 60)).padStart(2,'0')}:{String(Math.floor(((currentTime % 1) * 30))).padStart(2,'0')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Panel (when shot selected) */}
      <AnimatePresence>
        {selectedShot && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] overflow-hidden"
          >
            <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Shot info */}
              <div className="col-span-2">
                <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                  分镜 #{selectedShot.index + 1} — {selectedShot.title}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-2">{selectedShot.description}</p>
              </div>

              {/* Camera angle */}
              <div>
                <p className="text-[9px] text-white/30 mb-1">机位角度</p>
                <div className="flex flex-wrap gap-0.5">
                  {CAMERA_PRESETS.slice(0, 4).map(cam => (
                    <button
                      key={cam.key}
                      onClick={() => toast.success(`切换到 ${cam.label}`)}
                      className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                        selectedShot.cameraAngle === cam.key
                          ? 'bg-[#6C5CE7]/20 text-[#B388FF]'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {cam.icon} {cam.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting preset */}
              <div>
                <p className="text-[9px] text-white/30 mb-1">灯光预设</p>
                <div className="flex flex-wrap gap-0.5">
                  {LIGHTING_PRESETS.slice(0, 3).map(light => (
                    <button
                      key={light.key}
                      onClick={() => toast.success(`应用灯光: ${light.label}`)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: light.color }} />
                      {light.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & emotion */}
              <div>
                <p className="text-[9px] text-white/30 mb-1">时长: {selectedShot.duration.toFixed(1)}s</p>
                <p className="text-[9px] text-white/30 mb-1">情感强度: {Math.round(selectedShot.emotionIntensity * 100)}%</p>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={selectedShot.emotionIntensity}
                  className="w-full h-1 accent-[#FF6B6B]"
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-end gap-1">
                <button onClick={() => toast.success('已复制到剪贴板')} className="px-2 py-1 rounded text-[9px] bg-white/5 text-white/40 hover:text-white/60">复制</button>
                <button onClick={() => toast.success('AI 正在重新生成此镜头...')} className="px-2 py-1 rounded text-[9px] bg-[#6C5CE7]/10 text-[#B388FF] hover:bg-[#6C5CE7]/20">AI 重做</button>
                <button onClick={() => selectShot(null)} className="px-2 py-1 rounded text-[9px] bg-white/5 text-white/40 hover:text-danger-red">关闭</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
