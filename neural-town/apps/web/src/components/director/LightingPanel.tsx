'use client';

import { useState, useCallback } from 'react';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import toast from 'react-hot-toast';

interface LightSettings {
  id: string;
  type: 'point' | 'spot' | 'area' | 'directional';
  position: { x: number; y: number; z: number };
  color: string;
  intensity: number;
  enabled: boolean;
}

interface LightingPanelProps {
  onLightingChange?: (lights: LightSettings[]) => void;
  sceneDescription?: string;
}

export default function LightingPanel({ onLightingChange, sceneDescription }: LightingPanelProps) {
  const [lights, setLights] = useState<LightSettings[]>([
    { id: 'key', type: 'spot', position: { x: 3, y: 5, z: 2 }, color: '#FFF8E7', intensity: 0.8, enabled: true },
    { id: 'fill', type: 'area', position: { x: -2, y: 3, z: 0 }, color: '#B8D4FF', intensity: 0.4, enabled: true },
    { id: 'rim', type: 'point', position: { x: 0, y: 2, z: -3 }, color: '#FFB8D4', intensity: 0.3, enabled: true },
    { id: 'ambient', type: 'directional', position: { x: 0, y: 5, z: 0 }, color: '#1A1A3E', intensity: 0.2, enabled: true },
  ]);
  const [selectedLight, setSelectedLight] = useState<string>('key');
  const [mood, setMood] = useState('neutral');
  const [timeOfDay, setTimeOfDay] = useState('day');

  const currentLight = lights.find(l => l.id === selectedLight) || lights[0];

  const updateLight = (id: string, updates: Partial<LightSettings>) => {
    setLights(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      onLightingChange?.(next);
      return next;
    });
  };

  const toggleLight = (id: string) => {
    const light = lights.find(l => l.id === id);
    if (light) updateLight(id, { enabled: !light.enabled });
  };

  const aiRecommend = async () => {
    toast.loading('AI 分析场景...', { id: 'lighting' });
    try {
      const res = await fetch('/api/v1/generate/lighting-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene_description: sceneDescription || 'cinematic scene', mood, time_of_day: timeOfDay }),
      });
      const data = await res.json();
      toast.success(`推荐色温: ${data.color_temperature}K`, { id: 'lighting' });
    } catch { toast.error('分析失败', { id: 'lighting' }); }
  };

  const lightIcons: Record<string, string> = {
    key: '🔑 主光', fill: '💡 补光', rim: '✨ 轮廓光', ambient: '🌌 环境光',
  };

  const moodPresets = [
    { name: 'neutral', label: '中性', temp: 4500 },
    { name: 'tense', label: '紧张', temp: 3200 },
    { name: 'sad', label: '悲伤', temp: 4000 },
    { name: 'joyful', label: '欢乐', temp: 5600 },
    { name: 'romantic', label: '浪漫', temp: 2800 },
    { name: 'mysterious', label: '神秘', temp: 3500 },
  ];

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="p-2 border-b border-cosmic-border flex items-center justify-between">
        <h3 className="text-xs font-mono text-white/60 uppercase">灯光方案</h3>
        <button onClick={aiRecommend} className="text-[10px] text-nebulae-purple hover:text-ai-blue">
          AI 推荐
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* 灯光列表 */}
        <div className="grid grid-cols-2 gap-1">
          {lights.map(light => (
            <button
              key={light.id}
              onClick={() => setSelectedLight(light.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                selectedLight === light.id ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30' :
                light.enabled ? 'bg-white/5 text-white/60' : 'bg-white/5 text-white/20'
              }`}
            >
              <span className="text-xs">{lightIcons[light.id]?.split(' ')[0] || '💡'}</span>
              <span className="truncate">{lightIcons[light.id]?.split(' ')[1] || light.id}</span>
              <div
                className={`ml-auto w-2 h-2 rounded-full ${light.enabled ? 'bg-success-green' : 'bg-white/20'}`}
                onClick={(e) => { e.stopPropagation(); toggleLight(light.id); }}
              />
            </button>
          ))}
        </div>

        {/* 选中灯光属性 */}
        <div>
          <p className="text-[10px] text-white/40 mb-2 font-mono">{lightIcons[currentLight.id]} 属性</p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-white/50">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentLight.color}
                  onChange={(e) => updateLight(currentLight.id, { color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white/40">{currentLight.color}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/50">强度: {Math.round(currentLight.intensity * 100)}%</label>
              <input
                type="range" min="0" max="2" step="0.01" value={currentLight.intensity}
                onChange={(e) => updateLight(currentLight.id, { intensity: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400 h-1"
              />
            </div>

            {['x', 'y', 'z'].map(axis => (
              <div key={axis} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-3">{axis.toUpperCase()}</span>
                <input
                  type="range" min={-10} max={10} step={0.1}
                  value={currentLight.position[axis as 'x' | 'y' | 'z']}
                  onChange={(e) => updateLight(currentLight.id, {
                    position: { ...currentLight.position, [axis]: parseFloat(e.target.value) }
                  })}
                  className="flex-1 accent-nebulae-purple h-1"
                />
                <span className="text-[10px] font-mono text-white/40 w-5 text-right">
                  {currentLight.position[axis as 'x' | 'y' | 'z'].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 氛围预设 */}
        <div>
          <p className="text-[10px] text-white/40 mb-2 font-mono">氛围预设</p>
          <div className="grid grid-cols-3 gap-1">
            {moodPresets.map(p => (
              <button
                key={p.name}
                onClick={() => setMood(p.name)}
                className={`p-1.5 rounded-lg text-[10px] transition-colors ${
                  mood === p.name ? 'bg-warning-gold/20 text-warning-gold border border-warning-gold/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[9px] text-white/30">{p.temp}K</div>
              </button>
            ))}
          </div>
          <div className="mt-2">
            <label className="text-[10px] text-white/50">时间: {timeOfDay === 'day' ? '白天' : timeOfDay === 'night' ? '夜晚' : timeOfDay === 'sunset' ? '黄昏' : '自动'}</label>
            <select
              className="cosmic-input text-xs h-7 mt-1"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            >
              <option value="auto">自动</option>
              <option value="day">白天</option>
              <option value="sunset">黄昏</option>
              <option value="night">夜晚</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}