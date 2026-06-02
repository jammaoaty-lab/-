'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ComponentLibrary from '@/components/workbench/ComponentLibrary';
import DesignCanvas from '@/components/workbench/DesignCanvas';
import PrototypeConnector from '@/components/workbench/PrototypeConnector';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

export default function UIUXDesignerWorkbench() {
  const meta = ROLES_META.uiux_designer;
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPrototype, setShowPrototype] = useState(false);
  const [screens] = useState([
    { id: 'screen-1', name: '首页' },
    { id: 'screen-2', name: '详情页' },
    { id: 'screen-3', name: '设置页' },
  ]);
  const [currentScreen, setCurrentScreen] = useState('screen-1');

  const exportCSS = useCallback(() => {
    const css = `
/* Neural Town 设计系统导出 */
:root {
  --color-primary: #6C5CE7;
  --color-secondary: #00E5FF;
  --color-success: #00F2A9;
  --color-warning: #FFD166;
  --color-danger: #FF6B6B;
  --color-bg: #030614;
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 12px;
}
`.trim();
    navigator.clipboard.writeText(css).then(() => {
      toast.success('CSS 变量已复制到剪贴板');
    });
  }, []);

  const exportCode = useCallback(() => {
    const html = '<div class="container">...</div>';
    navigator.clipboard.writeText(html).then(() => {
      toast.success('HTML 代码已复制');
    });
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
          <select
            className="cosmic-input text-xs h-8 w-24"
            value={currentScreen}
            onChange={(e) => setCurrentScreen(e.target.value)}
          >
            {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button
            onClick={() => setShowPrototype(!showPrototype)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${showPrototype ? 'border-nebulae-purple/50 text-nebulae-purple bg-nebulae-purple/10' : 'border-white/10 text-white/50'}`}
          >
            {showPrototype ? '退出预览' : '原型预览'}
          </button>
          <CosmicButton size="sm" variant="secondary" onClick={exportCSS}>
            导出CSS
          </CosmicButton>
          <CosmicButton size="sm" variant="secondary" onClick={exportCode}>
            导出代码
          </CosmicButton>
          <CosmicButton size="sm" onClick={() => toast.success('准备发布')}>
            发布
          </CosmicButton>
        </div>
      </div>

      {/* 工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧组件库 */}
        <ComponentLibrary onDragStart={(comp) => console.log('Drag start:', comp.name)} />

        {/* 中央画布 */}
        <DesignCanvas device={device} />

        {/* 右侧原型面板 */}
        {showPrototype && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-cosmic-border overflow-hidden"
          >
            <PrototypeConnector screens={screens} />
          </motion.div>
        )}
      </div>
    </div>
  );
}