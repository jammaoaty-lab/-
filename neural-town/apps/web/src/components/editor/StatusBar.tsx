'use client';

import { useEditorStore } from '@/stores/editor-store';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import toast from 'react-hot-toast';

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  tsx: 'TypeScript React',
  javascript: 'JavaScript',
  jsx: 'JavaScript React',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  json: 'JSON',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  sol: 'Solidity',
  markdown: 'Markdown',
  plaintext: '纯文本',
};

const THEME_INFO = {
  'deep-space': { name: '深空星云', icon: '🌌' },
  'quasar-dark': { name: '类星体暗', icon: '⭐' },
  'white-hole': { name: '白洞亮', icon: '💫' },
};

function StatusBar({ editorTheme: _theme }: { editorTheme?: string }) {
  // This is standalone, reads directly from store
  return <StatusBarInner />;
}

function StatusBarInner() {
  const {
    openFiles, activeFileId, editorTheme, isAIGenerating,
    bottomPanelOpen, toggleBottomPanel,
    setEditorTheme,
  } = useEditorStore();

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const language = activeFile?.language || '—';
  const lineCount = activeFile ? activeFile.content.split('\n').length : 0;
  const themeInfo = THEME_INFO[editorTheme] || THEME_INFO['deep-space'];

  const handleCompile = () => {
    toast.success('编译完成！', { icon: '⚡', style: { background: '#0D1020', color: '#B388FF', border: '1px solid #6C5CE7' } });
  };

  const handleCollaborate = () => {
    toast('实时协作模式即将上线', { icon: '🛸', style: { background: '#0D1020', color: '#00E5FF', border: '1px solid #00E5CE7' } });
  };

  const handlePublish = () => {
    toast.success('项目已发布到社区星云！', { icon: '🌟', style: { background: '#0D1020', color: '#FFD166', border: '1px solid #FFD166' } });
  };

  return (
    <div className="h-7 bg-[#060B1C] border-t border-[#1A1F35] flex items-center px-3 text-[10px] text-white/40 shrink-0">
      {/* Left Side - File Info */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-white/70 transition-colors">
            <span>{themeInfo.icon}</span>
            <span>{themeInfo.name}</span>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Theme dropdown */}
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block">
            <div className="bg-[#0D1020] border border-[#2A2F45] rounded-lg overflow-hidden shadow-xl">
              {(Object.entries(THEME_INFO) as [string, { name: string; icon: string }][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setEditorTheme(key as any)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs whitespace-nowrap hover:bg-white/5 transition-colors ${
                    editorTheme === key ? 'text-white' : 'text-white/50'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeFile && (
          <>
            <span className="text-white/20">|</span>
            <span>行 {lineCount}</span>
            <span className="text-white/20">|</span>
            <span>{LANGUAGE_LABELS[language] || language}</span>
            <span className="text-white/20">|</span>
            <span>UTF-8</span>
            <span className="text-white/20">|</span>
            <span>空格: 2</span>
          </>
        )}
      </div>

      {/* Center - AI Status */}
      <div className="flex-1 flex justify-center">
        {isAIGenerating && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-[#00E5FF]">AI 思考中...</span>
          </div>
        )}
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-1.5">
        {/* Terminal Toggle */}
        <button
          onClick={toggleBottomPanel}
          className={`px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors ${bottomPanelOpen ? 'text-[#6C5CE7]' : ''}`}
          title="终端"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <span className="text-white/20">|</span>

        <button onClick={handleCompile} className="px-2 py-0.5 rounded hover:bg-[#00F2A9]/10 text-[#00F2A9] hover:text-[#00F2A9]/80 transition-colors flex items-center gap-1">
          <span>⚡</span>
          <span>光速编译</span>
        </button>

        <span className="text-white/20">|</span>

        <button onClick={handleCollaborate} className="px-2 py-0.5 rounded hover:bg-[#00E5FF]/10 text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors flex items-center gap-1">
          <span>🛸</span>
          <span>实时协作</span>
        </button>

        <span className="text-white/20">|</span>

        <button onClick={handlePublish} className="px-2 py-0.5 rounded hover:bg-[#FFD166]/10 text-[#FFD166] hover:text-[#FFD166]/80 transition-colors flex items-center gap-1 font-medium">
          <span>🌟</span>
          <span>发布</span>
        </button>
      </div>
    </div>
  );
}

export default StatusBar;