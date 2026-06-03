'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDirectorStore, type TimelineClip, type TimelineTrack } from '@/stores/director-store';
import toast from 'react-hot-toast';

const TRACK_HEIGHT = 36;
const TRACK_HEADER_WIDTH = 100;
const RULER_HEIGHT = 24;
const PLAYHEAD_COLOR = '#FF6B6B';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 30); // 30fps frames
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

function ClipBlock({ clip, zoomLevel, isSelected, onSelect }: {
  clip: TimelineClip;
  zoomLevel: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const width = Math.max(20, clip.duration * zoomLevel);
  const left = clip.startTime * zoomLevel;

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      return;
    }
    setIsDragging(true);
    onSelect();
    e.preventDefault();
  };

  return (
    <motion.div
      className={`absolute top-1 h-[${TRACK_HEIGHT - 2}px] rounded cursor-pointer group flex items-center px-1.5 overflow-hidden ${
        isSelected ? 'ring-1 ring-white shadow-lg z-10' : ''
      }`}
      style={{
        left,
        width,
        backgroundColor: clip.color + 'CC',
        border: `1px solid ${clip.color}`,
      }}
      onMouseDown={handleDragStart}
      whileHover={{ scale: isDragging || isResizing ? 1 : 1.02 }}
      layout
    >
      <span className="text-[9px] text-white font-medium truncate pointer-events-none">
        {clip.label}
      </span>
      {/* Resize handle */}
      <div className="resize-handle absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize bg-white/20 hover:bg-white/50 rounded-r" />

      {/* Right-click AI menu hint */}
      {isSelected && (
        <div className="hidden group-hover:flex absolute -top-6 left-0 gap-0.5">
          {['重新生成', '调色匹配', '节奏优化'].map(action => (
            <button
              key={action}
              onClick={(e) => { e.stopPropagation(); toast.success(`AI ${action}: "${clip.label}"`); }}
              className="px-1.5 py-0.5 text-[8px] rounded bg-[#6C5CE7]/80 text-white hover:bg-[#6C5CE7]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TrackRow({ track, zoomLevel, currentTime, selectedClipId, onSelectClip }: {
  track: TimelineTrack;
  zoomLevel: number;
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
}) {
  const totalWidth = useDirectorStore(s => s.totalDuration) * zoomLevel;

  if (!track.visible) return null;

  return (
    <div className="flex items-center h-[36px] border-b border-white/[0.04]" style={{ opacity: track.locked ? 0.5 : 1 }}>
      {/* Track header */}
      <div className={`shrink-0 w-[${TRACK_HEADER_WIDTH}px] px-2 flex items-center gap-1 border-r border-white/[0.06] bg-[#080C18]`}>
        <span className="text-[9px] text-white/50">
          {track.type === 'video' && '🎬'}
          {track.type === 'audio' && '🔊'}
          {track.type === 'subtitle' && '💬'}
          {track.type === 'effect' && '✨'}
        </span>
        <span className="text-[10px] text-white/70 truncate">{track.name}</span>
        {track.locked && <span className="text-[8px]">🔒</span>}
      </div>

      {/* Clips area */}
      <div className="relative flex-1 h-full overflow-hidden bg-white/[0.01]">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: totalWidth }}>
          {[...Array(Math.ceil(totalWidth / (zoomLevel * 2)))].map((_, i) => (
            <line key={i} x1={i * zoomLevel * 2} y1={0} x2={i * zoomLevel * 2} y2={TRACK_HEIGHT} stroke="#ffffff08" strokeWidth={0.5} />
          ))}
        </svg>

        {track.clips.map(clip => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            zoomLevel={zoomLevel}
            isSelected={clip.id === selectedClipId}
            onSelect={() => onSelectClip(clip.id)}
          />
        ))}

        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-px z-20"
          style={{ left: currentTime * zoomLevel, background: PLAYHEAD_COLOR }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PLAYHEAD_COLOR }} />
        </div>
      </div>
    </div>
  );
}

function TimeRuler({ zoomLevel, totalDuration }: { zoomLevel: number; totalDuration: number }) {
  const ticks = [];
  for (let t = 0; t <= totalDuration; t += Math.ceil(5 / zoomLevel)) {
    ticks.push(t);
  }

  return (
    <div className="flex h-[24px] border-b border-white/[0.06] shrink-0">
      <div className={`shrink-0 w-[${TRACK_HEADER_WIDTH}px] border-r border-white/[0.06] bg-[#080C18]`} />
      <div className="relative flex-1" style={{ minWidth: totalDuration * zoomLevel }}>
        {ticks.map(t => (
          <div key={t} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: t * zoomLevel }}>
            <div className="w-px h-2 bg-white/20" />
            <span className="text-[8px] text-white/30 mt-0.5">{formatTime(t)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MultiTrackTimeline() {
  const {
    tracks, totalDuration, currentTime, playState, zoomLevel,
    bottomPanelExpanded, play, pause, stop, seekTo, setZoomLevel,
    removeClip, updateClipDuration,
  } = useDirectorStore();

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Click on timeline to seek
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - TRACK_HEADER_WIDTH;
    const time = x / zoomLevel;
    seekTo(Math.max(0, Math.min(time, totalDuration)));
  }, [zoomLevel, totalDuration, seekTo]);

  // Playback simulation
  useEffect(() => {
    if (playState !== 'playing') return;
    const interval = setInterval(() => {
      const state = useDirectorStore.getState();
      if (state.currentTime >= state.totalDuration) {
        useDirectorStore.getState().stop();
        return;
      }
      useDirectorStore.getState().seekTo(state.currentTime + 1 / 30); // 30fps tick
    }, 33); // ~30fps
    return () => clearInterval(interval);
  }, [playState]);

  return (
    <div className="flex flex-col bg-[#050812] border-t border-cosmic-border select-none">
      {/* Header bar with controls */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05] bg-[#080C18]">
        <div className="flex items-center gap-2">
          {/* Transport controls */}
          <button onClick={() => playState === 'playing' ? pause() : play()} className="p-1 rounded hover:bg-white/10 transition-colors">
            {playState === 'playing' ? (
              <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={stop} className="p-1 rounded hover:bg-white/10 transition-colors">
            <svg className="w-3.5 h-3.5 text-white/70" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>

          {/* Time code */}
          <span className="text-xs font-mono text-[#00E5FF] ml-2 min-w-[90px]">{formatTime(currentTime)}</span>
          <span className="text-[10px] text-white/20">/ {formatTime(totalDuration)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom control */}
          <span className="text-[9px] text-white/30">缩放:</span>
          <input
            type="range"
            min={20}
            max={200}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-20 accent-[#6C5CE7]"
          />

          {/* Expand/collapse */}
          <button
            onClick={() => useDirectorStore.getState().toggleBottomPanel()}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={bottomPanelExpanded ? '收起时间轴' : '展开时间轴'}
          >
            <svg className={`w-3.5 h-3.5 text-white/50 transition-transform ${bottomPanelExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline content */}
      <div
        ref={timelineRef}
        className={`overflow-auto transition-all duration-300 ${bottomPanelExpanded ? 'max-h-[280px]' : 'max-h-[48px]'}`}
        onClick={handleTimelineClick}
      >
        <TimeRuler zoomLevel={zoomLevel} totalDuration={totalDuration} />
        {tracks.map(track => (
          <TrackRow
            key={track.id}
            track={track}
            zoomLevel={zoomLevel}
            currentTime={currentTime}
            selectedClipId={selectedClipId}
            onSelectClip={(id) => setSelectedClipId(id)}
          />
        ))}
      </div>
    </div>
  );
}
