import { create } from 'zustand';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isDirty: boolean;
  icon?: string;
}

export interface EditorTab {
  id: string;
  fileId: string;
  isActive: boolean;
  isPinned: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlock?: string;
  timestamp: string;
}

export type AIPersona = 'engineer' | 'creator' | 'mentor';

export type EditorTheme = 'deep-space' | 'quasar-dark' | 'white-hole';

interface EditorState {
  // Tabs
  tabs: EditorTab[];
  openFiles: EditorFile[];
  activeFileId: string | null;

  // Layout
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
  leftPanelWidth: number;
  rightPanelWidth: number;
  splitMode: 'none' | 'horizontal' | 'vertical';

  // AI
  aiPersona: AIPersona;
  chatMessages: ChatMessage[];
  isAIGenerating: boolean;

  // Theme
  editorTheme: EditorTheme;

  // Preview
  previewUrl: string | null;
  terminalOutput: string[];

  // Diff
  diffMode: boolean;
  diffOriginal: string;
  diffModified: string;

  // Actions
  openFile: (file: EditorFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setSplitMode: (mode: 'none' | 'horizontal' | 'vertical') => void;
  setEditorTheme: (theme: EditorTheme) => void;
  setAIPersona: (persona: AIPersona) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setAIGenerating: (generating: boolean) => void;
  appendTerminalOutput: (line: string) => void;
  clearTerminal: () => void;
  setDiffMode: (enabled: boolean, original?: string, modified?: string) => void;
  setPreviewUrl: (url: string | null) => void;
  seedDemoFiles: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  openFiles: [],
  activeFileId: null,
  leftPanelOpen: true,
  rightPanelOpen: false,
  bottomPanelOpen: false,
  bottomPanelHeight: 200,
  leftPanelWidth: 240,
  rightPanelWidth: 320,
  splitMode: 'none',
  aiPersona: 'creator',
  chatMessages: [],
  isAIGenerating: false,
  editorTheme: 'deep-space',
  previewUrl: null,
  terminalOutput: [],
  diffMode: false,
  diffOriginal: '',
  diffModified: '',

  openFile: (file) => {
    const state = get();
    // Check if already open
    const existingTab = state.tabs.find((t) => t.fileId === file.id);
    if (existingTab) {
      set({ activeFileId: file.id });
      return;
    }

    const newTab: EditorTab = {
      id: `tab-${file.id}`,
      fileId: file.id,
      isActive: true,
      isPinned: false,
    };

    // Deactivate other tabs
    const updatedTabs = state.tabs.map((t) => ({ ...t, isActive: false }));

    set({
      tabs: [...updatedTabs, newTab],
      openFiles: state.openFiles.some((f) => f.id === file.id)
        ? state.openFiles
        : [...state.openFiles, file],
      activeFileId: file.id,
    });
  },

  closeFile: (fileId) => {
    const state = get();
    const newTabs = state.tabs.filter((t) => t.fileId !== fileId);
    const newFiles = state.openFiles.filter((f) => f.id !== fileId);
    const newActiveId =
      state.activeFileId === fileId
        ? newTabs.length > 0
          ? newTabs[newTabs.length - 1].fileId
          : null
        : state.activeFileId;

    // If there are remaining tabs, activate the last one
    if (newActiveId && newTabs.length > 0) {
      const idx = newTabs.findIndex((t) => t.fileId === newActiveId);
      if (idx >= 0) {
        newTabs[idx] = { ...newTabs[idx], isActive: true };
      }
    }

    set({ tabs: newTabs, openFiles: newFiles, activeFileId: newActiveId });
  },

  setActiveFile: (fileId) => {
    set({
      activeFileId: fileId,
      tabs: get().tabs.map((t) => ({
        ...t,
        isActive: t.fileId === fileId,
      })),
    });
  },

  updateFileContent: (fileId, content) => {
    set({
      openFiles: get().openFiles.map((f) =>
        f.id === fileId ? { ...f, content, isDirty: true } : f
      ),
    });
  },

  saveFile: (fileId) => {
    set({
      openFiles: get().openFiles.map((f) =>
        f.id === fileId ? { ...f, isDirty: false } : f
      ),
    });
  },

  toggleLeftPanel: () => set({ leftPanelOpen: !get().leftPanelOpen }),
  toggleRightPanel: () => set({ rightPanelOpen: !get().rightPanelOpen }),
  toggleBottomPanel: () => set({ bottomPanelOpen: !get().bottomPanelOpen }),

  setSplitMode: (mode) => set({ splitMode: mode }),
  setEditorTheme: (theme) => set({ editorTheme: theme }),
  setAIPersona: (persona) => set({ aiPersona: persona }),

  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    set({ chatMessages: [...get().chatMessages, newMessage] });
  },

