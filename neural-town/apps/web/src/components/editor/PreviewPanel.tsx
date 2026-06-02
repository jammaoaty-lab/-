'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import toast from 'react-hot-toast';

type PreviewTab = 'terminal' | 'output' | 'problems' | 'preview';

export default function PreviewPanel() {
  const { terminalOutput, appendTerminalOutput, clearTerminal, activeFileId, openFiles } = useEditorStore();
  const [activeTab, setActiveTab] = useState<PreviewTab>('terminal');
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  // Focus input on mount
  useEffect(() => {
    if (activeTab === 'terminal') {
      inputRef.current?.focus();
    }
  }, [activeTab]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    appendTerminalOutput(`$ ${cmd}`);

    // Simulate command execution
    const commands: Record<string, string[]> = {
      'npm run dev': ['> stellar-catalog@1.0.0 dev', '> vite', '', '  VITE v5.0.0  ready in 342ms', '', '  ➜  Local:   http://localhost:5173/', '  ➜  Network: http://192.168.1.5:5173/', '  ➜  press h + enter to show help'],
      'npm run build': ['> stellar-catalog@1.0.0 build', '> tsc && vite build', '', '✓ 42 modules transformed.', '✓ built in 2.15s', '', 'dist/index.html        0.45 kB', 'dist/assets/index.css  1.23 kB', 'dist/assets/index.js   42.81 kB'],
      'npm test': ['PASS  src/components/StarCard.test.tsx', '  ✓ renders title correctly (23ms)', '  ✓ expands on click (15ms)', '  ✓ matches snapshot (8ms)', '', 'Tests: 3 passed, 3 total', 'Time: 1.234s'],
      'ls': ['src/', 'public/', 'package.json', 'tsconfig.json', 'README.md', 'node_modules/'],
      'pwd': ['/stellar-catalog'],
      'clear': [],
    };

    setTimeout(() => {
      if (cmd === 'clear') {
        clearTerminal();
      } else if (commands[cmd]) {
        commands[cmd].forEach((line) => appendTerminalOutput(line));
      } else {
        appendTerminalOutput(`command not found: ${cmd}`);
      }
    }, 300);

    setCommandInput('');
  };

  const tabs: { key: PreviewTab; label: string; icon: string }[] = [
    { key: 'terminal', label: '终端', icon: '⬛' },
    { key: 'output', label: '输出', icon: '📤' },
    { key: 'problems', label: '问题', icon: '⚠️' },
    { key: 'preview', label: '预览', icon: '👁️' },
  ];

  // Mock problems
  const problems = [
    { type: 'warning', file: 'App.tsx', line: 12, message: '已声明 "unusedVar"，但从未读取其值。', code: 'ts(6133)' },
    { type: 'info', file: 'StarCard.tsx', line: 8, message: '可将此转换为异步函数。', code: 'ts(80006)' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#030614]">
      {/* Tab Bar */}
      <div className="flex items-center h-7 bg-[#060B1C] border-b border-[#1A1F35] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 px-3 h-full text-[10px] border-r border-[#1A1F35] transition-colors ${
              activeTab === tab.key
                ? 'bg-[#030614] text-white border-t border-t-[#6C5CE7]'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center pr-2">
          <button
            onClick={() => clearTerminal()}
            className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="清空终端"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Terminal */}
        {activeTab === 'terminal' && (
          <div className="p-2 font-mono text-xs">
            <div className="mb-3">
              <span className="text-[#00F2A9]">✦</span>
              <span className="text-white/50"> 星核终端 v1.0 | 输入命令开始...</span>
            </div>

            {terminalOutput.length === 0 ? (
              <div className="text-white/30">
                <p>提示：试试这些命令</p>
                <p className="mt-1">  <span className="text-[#6C5CE7]">npm run dev</span>  — 启动开发服务器</p>
                <p>  <span className="text-[#6C5CE7]">npm run build</span> — 构建生产版本</p>
                <p>  <span className="text-[#6C5CE7]">npm test</span>      — 运行测试</p>
                <p>  <span className="text-[#6C5CE7]">clear</span>         — 清空终端</p>
              </div>
            ) : (
              terminalOutput.map((line, i) => (
                <div key={i} className={`leading-relaxed ${
                  line.startsWith('$') ? 'text-[#00E5FF] mt-1' :
                  line.startsWith('✓') || line.startsWith('PASS') ? 'text-[#00F2A9]' :
                  line.startsWith('✗') || line.startsWith('FAIL') ? 'text-[#FF6B6B]' :
                  line.includes('successfully') || line.includes('passed') ? 'text-[#00F2A9]' :
                  line.includes('error') || line.includes('fail') ? 'text-[#FF6B6B]' :
                  'text-[#C5CDE0]/80'
                }`}>
                  {line}
                </div>
              ))
            )}

            <div ref={terminalEndRef} />

            {/* Command Input */}
            <form onSubmit={handleCommand} className="flex items-center mt-2">
              <span className="text-[#00E5FF] mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#C5CDE0] font-mono text-xs"
                placeholder="输入命令..."
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          </div>
        )}

        {/* Output */}
        {activeTab === 'output' && (
          <div className="p-3 text-xs text-white/50">
            <p className="text-white/70 mb-2">运行输出将显示在这里</p>
            <p>点击状态栏的 ⚡ 光速编译 按钮运行当前项目</p>
          </div>
        )}

        {/* Problems */}
        {activeTab === 'problems' && (
          <div className="p-2">
            {problems.length === 0 ? (
              <div className="flex items-center gap-2 p-4 text-xs text-[#00F2A9]">
                <span>✅</span>
                <span>没有发现任何问题</span>
              </div>
            ) : (
              problems.map((problem, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <span className={
                    problem.type === 'warning' ? 'text-[#FFD166]' : 'text-[#00E5FF]'
                  }>
                    {problem.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <span className="text-white/80">{problem.message}</span>
                  <span className="text-white/30 ml-auto shrink-0">
                    {problem.file}:{problem.line}
                  </span>
                  <span className="text-white/20 text-[10px]">{problem.code}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Preview */}
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <p className="text-sm text-white/40">内嵌预览</p>
              <p className="text-xs text-white/20 mt-1">
                {activeFile
                  ? `打开 ${activeFile.name} 的 Web 预览（需要连接开发服务器）`
                  : '打开一个前端文件以预览'}
              </p>
              <button
                onClick={() => { toast.success('开发服务器已启动！', { icon: '🚀' }); }}
                className="mt-3 px-3 py-1 rounded-lg bg-[#6C5CE7]/20 border border-[#6C5CE7]/40 text-xs text-[#B388FF] hover:bg-[#6C5CE7]/30 transition-colors"
              >
                启动预览服务
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}