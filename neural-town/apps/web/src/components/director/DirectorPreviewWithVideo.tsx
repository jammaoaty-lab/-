'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectorStore, type StoryboardShot } from '@/stores/director-store';
import toast from 'react-hot-toast';

// We'll lazy-load video.js since it's only needed in preview mode
// For now, we'll use a mock player UI that looks like video.js
// In production, you'd do: import videojs from 'video.js'

const CAMERA_PRESETS = [
  { key: 'wide', label: '远景 Wide', icon: '🌍' },
  { key: 'medium', label: '中景 Medium', icon: '👤' },
  { key: 'close-up', label: '特写 Close-up', icon: '🔍' },
  { key: 'tracking', label: '跟拍 Tracking', icon: '🎥' },
];

const LIGHTING_PRESETS = [
  { key: 'deep_space', label: '深空', color: '#1a1a3e' },
  { key: 'cockpit_warm', label: '驾驶舱暖光', color: '#3e2723' },
  { key: 'alert_red', label: '警报红', color: '#3e1111' },
  { key: 'heroic_gold', label: '英雄金光', color: '#3e3010' },
  { key: 'starry_dawn', label: '星辰黎明', color: '#1a2030' },
];

// Mock video sources for demo
const DEMO_VIDEO_SOURCES = [
  { id: 'shot-1', title: '开场：深空', duration: 3, thumbnailColor: '#1a1a3e' },
  { id: 'shot-2', title: '主角登场', duration: 4, thumbnailColor: '#2d1810' },
  { id: 'shot-3', title: '冲突升级', duration: 5, thumbnailColor: '#3e1111' },
  { id: 'shot-4', title: '情感高潮', duration: 4, thumbnailColor: '#3e3010' },
  { id: 'shot-5', title: '结局落幕', duration: 4, thumbnailColor: '#1a2030' },
];