  setAIGenerating: (generating) => set({ isAIGenerating: generating }),
  appendTerminalOutput: (line) => set({ terminalOutput: [...get().terminalOutput, line] }),
  clearTerminal: () => set({ terminalOutput: [] }),

  setDiffMode: (enabled, original, modified) =>
    set({
      diffMode: enabled,
      diffOriginal: original || '',
      diffModified: modified || '',
    }),

  setPreviewUrl: (url) => set({ previewUrl: url }),

  seedDemoFiles: () => {
    const demoFiles: EditorFile[] = [
      {
        id: 'file-1',
        name: 'App.tsx',
        path: 'src/App.tsx',
        language: 'typescript',
        icon: '⚛️',
        isDirty: false,
        content: `import { useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';

interface StarCardProps {
  title: string;
  description: string;
  constellation: string;
}

function StarCard({ title, description, constellation }: StarCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="cosmic-card"
      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(108, 92, 231, 0.3)' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="card-header">
        <span className="constellation-badge">{constellation}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      <motion.p
        className="card-description"
        animate={{ height: isExpanded ? 'auto' : '48px' }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export default function App() {
  const stars = [
    { title: '猎户座星云', description: '一个充满活力的恒星形成区...', constellation: '猎户座' },
    { title: '仙女座星系', description: '距离我们最近的螺旋星系...', constellation: '仙女座' },
    { title: '创生之柱', description: '鹰状星云中的星际气体和尘埃柱...', constellation: '巨蛇座' },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌌 星际图鉴</h1>
        <p className="subtitle">探索宇宙中最壮丽的星云</p>
      </header>
      <main className="star-grid">
        {stars.map((star) => (
          <StarCard key={star.title} {...star} />
        ))}
      </main>
    </div>
  );
}`,
      },
      {
        id: 'file-2',
        name: 'App.css',
        path: 'src/App.css',
        language: 'css',
        icon: '🎨',
        isDirty: false,
        content: `/* Cosmic UI - Star Catalog Styles */
:root {
  --space-deep: #030614;
  --nebulae-purple: #6C5CE7;
  --ai-blue: #00E5FF;
  --stellar-gold: #FFD166;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--space-deep);
  color: #F0F3FA;
  font-family: 'Space Grotesk', sans-serif;
  min-height: 100vh;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
}

.app-header h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, var(--nebulae-purple), var(--ai-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
}

.star-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cosmic-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(108, 92, 231, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cosmic-card:hover {
  background: rgba(108, 92, 231, 0.08);
  border-color: rgba(108, 92, 231, 0.4);
}

.constellation-badge {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(108, 92, 231, 0.15);
  color: var(--nebulae-purple);
  border-radius: 20px;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.6;
  overflow: hidden;
}`,
      },
      {
        id: 'file-3',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        icon: '📦',
        isDirty: false,
        content: `{
  "name": "stellar-catalog",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}`,
      },
    ];

    const tabs: EditorTab[] = demoFiles.map((f, i) => ({
      id: `tab-${f.id}`,
      fileId: f.id,
      isActive: i === 0,
      isPinned: false,
    }));

    set({
      openFiles: demoFiles,
      tabs,
      activeFileId: 'file-1',
      chatMessages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: '欢迎来到星核编辑器！我是你的 AI 代码伴侣。我可以帮你解释代码、生成组件、重构优化，或者回答任何编程问题。试试选中一段代码，右键点击看看我能做什么 🚀',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },
}));