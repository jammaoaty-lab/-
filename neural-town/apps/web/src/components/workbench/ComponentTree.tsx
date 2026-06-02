'use client';

import { useState, useCallback } from 'react';

interface TreeNode {
  id: string;
  name: string;
  type: string;
  tag: string;
  props: Record<string, string>;
  children: TreeNode[];
  expanded: boolean;
}

const INITIAL_TREE: TreeNode[] = [
  { id: 'root', name: 'App', type: 'component', tag: 'div', props: { className: 'app' }, children: [
    { id: 'header', name: 'Header', type: 'component', tag: 'header', props: { className: 'header' }, children: [
      { id: 'logo', name: 'Logo', type: 'element', tag: 'img', props: { src: '/logo.png', alt: 'Logo' }, children: [], expanded: true },
      { id: 'nav', name: 'NavMenu', type: 'component', tag: 'nav', props: { className: 'nav' }, children: [], expanded: true },
    ], expanded: true },
    { id: 'main', name: 'MainContent', type: 'component', tag: 'main', props: { className: 'content' }, children: [
      { id: 'hero', name: 'HeroSection', type: 'component', tag: 'section', props: { className: 'hero' }, children: [], expanded: true },
      { id: 'list', name: 'ItemList', type: 'component', tag: 'ul', props: { className: 'grid' }, children: [], expanded: true },
    ], expanded: true },
    { id: 'footer', name: 'Footer', type: 'component', tag: 'footer', props: { className: 'footer' }, children: [], expanded: true },
  ], expanded: true },
];

interface ComponentTreeProps {
  tree?: TreeNode[];
  onTreeChange?: (tree: TreeNode[]) => void;
  onSelectNode?: (node: TreeNode) => void;
}

export function ComponentTree({ tree: propTree, onTreeChange, onSelectNode }: ComponentTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>(propTree || INITIAL_TREE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const update = (nodes: TreeNode[]): TreeNode[] => nodes.map(n => {
      if (n.id === id) return { ...n, expanded: !n.expanded };
      if (n.children) return { ...n, children: update(n.children) };
      return n;
    });
    const updated = update(tree);
    setTree(updated);
    onTreeChange?.(updated);
  };

  const selectNode = (node: TreeNode) => {
    setSelectedId(node.id);
    onSelectNode?.(node);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isSelected = selectedId === node.id;
    const hasChildren = node.children.length > 0;
    const tagColors: Record<string, string> = {
      div: '#6C5CE7', section: '#00E5FF', header: '#FFD166', main: '#00F2A9',
      footer: '#FF6B6B', nav: '#E040FB', ul: '#FFD166', img: '#00E5FF',
    };

    return (
      <div key={node.id} className="select-none">
        <div
          draggable
          onDragStart={() => setDragId(node.id)}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={() => { setDragId(null); }}
          onClick={() => selectNode(node)}
          className={`flex items-center gap-1.5 py-1 px-1 rounded cursor-pointer text-xs group transition-colors ${
            isSelected ? 'bg-nebulae-purple/20 border border-nebulae-purple/30' : 'hover:bg-white/5'
          }`}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="w-4 text-center text-white/40 hover:text-white">
              {node.expanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: (tagColors[node.tag] || '#666') + '30', color: tagColors[node.tag] || '#aaa' }}>
            &lt;{node.tag}&gt;
          </span>
          <span className="text-white/70 truncate flex-1 font-mono text-[11px]">{node.name}</span>
          {node.type === 'component' && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-nebulae-purple/10 text-nebulae-purple ml-auto">C</span>
          )}
        </div>
        {hasChildren && node.expanded && (
          <div>{node.children.map(child => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-cosmic-border flex items-center justify-between">
        <h3 className="text-xs font-mono text-white/60 uppercase">组件树</h3>
        <div className="flex gap-1">
          <button className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 text-white/50">全展开</button>
          <button className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 text-white/50">全折叠</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
}