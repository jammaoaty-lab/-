'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDirectorStore, type TimelineClip as StoreClip, type TimelineTrack } from '@/stores/director-store';
import toast from 'react-hot-toast';

// ─── Constants ───
const TRACK_HEIGHT = 40;
const TRACK_HEADER_WIDTH = 110;
const RULER_HEIGHT = 28;
const SNAP_GRID = 0.5; // snap to 0.5 second intervals
const MIN_CLIP_DURATION = 0.5;

const TRACK_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  video: { label: '视频主轨', icon: '🎬', color: '#6C5CE7' },
  pip: { label: '画中画', icon: '🖼️', color: '#00E5FF' },
  audio: { label: '音频轨', icon: '🔊', color: '#9B59B6' },
  subtitle: { label: '字幕轨', icon: '💬', color: '#E040FB' },
  effect: { label: '特效轨', icon: '✨', color: '#FF9100' },
};

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 30);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

// ─── Sortable Clip Component ───
function SortableClip({ clip, zoomLevel, isSelected, onSelect }: {
  clip: StoreClip;
  zoomLevel: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clip.id, data: { type: 'clip', clip } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : isSelected ? 10 : 1,
  };

  const width = Math.max(30, clip.duration * zoomLevel);
  const left = clip.startTime * zoomLevel;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left,
        width,
        top: 3,
        height: TRACK_HEIGHT - 6,
        backgroundColor: `${clip.color}CC`,
        border: `1px solid ${clip.color}`,
      }}
      className={`group rounded-md cursor-grab active:cursor-grabbing flex items-center px-2 overflow-hidden transition-shadow ${
        isSelected ? 'ring-2 ring-white/60 shadow-lg shadow-black/30' : ''
      } ${isDragging ? 'opacity-80 shadow-2xl scale-[1.02]' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      {...attributes}
      {...listeners}
    >
      {/* Clip content */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 pointer-events-none">
        <span className="text-[9px] font-medium text-white truncate">{clip.label}</span>
      </div>

      {/* Resize handle - right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 rounded-r-md transition-colors" />

      {/* AI action menu on selection */}
      {isSelected && !isDragging && (
        <div className="hidden group-hover:flex absolute -top-7 left-1/2 -translate-x-1/2 gap-0.5 z-20">
          {[
            { label: '重新生成', icon: '🔄' },
            { label: '调色匹配', icon: '🎨' },
            { label: '节奏优化', icon: '⚡' },
          ].map(action => (
            <button
              key={action.label}
              onClick={(e) => { e.stopPropagation(); toast.success(`AI ${action.label}: "${clip.label}"`); }}
              className="px-1.5 py-0.5 text-[8px] rounded bg-[#6C5CE7] text-white hover:bg-[#7C6EF7] shadow-sm"
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Track Row ───
function TrackRow({ track, zoomLevel, currentTime, selectedClipId, onSelectClip }: {
  track: TimelineTrack;
  zoomLevel: number;
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
}) {
  const config = TRACK_CONFIG[track.type] || { label: track.name, icon: '📁', color: '#888' };
  const totalWidth = useDirectorStore(s => s.totalDuration) * zoomLevel;

  if (!track.visible) return null;

  return (
    <div className={`flex items-center h-[40px] border-b border-white/[0.04]`} style={{ opacity: track.locked ? 0.4 : 1 }}>
      {/* Header */}
      <div className={`shrink-0 w-[${TRACK_HEADER_WIDTH}px] px-2.5 flex items-center gap-1.5 border-r border-white/[0.06] bg-[#080C18]`}>
        <span className="text-xs">{config.icon}</span>
        <span className="text-[10px] text-white/60 truncate font-medium">{config.label}</span>
        {track.locked && <span className="text-[8px]">🔒</span>}
      </div>

      {/* Clips area */}
      <div className="relative flex-1 h-full overflow-hidden bg-white/[0.01]" onClick={() => onSelectClip(null)}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: totalWidth + 'px' }}>
          {[...Array(Math.ceil(totalWidth / (zoomLevel * 2)))].map((_, i) => (
            <line key={i} x1={i * zoomLevel * 2} y1={0} x2={i * zoomLevel * 2} y2={TRACK_HEIGHT} stroke="#ffffff08" strokeWidth={0.5} />
          ))}
        </svg>

        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-px z-30 pointer-events-none"
          style={{ left: currentTime * zoomLevel, background: 'linear-gradient(to bottom, transparent, #FF6B6B, #FF6B6B, transparent)' }}
        >
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-sm bg-[#FF6B6B] shadow-sm shadow-[#FF6B6B]/50" />
        </div>

        {/* Sortable clips */}
        <SortableContext items={track.clips.map(c => c.id)} strategy={rectSortingStrategy}>
          {track.clips.map(clip => (
            <SortableClip
              key={clip.id}
              clip={clip}
              zoomLevel={zoomLevel}
              isSelected={clip.id === selectedClipId}
              onSelect={() => onSelectClip(clip.id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Time Ruler ───
function TimeRuler({ zoomLevel, totalDuration }: { zoomLevel: number; totalDuration: number }) {
  const ticks: number[] = [];
  const interval = Math.max(1, Math.ceil(2 / zoomLevel));
  for (let t = 0; t <= totalDuration; t += interval) {
    ticks.push(t);
  }

  return (
    <div className={`flex h-[${RULER_HEIGHT}px] border-b border-white/[0.06] shrink-0 select-none`}>
      <div className={`shrink-0 w-[${TRACK_HEADER_WIDTH}px] border-r border-white/[0.06] bg-[#080C18] flex items-center justify-center`}>
        <span className="text-[8px] text-white/25">TIME</span>
      </div>
      <div className="relative flex-1" style={{ minWidth: totalDuration * zoomLevel }}>
        {ticks.map(t => (
          <div key={t} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: t * zoomLevel }}>
            <div className={`w-px ${t % (interval * 5) === 0 ? 'h-3 bg-white/15' : 'h-1.5 bg-white/8'}`} />
            {t % (interval * 5) === 0 && (
              <span className="text-[8px] text-white/25 mt-0.5 whitespace-nowrap">{formatTimecode(t)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Timeline Component ───
export default function MultiTrackTimeline() {
  const store = useDirectorStore();
  const {
    tracks, totalDuration, currentTime, playState, zoomLevel,
    bottomPanelExpanded, play, pause, stop, seekTo, setZoomLevel,
    removeClip, updateClipDuration, moveClip,
  } = store;

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Playback simulation (30fps tick)
  useEffect(() => {
    if (playState !== 'playing') return;
    const interval = setInterval(() => {
      const s = useDirectorStore.getState();
      if (s.currentTime >= s.totalDuration) {
        useDirectorStore.getState().stop();
        return;
      }
      useDirectorStore.getState().seekTo(s.currentTime + 1 / 30);
    }, 33);
    return () => clearInterval(interval);
  }, [playState]);

  // Click on timeline to seek
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - TRACK_HEADER_WIDTH;
    const time = Math.max(0, Math.min(x / zoomLevel, totalDuration));
    seekTo(time);
  }, [zoomLevel, totalDuration, seekTo]);

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveDragId(null);

    // Find the clip in all tracks
    let foundClip: StoreClip | undefined;
    let foundTrackId: string | undefined;
    for (const track of tracks) {
      const c = track.clips.find(cl => cl.id === active.id);
      if (c) { foundClip = c; foundTrackId = track.id; break; }
    }

    if (!foundClip || !foundTrackId) return;

    // Calculate new time based on delta.x / zoomLevel
    const timeDelta = delta.x / zoomLevel;
    const newStartTime = Math.max(0, foundClip.startTime + timeDelta);

    // Snap to grid
    const snappedStart = Math.round(newStartTime / SNAP_GRID) * SNAP_GRID;
    moveClip(foundClip.id, snappedStart);
  }, [tracks, zoomLevel, moveClip]);

  // Find active clip for overlay
  const activeClip = tracks.flatMap(t => t.clips).find(c => c.id === activeDragId);

  return (
    <div className="flex flex-col bg-[#050812] border-t border-cosmic-border select-none">
      {/* Transport bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/[0.05] bg-[#080C18] shrink-0">
        <div className="flex items-center gap-2">
          {/* Stop */}
          <button onClick={stop} className="p-1 rounded hover:bg-white/10 transition-colors group" title="停止">
            <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => playState === 'playing' ? pause() : play()}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00E5FF] flex items-center justify-center hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all"
            title={playState === 'playing' ? '暂停 (Space)' : '播放 (Space)'}
          >
            {playState === 'playing' ? (
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          {/* Time code */}
          <div className="ml-2 flex items-baseline gap-1">
            <span className="text-xs font-mono text-[#00E5FF] tracking-wide min-w-[85px]">{formatTimecode(currentTime)}</span>
            <span className="text-[10px] text-white/20">/</span>
            <span className="text-[10px] text-white/25 font-mono">{formatTimecode(totalDuration)}</span>
          </div>

          {/* Progress bar background */}
          <div
            className="ml-3 flex-1 h-1 bg-white/[0.05] rounded-full cursor-pointer max-w-[300px]"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct * totalDuration);
            }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#00E5FF]"
              style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/25">ZOOM</span>
            <button onClick={() => setZoomLevel(Math.max(20, zoomLevel - 20))} className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors text-[11px]">−</button>
            <input
              type="range"
              min={20}
              max={200}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-20 accent-[#6C5CE7]"
            />
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 20))} className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors text-[11px]">+</button>
          </div>

          {/* Expand/collapse */}
          <button
            onClick={() => store.toggleBottomPanel()}
            className={`p-1 rounded hover:bg-white/10 transition-colors`}
            title={bottomPanelExpanded ? '收起时间轴' : '展开时间轴'}
          >
            <svg className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${!bottomPanelExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline body */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={timelineRef}
          className={`overflow-auto transition-all duration-300 ease-out ${bottomPanelExpanded ? 'max-h-[260px]' : 'max-h-[52px]'}`}
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
              onSelectClip={setSelectedClipId}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay adjustScale={false}>
          {activeClip ? (
            <div
              className="h-[34px] rounded-md px-3 py-1.5 flex items-center shadow-2xl shadow-black/50"
              style={{
                backgroundColor: `${activeClip.color}EE`,
                border: `2px solid ${activeClip.color}`,
                minWidth: 100,
              }}
            >
              <span className="text-[10px] font-bold text-white">{activeClip.label}</span>
              <span className="ml-auto text-[8px] text-white/50">↔ 拖动移动</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
