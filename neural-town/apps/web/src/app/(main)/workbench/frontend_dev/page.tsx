'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ComponentTree } from '@/components/workbench/ComponentTree';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

const DEV_SNIPPETS: Record<string, string> = {
  'header': `function Header() {\n  return (\n    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">\n      <h1 className="text-xl font-bold">My App</h1>\n      <nav className="flex gap-4">\n        <a href="#" className="hover:text-indigo-400">Home</a>\n        <a href="#" className="hover:text-indigo-400">About</a>\n      </nav>\n    </header>\n  );\n}`,
  'hero': `function HeroSection() {\n  return (\n    <section className="text-center py-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">\n      <h2 className="text-4xl font-bold">Welcome</h2>\n      <p className="mt-4 text-lg text-gray-300">Build amazing things</p>\n      <button className="mt-6 px-8 py-3 bg-indigo-500 rounded-xl hover:bg-indigo-600">Get Started</button>\n    </section>\n  );\n}`,
  'root': `export default function App() {\n  return (\n    <div className="min-h-screen bg-gray-50">\n      <Header />\n      <HeroSection />\n      <Footer />\n    </div>\n  );\n}`,
};

type ExportFormat = 'react' | 'vue' | 'html';

export default function FrontendDevWorkbench() {
  const meta = ROLES_META.frontend_dev;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('react');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showCode, setShowCode] = useState(true);
  const [generatedCode, setGeneratedCode] = useState(DEV_SNIPPETS.root);

  const code = selectedNode ? (DEV_SNIPPETS[selectedNode.id] || `// ${selectedNode.name} component`) : generatedCode;

  const convertFormat = (code: string, format: ExportFormat) => {
    if (format === 'vue') return code.replace(/function\s+(\w+)/g, '<script setup>\n// $1').replace(/return\s*\(/, '<template>\n  ').replace(/\);?\s*\}/, '</template>\n</script>');
    if (format === 'html') return code.replace(/className=/g, 'class=').replace(/function\s+\w+\(\)\s*\{[\s\S]*?return\s*\(/, '').replace(/\);?\s*\}/, '');
    return code;
  };

  const handleExport = () => {
    const converted = convertFormat(code, exportFormat);
    navigator.clipboard.writeText(converted).then(() => toast.success(`${exportFormat.toUpperCase()} 代码已复制`));
  };

  const handleAIDesignToCode = () => {
    toast.loading('AI 分析设计稿...', { id: 'ai-code' });
    setTimeout(() => toast.success('已生成 React 组件代码', { id: 'ai-code' }), 1500);
  };

  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={handleAIDesignToCode} className="px-3 py-1.5 rounded-lg text-xs border border-nebulae-purple/30 text-nebulae-purple hover:bg-nebulae-purple/10 transition-colors">
            🤖 AI 设计稿转代码
          </button>
          <select className="cosmic-input text-xs h-7 w-20" value={exportFormat} onChange={(e) => setExportFormat(e.target.value as ExportFormat)}>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="html">HTML</option>
          </select>
          <CosmicButton size="sm" variant="secondary" onClick={handleExport}>导出代码</CosmicButton>
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #dev 频道')}>发布</CosmicButton>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：组件树 + 组件库 */}
        <div className="w-56 border-r border-cosmic-border bg-space-card/50 flex flex-col">
          <ComponentTree onSelectNode={setSelectedNode} />
          <div className="p-2 border-t border-cosmic-border">
            <p className="text-[10px] text-white/40 font-mono mb-1">拖拽组件</p>
            <div className="flex flex-wrap gap-1">
              {['div', 'section', 'button', 'input', 'img', 'span'].map(tag => (
                <button key={tag} draggable className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10 text-white/50 border border-white/5">
                  &lt;{tag}&gt;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 中央：代码/预览 */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-cosmic-border bg-space-card/30">
            <button onClick={() => setShowCode(!showCode)} className={`px-2 py-0.5 rounded text-xs ${showCode ? 'bg-nebulae-purple/20 text-nebulae-purple' : 'text-white/50'}`}>
              代码
            </button>
            <div className="flex-1" />
            {(['desktop', 'tablet', 'mobile'] as const).map(d => (
              <button key={d} onClick={() => setDeviceView(d)} className={`px-2 py-0.5 rounded text-xs ${deviceView === d ? 'bg-white/10 text-white' : 'text-white/50'}`}>
                {d === 'desktop' ? '🖥' : d === 'tablet' ? '📱' : '📱'}
              </button>
            ))}
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="px-2 py-0.5 rounded text-xs text-white/50 hover:text-white">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {showCode && (
              <div className="flex-1 overflow-auto p-4 bg-[#0a0a14] font-mono text-sm">
                <pre className="text-green-400 text-xs leading-relaxed">
                  <code>{code}</code>
                </pre>
              </div>
            )}
            <div className="border-l border-cosmic-border flex-1 flex items-start justify-center p-4 bg-[#1a1a2e] overflow-auto">
              <div className="rounded-lg border border-white/10 bg-white text-black shadow-2xl transition-all duration-300" style={{ width: deviceWidths[deviceView] }}>
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] text-gray-400">localhost:3000</span>
                </div>
                <div className="min-h-[200px] flex items-center justify-center text-gray-400 text-sm p-8">
                  <div className="text-center">
                    <p>组件预览区域</p>
                    <p className="text-xs mt-1 text-gray-300">选择组件树节点查看代码和预览</p>
                    {selectedNode && (
                      <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <span className="text-xs font-mono text-indigo-600">{selectedNode.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}