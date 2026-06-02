'use client';

import { useState } from 'react';

const PRESET_PALETTES = [
  { name: '星云紫', colors: ['#6C5CE7', '#A29BFE', '#2D1B69'] },
  { name: 'AI蓝', colors: ['#00E5FF', '#0097A7', '#004D66'] },
  { name: '霓虹', colors: ['#FF6B6B', '#FFD166', '#00F2A9', '#00E5FF'] },
  { name: '暗夜', colors: ['#1A1A2E', '#16213E', '#0F3460', '#533483'] },
  { name: '晨曦', colors: ['#FFEAA7', '#FDCB6E', '#E17055', '#D63031'] },
  { name: '森林', colors: ['#00B894', '#55EFC4', '#81ECEC'] },
];

interface ColorPaletteProps {
  onSelectColor: (color: string) => void;
  onSelectPalette: (colors: string[]) => void;
  selectedColor: string;
}

export default function ColorPalette({ onSelectColor, onSelectPalette, selectedColor }: ColorPaletteProps) {
  const [customColor, setCustomColor] = useState('#6C5CE7');

  return (
    <div className="glass-panel p-3 w-56">
      <h3 className="text-xs font-mono text-white/60 uppercase mb-3">配色方案</h3>

      {/* 预设调色板 */}
      <div className="space-y-2 mb-4">
        {PRESET_PALETTES.map((palette) => (
          <button
            key={palette.name}
            onClick={() => onSelectPalette(palette.colors)}
            className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              {palette.colors.map((c) => (
                <div key={c} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
              ))}
              <span className="text-xs text-white/50 group-hover:text-white/80">{palette.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 自定义颜色 */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => { setCustomColor(e.target.value); onSelectColor(e.target.value); }}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
        <span className="text-xs text-white/40 font-mono">{customColor}</span>
      </div>
    </div>
  );
}