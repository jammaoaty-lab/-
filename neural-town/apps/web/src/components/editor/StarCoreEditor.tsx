'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/stores/editor-store';
import { registerCosmosThemes, getMonacoTheme } from './cosmosTheme';
import FileExplorer from './FileExplorer';
import AICodeCompanion from './AICodeCompanion';
import StatusBar from './StatusBar';
import TopMenuBar from './TopMenuBar';
import PreviewPanel from './PreviewPanel';

// Lazy load Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const FILE_ICONS: Record<string, string> = {
  typescript: '⚛️',
  tsx: '⚛️',
  javascript: '💛',
  jsx: '💛',
  css: '🎨',
  scss: '🎨',
  html: '🌐',
  json: '📦',
  python: '🐍',
  go: '🔵',
  rust: '🦀',
  sql: '🗄',
  sol: '⛓️',
  yaml: '⚙️',
  yml: '⚙️',
  markdown: '📝',
  md: '📝',
};

function getFileIcon(language: string): string {
  return FILE_ICONS[language] || '📄';
}

export default function StarCoreEditor() {
  const {
    tabs, openFiles, activeFileId,
    leftPanelOpen, rightPanelOpen, bottomPanelOpen,
    bottomPanelHeight, leftPanelWidth, rightPanelWidth,
    splitMode, editorTheme, diffMode, diffOriginal, diffModified,
    setActiveFile, closeFile, updateFileContent, saveFile,
    toggleLeftPanel, toggleRightPanel, toggleBottomPanel,
    seedDemoFiles,
  } = useEditorStore();

  const monacoRef = useRef<any>(null);

  // Seed demo files on first mount
  useEffect(() => {
    if (openFiles.length === 0) {
      seedDemoFiles();
    }
  }, []);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    monacoRef.current = monaco;
    registerCosmosThemes(monaco);

    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      cursorWidth: 2,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
      padding: { top: 12, bottom: 12 },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      matchBrackets: 'always',
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      tabSize: 2,
      insertSpaces: true,
    });

    // Keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        if (activeFileId) saveFile(activeFileId);
      },
    });
  }, [activeFileId, saveFile]);

  const handleChange = useCallback((value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  }, [activeFileId, updateFileContent]);

  const themeForMonaco = getMonacoTheme(editorTheme);
  const language = activeFile?.language || 'plaintext';

  return (
    <div className="h-full flex flex-col bg-[#030614] overflow-hidden">
      {/* Top Menu Bar */}
      <TopMenuBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Explorer */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-[#1A1F35] overflow-hidden shrink-0"
              style={{ width: leftPanelWidth }}
            >
              <FileExplorer />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center h-9 bg-[#060B1C] border-b border-[#1A1F35] overflow-x-auto shrink-0">
            {tabs.map((tab) => {
              const file = openFiles.find((f) => f.id === tab.fileId);
              if (!file) return null;
              const isActive = file.id === activeFileId;

              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1 h-full text-xs cursor-pointer border-r border-[#1A1F35] transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#030614] text-white border-t-2 border-t-[#6C5CE7]'
                      : 'text-white/50 hover:text-white/70 hover:bg-[#0A1020]'
                  }`}
                >
                  <span className="text-[10px]">{file.icon || getFileIcon(file.language)}</span>
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  {file.isDirty && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166]" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                    className="ml-1 p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Split mode toggle */}
            {tabs.length > 0 && (
              <div className="ml-auto flex items-center gap-1 pr-2">
                <button
                  onClick={() => toggleLeftPanel()}
                  className={`p-1 rounded text-xs ${leftPanelOpen ? 'text-[#6C5CE7]' : 'text-white/30'} hover:text-white transition-colors`}
                  title="切换文件面板"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleRightPanel()}
                  className={`p-1 rounded text-xs ${rightPanelOpen ? 'text-[#00E5FF]' : 'text-white/30'} hover:text-white transition-colors`}
                  title="AI 伴侣"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Editor */}
          {activeFile ? (
            <div className="flex-1 relative">
              <MonacoEditor
                height="100%"
                language={language}
                value={activeFile.content}
                theme={themeForMonaco}
                onChange={handleChange}
                onMount={handleEditorMount}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-white/40">正在传输到母舰...</span>
                    </div>
                  </div>
                }
                options={{
                  readOnly: false,
                }}
              />
              {/* Diff mode overlay */}
              {diffMode && (
                <div className="absolute top-2 right-4 z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1020] border border-[#6C5CE7]/40 text-xs">
                    <span className="text-[#FFD166]">差异对比模式</span>
                    <button
                      onClick={() => useEditorStore.getState().setDiffMode(false)}
                      className="text-white/50 hover:text-white"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🌌</div>
                <h2 className="text-xl font-display text-gradient mb-2">星核编辑器</h2>
                <p className="text-white/40 text-sm">
                  从左侧文件浏览器打开一个文件，开始编码
                </p>
                <p className="text-white/20 text-xs mt-1">
                  Ctrl+Shift+P 打开命令面板
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - AI Companion */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-[#1A1F35] overflow-hidden shrink-0"
              style={{ width: rightPanelWidth }}
            >
              <AICodeCompanion />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel */}
      <AnimatePresence>
        {bottomPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: bottomPanelHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#1A1F35] overflow-hidden shrink-0"
            style={{ height: bottomPanelHeight }}
          >
            <PreviewPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}