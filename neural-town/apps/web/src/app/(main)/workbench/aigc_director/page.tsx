'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ROLES_META } from '@neural-town/shared';
import { useDirectorStore } from '@/stores/director-store';
import toast from 'react-hot-toast';

// Lazy load heavy components
const MultiTrackTimeline = dynamic(() => import('@/components/director/MultiTrackTimeline'), { ssr: false });
const CharacterPanel = dynamic(() => import('@/components/director/CharacterPanel'), { ssr: false });
const ScriptEditor = dynamic(() => import('@/components/director/ScriptEditor'), { ssr: false });
const DirectorPreviewWithVideo = dynamic(() => import('@/components/director/DirectorPreviewWithVideo'), { ssr: false });
const AssetLibrary = dynamic(() => import('@/components/director/AssetLibrary'), { ssr: false });
const AIPipelineEditor = dynamic(() => import('@/components/director/AIPipelineEditor'), { ssr: false });

// Reuse existing components that still work well
const EmotionCurveEditor = dynamic(() => import('@/components/director/EmotionCurveEditor'), { ssr: false });

export default function AIGCDirectorWorkbench() {
  const meta = ROLES_META.aigc_director;
  const {
    viewMode, setViewMode, projectName, setProjectName,
    leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel,
    showScriptEditor, toggleScriptEditor, isGenerating,
    play, pause, stop, currentTime, totalDuration,
  } = useDirectorStore();

  const [showPipelineEditor, setShowPipelineEditor] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') { e.preventDefault(); playState === 'playing' ? pause() : play(); }
      if (e.key === 'Escape') { if (showScriptEditor) toggleScriptEditor(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const playState = useDirectorStore(s => s.playState);

  const handleExport = (format: 'mp4' | 'ntp' | 'gif') => {
    toast.success(
      format === 'mp4' ? '正在渲染 MP4 视频（最高 4K）...' :
      format === 'ntp' ? '3D 叙事胶囊 (.ntp) 已导出，包含全部角色、场景、动画数据' :
      'GIF 动图预览已生成',
      { icon: format === 'mp4' ? '🎬' : format === 'ntp' ? '📦' : '🖼️', duration: 3000 }
    );
  };

  const handlePublish = () => {
    toast.success('作品已发布到社区 #aigc 频道！其他用户可 3D 预览并一键复刻', {
      icon: '🌟', duration: 3000
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#030614]">
      {/* ═══ Top Navigation Bar ═══ */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-cosmic-border bg-space-card/80 shrink-0">
        {/* Logo + Title */}
        <span className="text-xl">{meta.icon}</span>
        <div className="min-w-0">
          <h1 className="text-base font-display font-bold text-gradient leading-tight">创世引擎</h1>
          <p className="text-[10px] text-white/40 truncate">{meta.workbenchName} · {projectName}</p>
        </div>

        {/* Mode Toggle */}
        <div className="ml-4 flex items-center bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
          <button
            onClick={() => setViewMode('galaxy')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] transition-colors ${
              viewMode === 'galaxy'
                ? 'bg-[#6C5CE7]/20 text-[#B388FF]'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span>🌌</span>
            <span className="hidden sm:inline">叙事星系</span>
          </button>
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] transition-colors ${
              viewMode === 'editor'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span>🎬</span>
            <span className="hidden sm:inline">剪辑视图</span>
          </button>
        </div>

        {/* Pipeline Editor Toggle */}
        <button
          onClick={() => setShowPipelineEditor(!showPipelineEditor)}
          className={`ml-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
            showPipelineEditor
              ? 'border-[#FF6B6B]/40 text-[#FF6B6B] bg-[#FF6B6B]/10'
              : 'border-white/10 text-white/50 hover:border-[#FF6B6B]/30'
          }`}
          title="AI 生成管线 (react-flow)"
        >
          ⚡ 管线
        </button>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleScriptEditor}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
              showScriptEditor
                ? 'border-[#6C5CE7]/40 text-[#B388FF] bg-[#6C5CE7]/10'
                : 'border-white/10 text-white/50 hover:border-nebulae-purple/30'
            }`}
          >
            📝 剧本
          </button>
          <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('项目已保存')}>
            保存
          </CosmicButton>

          {/* Export dropdown */}
          <div className="relative group">
            <CosmicButton size="sm">导出 ▾</CosmicButton>
            <div className="absolute right-0 top-full mt-1 w-36 hidden group-hover:block bg-[#0D1020] border border-[#2A2F45] rounded-lg shadow-xl overflow-hidden z-50">
              {([
                { key: 'mp4' as const, label: 'MP4 视频', icon: '🎬' },
                { key: 'ntp' as const, label: '.ntp 叙事胶囊', icon: '📦' },
                { key: 'gif' as const, label: 'GIF 动图', icon: '🖼️' },
              ]).map(item => (
                <button
                  key={item.key}
                  onClick={() => handleExport(item.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/[0.05] transition-colors text-left"
                >
                  <span>{item.icon}</span>
                  <span className="text-white/70">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <CosmicButton size="sm" onClick={handlePublish}>
            发布作品
          </CosmicButton>
        </div>
      </div>

      {/* ═══ Script Editor (collapsible) ═══ */}
      {showScriptEditor && <ScriptEditor />}

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Asset Library or Resource Panel */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-cosmic-border overflow-hidden shrink-0"
              style={{ width: 220 }}
            >
              <AssetLibrary />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Preview + Canvas or Pipeline Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {showPipelineEditor ? (
            <AIPipelineEditor />
          ) : (
            <DirectorPreviewWithVideo />
          )}
        </div>

        {/* Right Panel: Property / Character Panel */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-cosmic-border overflow-hidden shrink-0"
              style={{ width: 260 }}
            >
              <CharacterPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Bottom: Multi-track Timeline ═══ */}
      <MultiTrackTimeline />

      {/* ═══ Floating panel toggles ═══ */}
      <div className="fixed bottom-[200px] left-4 flex flex-col gap-1 z-40">
        <button
          onClick={toggleLeftPanel}
          className={`p-1.5 rounded-lg border backdrop-blur-sm transition-colors ${
            leftPanelOpen ? 'bg-[#6C5CE7]/20 border-[#6C5CE7]/30 text-[#B388FF]' : 'bg-black/40 border-white/10 text-white/30 hover:text-white/60'
          }`}
          title="素材库"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={toggleRightPanel}
          className={`p-1.5 rounded-lg border backdrop-blur-sm transition-colors ${
            rightPanelOpen ? 'bg-[#00E5FF]/20 border-[#00E5FF]/30 text-[#00E5FF]' : 'bg-black/40 border-white/10 text-white/30 hover:text-white/60'
          }`}
          title="角色面板"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
