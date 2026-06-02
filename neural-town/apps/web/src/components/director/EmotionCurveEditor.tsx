'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface EmotionPoint {
  time: number;
  intensity: number;
  label: string;
}

interface EmotionTrack {
  name: string;
  color: string;
  points: EmotionPoint[];
  visible: boolean;
}

interface EmotionCurveEditorProps {
  tracks?: EmotionTrack[];
  onTracksChange?: (tracks: EmotionTrack[]) => void;
  duration?: number;
}

const DEFAULT_TRACKS: EmotionTrack[] = [
  { name: '紧张', color: '#FF6B6B', visible: true, points: [{ time: 0, intensity: 0.3, label: '开始' }, { time: 0.5, intensity: 0.8, label: '高潮' }, { time: 1, intensity: 0.2, label: '结束' }] },
  { name: '悲伤', color: '#6C5CE7', visible: true, points: [{ time: 0, intensity: 0.1, label: '开始' }, { time: 0.5, intensity: 0.6, label: '高潮' }, { time: 1, intensity: 0.1, label: '结束' }] },
  { name: '喜悦', color: '#FFD166', visible: true, points: [{ time: 0, intensity: 0.2, label: '开始' }, { time: 0.5, intensity: 0.4, label: '高潮' }, { time: 1, intensity: 0.7, label: '结束' }] },
  { name: '惊讶', color: '#00E5FF', visible: true, points: [{ time: 0, intensity: 0.1, label: '开始' }, { time: 0.5, intensity: 0.5, label: '高潮' }, { time: 1, intensity: 0.1, label: '结束' }] },
  { name: '愤怒', color: '#FF4444', visible: false, points: [{ time: 0, intensity: 0.1, label: '开始' }, { time: 0.5, intensity: 0.3, label: '高潮' }, { time: 1, intensity: 0.1, label: '结束' }] },
  { name: '恐惧', color: '#E040FB', visible: false, points: [{ time: 0, intensity: 0.1, label: '开始' }, { time: 0.5, intensity: 0.4, label: '高潮' }, { time: 1, intensity: 0.1, label: '结束' }] },
];

