'use client';

import { useState } from 'react';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { CosmicCard } from '@/components/cosmic/CosmicCard';

interface AIGenerationPanelProps {
  onGenerate: (prompt: string, style: string, negativePrompt: string) => void;
  styles?: string[];
  isLoading?: boolean;
  placeholder?: string;
  title?: string;
}

export default function AIGenerationPanel({
  onGenerate,
  styles = ['cinematic', 'minimalist', 'cyberpunk', 'vaporwave', 'fantasy', 'realistic'],
  isLoading = false,
  placeholder = '描述你想要生成的内容...',
  title = 'AI 生成',
}: AIGenerationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(styles[0]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, style, negativePrompt);
    }
  };

  return (
    <CosmicCard padding="sm" className="w-72">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left text-sm font-medium text-white/80 hover:text-white"
      >
        <span className="text-nebulae-purple">✦</span> {title}
        <span className="ml-auto text-white/30 text-xs">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <textarea
              className="cosmic-input text-xs h-20 resize-none"
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 font-mono uppercase">风格</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {styles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    style === s ? 'bg-nebulae-purple/30 text-nebulae-purple border border-nebulae-purple/50' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              className="cosmic-input text-xs h-8"
              placeholder="负面提示词（可选）"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          <CosmicButton type="submit" size="sm" className="w-full" isLoading={isLoading}>
            生成
          </CosmicButton>
        </form>
      )}
    </CosmicCard>
  );
}