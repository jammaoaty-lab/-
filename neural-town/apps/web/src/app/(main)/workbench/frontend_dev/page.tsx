'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { StarCoreEditor } from '@/components/editor';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

type ExportFormat = 'react' | 'vue' | 'html';

export default function FrontendDevWorkbench() {
  const meta = ROLES_META.frontend_dev;
  const [exportFormat, setExportFormat] = useState<ExportFormat>('react');

  const handleAIDesignToCode = () => {
    toast.loading('AI 分析设计稿...', { id: 'ai-code' });
    setTimeout(() => toast.success('已生成 React 组件代码', { id: 'ai-code' }), 1500);
  };

  const handleExport = () => {
    toast.success(`${exportFormat.toUpperCase()} 代码已复制`, { icon: '📋' });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-cosmic-border bg-space-card/80 shrink-0">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description} — 由星核编辑器驱动</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleAIDesignToCode}
            className="px-3 py-1.5 rounded-lg text-xs border border-nebulae-purple/30 text-nebulae-purple hover:bg-nebulae-purple/10 transition-colors"
          >
            🤖 AI 设计稿转代码
          </button>
          <select
            className="cosmic-input text-xs h-7 w-20"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="html">HTML</option>
          </select>
          <CosmicButton size="sm" variant="secondary" onClick={handleExport}>
            导出代码
          </CosmicButton>
          <CosmicButton size="sm" onClick={() => toast.success('已发布到 #dev 频道', { icon: '🌟' })}>
            发布
          </CosmicButton>
        </div>
      </div>

      {/* Star Core Editor - fills the remaining space */}
      <div className="flex-1 min-h-0">
        <StarCoreEditor />
      </div>
    </div>
  );
}