export default function EmotionCurveEditor({ tracks: propTracks, onTracksChange, duration = 60 }: EmotionCurveEditorProps) {
  const [tracks, setTracks] = useState<EmotionTrack[]>(propTracks || DEFAULT_TRACKS);
  const [dragging, setDragging] = useState<{ trackIndex: number; pointIndex: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ trackIndex: number; pointIndex: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 600;
  const H = 300;
  const PAD = { top: 20, right: 40, bottom: 40, left: 50 };

  const toX = (t: number) => PAD.left + (t * (W - PAD.left - PAD.right));
  const toY = (intensity: number) => PAD.top + (1 - intensity) * (H - PAD.top - PAD.bottom);
  const fromX = (x: number) => Math.max(0, Math.min(1, (x - PAD.left) / (W - PAD.left - PAD.right)));
  const fromY = (y: number) => Math.max(0, Math.min(1, 1 - (y - PAD.top) / (H - PAD.top - PAD.bottom)));

  // 生成平滑路径
  const getPath = (points: EmotionPoint[]) => {
    if (points.length === 0) return '';
    const sorted = [...points].sort((a, b) => a.time - b.time);
    let d = `M ${toX(sorted[0].time)} ${toY(sorted[0].intensity)}`;
    for (let i = 0; i < sorted.length - 1; i++) {
      const x1 = toX(sorted[i].time);
      const y1 = toY(sorted[i].intensity);
      const x2 = toX(sorted[i + 1].time);
      const y2 = toY(sorted[i + 1].intensity);
      const cx = (x1 + x2) / 2;
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }
    return d;
  };

  const handlePointDrag = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    const newTime = fromX(x);
    const newIntensity = fromY(y);

    setTracks(prev => {
      const updated = [...prev];
      const track = { ...updated[dragging.trackIndex] };
      const points = [...track.points];
      points[dragging.pointIndex] = {
        ...points[dragging.pointIndex],
        time: newTime,
        intensity: newIntensity,
      };
      track.points = points;
      updated[dragging.trackIndex] = track;
      onTracksChange?.(updated);
      return updated;
    });
  }, [dragging, onTracksChange]);

  const addPoint = (trackIndex: number, e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    setTracks(prev => {
      const updated = [...prev];
      const track = { ...updated[trackIndex] };
      track.points = [...track.points, { time: fromX(x), intensity: fromY(y), label: '' }];
      updated[trackIndex] = track;
      onTracksChange?.(updated);
      return updated;
    });
  };

  const toggleTrack = (index: number) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], visible: !updated[index].visible };
      onTracksChange?.(updated);
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 轨道开关 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-cosmic-border">
        {tracks.map((track, i) => (
          <button
            key={track.name}
            onClick={() => toggleTrack(i)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
              track.visible ? 'bg-white/10 text-white' : 'bg-transparent text-white/30'
            }`}
            style={{ borderLeft: `2px solid ${track.visible ? track.color : 'transparent'}` }}
          >
            {track.name}
          </button>
        ))}
        <button
          onClick={() => {
            setTracks(prev => {
              const script = prompt('输入脚本进行情感分析：');
              if (!script) return prev;
              // 调用 API 分析情感曲线
              fetch('/api/v1/generate/emotion-curve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }),
              }).then(r => r.json()).then(data => {
                if (data.curves) {
                  const updated = prev.map((track, i) => {
                    const curveData = data.curves[track.name];
                    if (curveData) {
                      return { ...track, points: curveData, visible: true };
                    }
                    return track;
                  });
                  setTracks(updated);
                  onTracksChange?.(updated);
                }
              });
              return prev;
            });
          }}
          className="ml-auto px-2 py-1 rounded text-[10px] bg-nebulae-purple/20 text-nebulae-purple hover:bg-nebulae-purple/30"
        >
          AI 分析
        </button>
      </div>

      {/* SVG 画布 */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          onMouseMove={handlePointDrag}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          {/* 网格 */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1={PAD.left} y1={toY(i / 4)} x2={W - PAD.right} y2={toY(i / 4)} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`v${i}`} x1={toX(i / 6)} y1={PAD.top} x2={toX(i / 6)} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          ))}

          {/* 轴线 */}
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />

          {/* 轴标签 */}
          <text x={W / 2} y={H - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>时间 →</text>
          <text x={15} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10} transform={`rotate(-90, 15, ${H / 2})`}>情感强度 ↑</text>

          {/* 轨道曲线 */}
          {tracks.map((track, ti) =>
            track.visible && (
              <g key={track.name}>
                <path
                  d={getPath(track.points)}
                  fill="none"
                  stroke={track.color}
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  onClick={(e) => { e.stopPropagation(); }}
                />
                {/* 控制点 */}
                {track.points.map((point, pi) => (
                  <g key={pi}>
                    <circle
                      cx={toX(point.time)}
                      cy={toY(point.intensity)}
                      r={selectedPoint?.trackIndex === ti && selectedPoint?.pointIndex === pi ? 7 : 5}
                      fill={track.color}
                      stroke="white"
                      strokeWidth={1}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint({ trackIndex: ti, pointIndex: pi });
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDragging({ trackIndex: ti, pointIndex: pi });
                      }}
                    />
                    {selectedPoint?.trackIndex === ti && selectedPoint?.pointIndex === pi && (
                      <text
                        x={toX(point.time) + 10}
                        y={toY(point.intensity) - 10}
                        fill="white"
                        fontSize={9}
                      >
                        {point.label || `${track.name}: ${Math.round(point.intensity * 100)}%`}
                      </text>
                    )}
                  </g>
                ))}
                {/* 点击添加控制点 */}
                <rect
                  x={0} y={0} width={W} height={H}
                  fill="transparent"
                  onClick={(e) => addPoint(ti, e)}
                  className="cursor-crosshair"
                />
              </g>
            )
          )}

          {/* 播放头 */}
          <line x1={toX(0.3)} y1={PAD.top} x2={toX(0.3)} y2={H - PAD.bottom} stroke="#00E5FF" strokeWidth={1} strokeDasharray="4,2" opacity={0.6} />
        </svg>
      </div>
    </div>
  );
}