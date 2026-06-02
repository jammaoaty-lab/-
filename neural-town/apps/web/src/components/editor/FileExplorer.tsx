'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore, type EditorFile } from '@/stores/editor-store';
import { CosmicButton } from '@/components/cosmic/CosmicButton';

interface FileNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileNode[];
  icon?: string;
  language?: string;
}

// Mock file tree structure
const FILE_TREE: FileNode[] = [
  {
    name: 'stellar-catalog',
    path: '/stellar-catalog',
    isFolder: true,
    children: [
      { name: 'src', path: '/stellar-catalog/src', isFolder: true, children: [
        { name: 'App.tsx', path: '/stellar-catalog/src/App.tsx', isFolder: false, icon: '⚛️', language: 'typescript' },
        { name: 'App.css', path: '/stellar-catalog/src/App.css', isFolder: false, icon: '🎨', language: 'css' },
        { name: 'index.tsx', path: '/stellar-catalog/src/index.tsx', isFolder: false, icon: '⚛️', language: 'typescript' },
        { name: 'components', path: '/stellar-catalog/src/components', isFolder: true, children: [
          { name: 'StarCard.tsx', path: '/stellar-catalog/src/components/StarCard.tsx', isFolder: false, icon: '⚛️', language: 'typescript' },
          { name: 'NebulaBg.tsx', path: '/stellar-catalog/src/components/NebulaBg.tsx', isFolder: false, icon: '⚛️', language: 'typescript' },
        ]},
        { name: 'utils', path: '/stellar-catalog/src/utils', isFolder: true, children: [
          { name: 'api.ts', path: '/stellar-catalog/src/utils/api.ts', isFolder: false, icon: '⚙️', language: 'typescript' },
          { name: 'constellations.ts', path: '/stellar-catalog/src/utils/constellations.ts', isFolder: false, icon: '⭐', language: 'typescript' },
        ]},
      ]},
      { name: 'public', path: '/stellar-catalog/public', isFolder: true, children: [
        { name: 'index.html', path: '/stellar-catalog/public/index.html', isFolder: false, icon: '🌐', language: 'html' },
        { name: 'favicon.svg', path: '/stellar-catalog/public/favicon.svg', isFolder: false, icon: '🖼️' },
      ]},
      { name: 'package.json', path: '/stellar-catalog/package.json', isFolder: false, icon: '📦', language: 'json' },
      { name: 'tsconfig.json', path: '/stellar-catalog/tsconfig.json', isFolder: false, icon: '⚙️', language: 'json' },
      { name: 'README.md', path: '/stellar-catalog/README.md', isFolder: false, icon: '📝', language: 'markdown' },
    ],
  },
];

const FOLDER_ICONS: Record<string, string> = {
  src: '📁',
  components: '🧩',
  utils: '🛠',
  public: '🌐',
};

export default function FileExplorer() {
  const { openFiles, openFile, activeFileId } = useEditorStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/stellar-catalog', '/stellar-catalog/src']));

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleFileClick = (node: FileNode) => {
    if (node.isFolder) {
      toggleFolder(node.path);
      return;
    }

    // Find the file from openFiles or create a new one
    const existingFile = openFiles.find((f) => f.path === node.path);
    if (existingFile) {
      openFile(existingFile);
      return;
    }

    // Create a new file entry (in real use, this would load from server)
    const newFile: EditorFile = {
      id: `file-${node.path.replace(/\//g, '-')}`,
      name: node.name,
      path: node.path,
      language: node.language || 'plaintext',
      icon: node.icon,
      isDirty: false,
      content: `// ${node.name}\n// Path: ${node.path}\n\n`,
    };
    openFile(newFile);
  };

  const renderTree = (nodes: FileNode[], depth: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isFileOpen = openFiles.some((f) => f.path === node.path);
      const isActive = openFiles.find((f) => f.path === node.path)?.id === activeFileId;

      return (
        <div key={node.path}>
          <div
            onClick={() => handleFileClick(node)}
            className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-xs transition-colors hover:bg-white/5 ${
              isActive ? 'bg-white/[0.07] text-white' : isFileOpen ? 'text-white/70' : 'text-white/50'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {/* Expand/collapse arrow for folders */}
            {node.isFolder && (
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] text-white/30 shrink-0"
              >
                ▶
              </motion.span>
            )}
            {!node.isFolder && <span className="w-3 shrink-0" />}

            {/* Icon */}
            <span className="text-xs shrink-0">
              {node.isFolder
                ? (isExpanded ? '📂' : FOLDER_ICONS[node.name] || '📁')
                : node.icon || '📄'}
            </span>

            {/* Name */}
            <span className={`truncate ${isActive ? 'text-[#B388FF]' : ''}`}>
              {node.name}
            </span>
          </div>

          {/* Children */}
          <AnimatePresence>
            {node.isFolder && isExpanded && node.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                {renderTree(node.children, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#030614]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1A1F35] shrink-0">
        <span className="text-[11px] font-display tracking-wider text-white/50 uppercase">
          星轨浏览器
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors" title="新建文件">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors" title="新建文件夹">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors" title="刷新">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {renderTree(FILE_TREE)}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#1A1F35] text-[10px] text-white/30">
        {openFiles.length} 个文件已打开
      </div>
    </div>
  );
}