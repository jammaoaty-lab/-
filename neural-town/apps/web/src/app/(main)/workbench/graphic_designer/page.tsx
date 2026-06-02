'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import InfiniteCanvas from '@/components/workbench/InfiniteCanvas';
import AIGenerationPanel from '@/components/workbench/AIGenerationPanel';
import ColorPalette from '@/components/workbench/ColorPalette';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

export default function GraphicDesignerWorkbench() {
  const meta = ROLES_META.graphic_designer;
  const [selectedColor, setSelectedColor] = useState('#6C5CE7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const handleAIGenerate = useCallback(async (prompt: string, style: string, negativePrompt: string) => {
    setIsGenerating(true);
    toast.loading('AI 正在生成...', { id: 'ai-gen' });
    try {
      const res = await fetch('/api/v1/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, negative_prompt: negativePrompt }),
      });
      const data = await res.json();
      toast.success('生成任务已提交', { id: 'ai-gen' });
    } catch {
      toast.error('生成失败', { id: 'ai-gen' });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* 工作台头部 */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setShowGrid(!showGrid)} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${showGrid ? 'border-nebulae-purple/50 text-nebulae-purple bg-nebulae-purple/10' : 'border-white/10 text-white/50'}`}>
            网格
          </button>
          <CosmicButton size="sm" onClick={() => toast.success('作品已保存')}>
            保存项目
          </CosmicButton>
          <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('准备发布到社区')}>
            发布到社区
          </CosmicButton>
        </div>
      </div>

      {/* 工作区 */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 左侧工具栏 */}
        <div className="w-12 border-r border-cosmic-border bg-space-card/50 flex flex-col items-center py-4 gap-2">
          {[
            { icon: '↖', label: '选择', tool: 'select' },
            { icon: 'T', label: '文字', tool: 'text' },
            { icon: '□', label: '形状', tool: 'rect' },
            { icon: '🎨', label: '颜色', tool: 'color' },
          ].map(({ icon, label, tool }) => (
            <button
              key={tool}
              className="w-9 h-9 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title={label}
            >
              <span className="text-sm">{icon}</span>
            </button>
          ))}
        </div>

        {/* 主画布 */}
        <div className="flex-1 relative">
          <InfiniteCanvas showGrid={showGrid} snapToGrid={snapToGrid} />
        </div>

        {/* 右侧面板 */}
        <div className="absolute right-3 top-3 space-y-3">
          <AIGenerationPanel
            onGenerate={handleAIGenerate}
            isLoading={isGenerating}
            placeholder="描述海报/Logo/版式设计..."
            title="AI 海报生成"
            styles={['minimalist', 'cyberpunk', 'vaporwave', 'brutalist', 'swiss', 'japanese']}
          />
          <ColorPalette
            onSelectColor={setSelectedColor}
            onSelectPalette={(colors) => setSelectedColor(colors[0])}
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
}