function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 30);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`;
}

export default function DirectorPreviewWithVideo() {
  const {
    shots, selectedShotId, selectShot, viewMode, currentTime,
    characters, activeCharacterId, emotionPoints, playState, pause, play,
  } = useDirectorStore();

  const selectedShot = shots.find(s => s.id === selectedShotId);
  const activeChar = characters.find(c => c.id === activeCharacterId);
  const currentShot = shots.find(s => currentTime >= s.startTime && currentTime < s.startTime + s.duration);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video.js-style mock player controls
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  // Emotion emoji mapping
  const emotionEmoji: Record<string, string> = {
    joy: '😊', sadness: '😢', anger: '😠', fear: '😨',
    surprise: '😲', hopeful: '🌟', tense: '⚡', determined: '💪',
    bittersweet: '🌅', calm: '😌', peaceful: '🕊️', triumphant: '🏆',
    wonder: '✨', reflective: '💭',
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      {/* Main Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {viewMode === 'galaxy' ? (
          /* ═══ Galaxy Mode: 3D Narrative View ═══ */
          <div className="relative w-full h-full">
            {/* Starfield background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#05081a] via-[#0a1025] to-[#080c18]" />

            {/* Floating shot planets */}
            {shots.map((shot, i) => {
              const isActive = shot.id === selectedShotId;
              const size = 36 + shot.emotionIntensity * 32;
              const angle = (i / shots.length) * Math.PI * 2 - Math.PI / 2;
              const cx = 48 + Math.cos(angle) * 28;
              const cy = 48 + Math.sin(angle) * 28;

              return (
                <motion.button
                  key={shot.id}
                  onClick={() => selectShot(shot.id)}
                  className={`absolute rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isActive ? 'z-10' : 'z-0'
                  }`}
                  style={{
                    width: `${size}%`,
                    height: `${size}%`,
                    left: `${cx - size/2}%`,
                    top: `${cy - size/2}%`,
                    background: `radial-gradient(circle at 33% 33%, ${
                      shot.primaryEmotion.includes('joy') || shot.primaryEmotion === 'hopeful' ? '#FFD16630' :
                      shot.primaryEmotion.includes('sad') || shot.primaryEmotion === 'bittersweet' ? '#6C5CE730' :
                      shot.primaryEmotion.includes('anger') || shot.primaryEmotion === 'tense' ? '#FF6B6B30' :
                      shot.primaryEmotion.includes('fear') ? '#00F2A930' :
                      '#B388FF30'
                    }, transparent)`,
                    boxShadow: isActive
                      ? `0 0 40px ${shot.primaryEmotion.includes('joy') ? '#FFD166' : '#B388FF'}80, inset 0 0 20px rgba(255,255,255,0.05)`
                      : '0 0 15px rgba(255,255,255,0.03)',
                    border: isActive ? '2px solid rgba(179,136,255,0.7)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-base md:text-2xl font-display font-bold text-white/80">{shot.index + 1}</span>
                  <span className="text-[8px] md:text-[10px] text-white/50 mt-0.5 max-w-[70%] truncate px-1">{shot.title}</span>
                  
                  {/* Emotion badge */}
                  <span className="absolute -bottom-1 text-[10px]">
                    {emotionEmoji[shot.primaryEmotion] || '🎬'}
                  </span>
                </motion.button>
              );
            })}

            {/* Emotion curve overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="previewEmoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.6" />
                  <stop offset="40%" stopColor="#FF6B6B" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#FFD166" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00F2A9" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <polyline
                points={emotionPoints.map(p => {
                  const angle = (p.time / 20) * Math.PI * 2 - Math.PI / 2;
                  const r = 44 + p.intensity * 12;
                  return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="none"
                stroke="url(#previewEmoGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
              {emotionPoints.map((p, i) => {
                const angle = (p.time / 20) * Math.PI * 2 - Math.PI / 2;
                const r = 44 + p.intensity * 12;
                return (
                  <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r="1.5" fill={p.intensity > 0.7 ? '#FF6B6B' : p.intensity > 0.4 ? '#FFD166' : '#6C5CE7'} opacity="0.8" />
                );
              })}
            </svg>

            {/* Center info */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-white/20 tracking-widest uppercase">Narrative Galaxy View</p>
              <p className="text-[8px] text-white/10 mt-0.5">双击星球进入场景编辑</p>
            </div>
          </div>
        ) : (
          /* ═══ Editor Mode: Video Player Preview ═══ */
          <div className="w-full h-full flex flex-col">
            {/* Video display area */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
              {/* Safe frame guides */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-[7.5%] left-0 right-0 h-px bg-white/10" />
                <div className="absolute bottom-[7.5%] left-0 right-0 h-px bg-white/10" />
                <div className="absolute left-[7.5%] top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute right-[7.5%] top-0 bottom-0 w-px bg-white/10" />
                
                {/* Corner marks */}
                {['tl','tr','bl','br'].map(corner => {
                  const isLeft = corner.includes('l');
                  const isTop = corner.includes('t');
                  return (
                    <div key={corner} className={`absolute w-6 h-6 ${isLeft ? 'left-[7.5%]' : 'right-[7.5%]'} ${isTop ? 'top-[7.5%]' : 'bottom-[7.5%]'}`}>
                      <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} ${isTop ? 'top-0' : 'bottom-0'} w-4 h-px bg-white/30`} />
                      <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} ${isTop ? 'top-0' : 'bottom-0'} h-4 w-px bg-white/30`} />
                    </div>
                  );
                })}
              </div>

              {/* Shot content */}
              <AnimatePresence mode="wait">
                {currentShot ? (
                  <motion.div
                    key={currentShot.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="text-center max-w-lg px-6"
                  >
                    {/* Visual representation of current shot */}
                    <div
                      className="aspect-video w-full max-w-[640px] mx-auto rounded-lg overflow-hidden relative mb-3"
                      style={{ background: `linear-gradient(135deg, ${
                        currentShot.primaryEmotion === 'joy' ? '#1a1a3e, #4a2080' :
                        currentShot.primaryEmotion === 'sadness' ? '#0a0a2e, #2a1a4e' :
                        currentShot.primaryEmotion === 'anger' ? '#2e0a0a, #5e1010' :
                        currentShot.primaryEmotion === 'fear' ? '#0a1e1a, #104030' :
                        currentShot.primaryEmotion === 'hopeful' ? '#0a1e2e, #105080' :
                        currentShot.primaryEmotion === 'tense' ? '#1e0a0a, #401010' :
                        currentShot.primaryEmotion === 'determined' ? '#1e1a0a, #403810' :
                        currentShot.primaryEmotion === 'bittersweet' ? '#1e1a1e, #3a3038' :
                        '#0a0e1a, #1a2030'
                      })` }}
                    >
                      {/* Shot visual */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl md:text-8xl drop-shadow-lg">
                          {emotionEmoji[currentShot.primaryEmotion] || '🎬'}
                        </span>
                      </div>
                      
                      {/* Gradient overlay for readability */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Shot info overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-display text-white font-semibold drop-shadow-md">{currentShot.title}</p>
                        <p className="text-xs text-white/60 drop-shadow-md mt-0.5 line-clamp-2">{currentShot.description}</p>
                      </div>

                      {/* Character overlay */}
                      {currentShot.characterIds.includes(activeCharacterId || '') && activeChar && (
                        <motion.div
                          className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="text-lg">{activeChar.avatarEmoji}</span>
                          <span className="text-xs text-white/80 font-medium">{activeChar.name}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center justify-center gap-3 text-[10px] text-white/30 mt-2">
                      <span>#{currentShot.index + 1}</span>
                      <span>|</span>
                      <span>{CAMERA_PRESETS.find(c => c.key === currentShot.cameraAngle)?.label}</span>
                      <span>|</span>
                      <span>情感: {Math.round(currentShot.emotionIntensity * 100)}%</span>
                      <span>|</span>
                      <span>{currentShot.duration.toFixed(1)}s</span>
                    </div>
                  </motion.div>
                ) : (
                  /* Empty state */
                  <div className="text-center">
                    <div className="text-5xl mb-3 opacity-30">🎬</div>
                    <p className="text-sm text-white/30">预览窗口</p>
                    <p className="text-xs text-white/20 mt-1">播放时间轴或选择片段查看预览</p>
                    
                    {/* Video player chrome (mock) */}
                    <div className="mt-4 max-w-[500px] mx-auto">
                      <div className="aspect-video rounded-lg bg-[#0a0e1a] border border-white/10 flex flex-col">
                        {/* Fake video area */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl mb-2">📹</p>
                            <p className="text-xs text-white/30">Video.js Player</p>
                            <p className="text-[10px] text-white/20 mt-1">支持 MP4/HLS/WebM 格式</p>
                          </div>
                        </div>
                        
                        {/* Controls bar (mock video.js style) */}
                        <div className="h-8 bg-[#080c14] flex items-center px-2 gap-2 border-t border-white/5">
                          <button className="text-white/50 hover:text-white text-xs">▶</button>
                          <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer">
                            <div className="absolute left-0 top-0 h-full w-0 group-hover:w-[35%] bg-[#6C5CE7] rounded-full transition-all" />
                          </div>
                          <span className="text-[9px] text-white/30 font-mono min-w-[55px]">00:00 / --:--</span>
                          <button className="text-white/50 hover:text-white text-xs">🔊</button>
                          <button className="text-white/50 hover:text-white text-xs">⛶</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* REC timecode overlay */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                <span className="text-[10px] font-mono text-white/60">REC</span>
                <span className="text-[10px] font-mono text-white/40 ml-1">{formatTimecode(currentTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Video Controls Overlay (always visible in editor mode) ═══ */}
        <AnimatePresence>
          {(viewMode === 'editor' && showControls) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-4"
            >
              <div className="flex items-center gap-3">
                {/* Play/Pause big button */}
                <button
                  onClick={() => playState === 'playing' ? pause() : play()}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {playState === 'playing' ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5 group">
                  <button className="text-white/50 hover:text-white text-xs">🔊</button>
                  <div className="w-16 h-1 bg-white/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-full bg-white/50 rounded-full" style={{ width: `${volume}%` }} />
                  </div>
                </div>

                {/* Time */}
                <span className="text-[11px] font-mono text-white/50 min-w-[100px]">
                  {formatTimecode(currentTime)} / {formatTimecode(useDirectorStore.getState().totalDuration)}
                </span>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Quality selector */}
                <select className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white/50 outline-none">
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>

                {/* Fullscreen hint */}
                <button className="text-white/40 hover:text-white/70 text-xs">⛶</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Property Panel (when shot selected) ═══ */}
      <AnimatePresence>
        {selectedShot && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] overflow-hidden bg-[#080c14]"
          >
            <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="col-span-2">
                <h4 className="text-[10px] font-medium text-[#B388FF] uppercase tracking-wider mb-1">
                  分镜 #{selectedShot.index + 1}: {selectedShot.title}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-2">{selectedShot.description}</p>
              </div>

              <div>
                <p className="text-[9px] text-white/30 mb-1.5">机位</p>
                <div className="flex flex-wrap gap-1">
                  {CAMERA_PRESETS.slice(0, 4).map(cam => (
                    <button
                      key={cam.key}
                      onClick={() => toast.success(`切换到 ${cam.label}`)}
                      className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                        selectedShot.cameraAngle === cam.key
                          ? 'bg-[#6C5CE7]/20 text-[#B388FF]'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >{cam.icon} {cam.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] text-white/30 mb-1.5">灯光</p>
                <div className="flex flex-wrap gap-1">
                  {LIGHTING_PRESETS.slice(0, 3).map(light => (
                    <button
                      key={light.key}
                      onClick={() => toast.success(`灯光: ${light.label}`)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                    ><span className="w-2 h-2 rounded-full" style={{ background: light.color }} />{light.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] text-white/30 mb-1">时长: {selectedShot.duration.toFixed(1)}s</p>
                <p className="text-[9px] text-white/30 mb-1">情感: {Math.round(selectedShot.emotionIntensity * 100)}%</p>
                <input
                  type="range" min={0} max={1} step={0.01}
                  defaultValue={selectedShot.emotionIntensity}
                  className="w-full h-1 accent-[#FF6B6B] mt-1"
                />
              </div>

              <div className="flex items-end gap-1 col-span-2 lg:col-span-1">
                <button onClick={() => toast.success('已复制到剪贴板')} className="px-2 py-1 rounded text-[9px] bg-white/5 text-white/40 hover:text-white/60">复制</button>
                <button onClick={() => toast.loading('AI 正在重新生成...')} className="px-2 py-1 rounded text-[9px] bg-[#6C5CE7]/10 text-[#B388FF] hover:bg-[#6C5CE7]/20">AI 重做</button>
                <button onClick={() => selectShot(null)} className="px-2 py-1 rounded text-[9px] bg-white/5 text-white/40 hover:text-danger-red ml-auto">关闭</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}