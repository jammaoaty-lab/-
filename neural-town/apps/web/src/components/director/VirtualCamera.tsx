'use client';

import { useState, useCallback } from 'react';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import toast from 'react-hot-toast';

interface CameraSettings {
  type: 'wide' | 'close-up' | 'medium' | 'over-shoulder' | 'aerial' | 'tracking' | 'custom';
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  dof: number;
}

const CAMERA_PRESETS: Record<string, CameraSettings> = {
  'wide': { type: 'wide', position: { x: 0, y: 3, z: 8 }, target: { x: 0, y: 1, z: 0 }, fov: 60, dof: 0 },
  'close-up': { type: 'close-up', position: { x: 0, y: 1.5, z: 2 }, target: { x: 0, y: 1.5, z: 0 }, fov: 35, dof: 0.5 },
  'medium': { type: 'medium', position: { x: 0, y: 1.5, z: 4 }, target: { x: 0, y: 1.5, z: 0 }, fov: 45, dof: 0.2 },
  'over-shoulder': { type: 'over-shoulder', position: { x: 2, y: 1.8, z: 3 }, target: { x: 0, y: 1.5, z: 1 }, fov: 50, dof: 0.3 },
  'aerial': { type: 'aerial', position: { x: 0, y: 6, z: 0.5 }, target: { x: 0, y: 0, z: 0 }, fov: 70, dof: 0 },
  'tracking': { type: 'tracking', position: { x: -3, y: 1.8, z: 0 }, target: { x: 0, y: 1.5, z: 0 }, fov: 50, dof: 0.1 },
};

interface RecordedMovement {
  id: string;
  name: string;
  type: 'pan' | 'tilt' | 'dolly' | 'zoom' | 'track';
  keyframes: { time: number; value: number }[];
}

interface VirtualCameraProps {
  onCameraChange?: (settings: CameraSettings) => void;
  onRecordingChange?: (recordings: RecordedMovement[]) => void;
}

export default function VirtualCamera({ onCameraChange, onRecordingChange }: VirtualCameraProps) {
  const [currentCamera, setCurrentCamera] = useState<CameraSettings>(CAMERA_PRESETS.wide);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordedMovement[]>([]);
  const [movementType, setMovementType] = useState<RecordedMovement['type']>('dolly');
  const [previewMode, setPreviewMode] = useState(false);

  const applyPreset = (key: string) => {
    const preset = CAMERA_PRESETS[key];
    setCurrentCamera(preset);
    onCameraChange?.(preset);
  };

  const updatePosition = (axis: 'x' | 'y' | 'z', delta: number) => {
    setCurrentCamera(prev => {
      const updated = { ...prev, position: { ...prev.position, [axis]: Math.round((prev.position[axis] + delta) * 10) / 10 } };
      onCameraChange?.(updated);
      return updated;
    });
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.success('开始录制摄像机运动...');
    } else {
      setIsRecording(false);
      const newRecording: RecordedMovement = {
        id: `rec-${Date.now()}`,
        name: `${movementType} ${recordings.length + 1}`,
        type: movementType,
        keyframes: [
          { time: 0, value: 0 },
          { time: 1, value: 0.5 },
          { time: 2, value: 1 },
        ],
      };
      const updated = [...recordings, newRecording];
      setRecordings(updated);
      onRecordingChange?.(updated);
      toast.success('运动录制完成');
    }
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="p-2 border-b border-cosmic-border">
        <h3 className="text-xs font-mono text-white/60 uppercase">虚拟摄像机</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* 摄像机预设 */}
        <div>
          <p className="text-[10px] text-white/40 mb-2 font-mono">机位预设</p>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(CAMERA_PRESETS).map(([key, cam]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`p-1.5 rounded-lg text-[10px] transition-colors ${
                  currentCamera.type === key ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {key === 'wide' ? '🔭 广角' :
                 key === 'close-up' ? '🔍 特写' :
                 key === 'medium' ? '📷 中景' :
                 key === 'over-shoulder' ? '👤 过肩' :
                 key === 'aerial' ? '🚁 航拍' : '🎬 跟拍'}
              </button>
            ))}
          </div>
        </div>

        {/* 位置控制 */}
        <div>
          <p className="text-[10px] text-white/40 mb-2 font-mono">
            位置: X{currentCamera.position.x} Y{currentCamera.position.y} Z{currentCamera.position.z}
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(['x', 'y', 'z'] as const).map(axis => (
              <div key={axis} className="flex items-center gap-1">
                <button onClick={() => updatePosition(axis, -0.5)} className="w-6 h-6 rounded bg-white/10 text-white/50 hover:bg-white/20 text-xs">◀</button>
                <span className="text-xs text-white/60 w-4 text-center">{axis.toUpperCase()}</span>
                <button onClick={() => updatePosition(axis, 0.5)} className="w-6 h-6 rounded bg-white/10 text-white/50 hover:bg-white/20 text-xs">▶</button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <label className="text-[10px] text-white/40">FOV: {currentCamera.fov}°</label>
            <input
              type="range" min="15" max="120" value={currentCamera.fov}
              onChange={(e) => { const n = { ...currentCamera, fov: parseInt(e.target.value) }; setCurrentCamera(n); onCameraChange?.(n); }}
              className="w-full accent-nebulae-purple h-1"
            />
          </div>
        </div>

        {/* 运动录制 */}
        <div>
          <p className="text-[10px] text-white/40 mb-2 font-mono">运动录制</p>
          <select
            className="cosmic-input text-xs h-7 mb-2"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as RecordedMovement['type'])}
          >
            <option value="dolly">推拉 Dolly</option>
            <option value="pan">摇 Pan</option>
            <option value="tilt">移 Tilt</option>
            <option value="zoom">缩放 Zoom</option>
            <option value="track">跟 Track</option>
          </select>
          <CosmicButton
            size="sm"
            className="w-full"
            variant={isRecording ? 'ghost' : 'primary'}
            onClick={toggleRecording}
          >
            {isRecording ? '⏹ 停止录制' : '⏺ 开始录制'}
          </CosmicButton>
          {isRecording && (
            <div className="flex justify-center mt-1">
              <span className="w-2 h-2 bg-danger-red rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* 录制列表 */}
        {recordings.length > 0 && (
          <div>
            <p className="text-[10px] text-white/40 mb-1 font-mono">已录制 ({recordings.length})</p>
            <div className="space-y-1">
              {recordings.map(rec => (
                <div key={rec.id} className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 text-xs">
                  <span className="text-white/60">{rec.name}</span>
                  <span className="text-[10px] text-white/30 ml-auto">{rec.type}</span>
                  <button
                    onClick={() => setRecordings(prev => prev.filter(r => r.id !== rec.id))}
                    className="text-danger-red text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 预览切换 */}
        <CosmicButton
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? '退出导演监视器' : '🎬 导演监视器预览'}
        </CosmicButton>
      </div>
    </div>
  );
}