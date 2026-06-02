'use client';

import { useState } from 'react';

interface UIComponent {
  id: string;
  name: string;
  icon: string;
  category: string;
  defaultProps: Record<string, unknown>;
  html: string;
}

const COMPONENTS: UIComponent[] = [
  { id: 'btn-primary', name: '主按钮', icon: '▶', category: '按钮', defaultProps: { text: '按钮', variant: 'primary', size: 'md' }, html: '<button class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">按钮</button>' },
  { id: 'btn-secondary', name: '次按钮', icon: '▷', category: '按钮', defaultProps: { text: '按钮', variant: 'secondary', size: 'md' }, html: '<button class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">按钮</button>' },
  { id: 'input-text', name: '文本输入', icon: '✎', category: '表单', defaultProps: { placeholder: '输入文字...', label: '标签' }, html: '<div><label class="block text-sm mb-1">标签</label><input class="w-full px-3 py-2 border rounded-lg" placeholder="输入文字..."/></div>' },
  { id: 'input-search', name: '搜索框', icon: '🔍', category: '表单', defaultProps: { placeholder: '搜索...' }, html: '<div class="relative"><input class="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder="搜索..."/><span class="absolute left-3 top-2.5">🔍</span></div>' },
  { id: 'card-default', name: '卡片', icon: '▢', category: '布局', defaultProps: { title: '标题', body: '内容', image: '' }, html: '<div class="rounded-xl border p-4 shadow-sm"><h3 class="font-semibold">标题</h3><p class="text-gray-500 text-sm">内容</p></div>' },
  { id: 'card-image', name: '图片卡片', icon: '🖼', category: '布局', defaultProps: { title: '标题', image: '', body: '描述' }, html: '<div class="rounded-xl border shadow-sm overflow-hidden"><img src="" class="w-full h-40 object-cover"/><div class="p-4"><h3 class="font-semibold">标题</h3><p class="text-gray-500 text-sm">描述</p></div></div>' },
  { id: 'navbar', name: '导航栏', icon: '≡', category: '导航', defaultProps: { logo: 'Logo', links: ['首页', '关于', '联系'] }, html: '<nav class="flex items-center justify-between px-6 py-3 border-b"><span class="font-bold">Logo</span><div class="flex gap-4"><a href="#">首页</a><a href="#">关于</a><a href="#">联系</a></div></nav>' },
  { id: 'hero', name: 'Hero区', icon: '★', category: '区块', defaultProps: { title: '欢迎', subtitle: '副标题', cta: '开始使用' }, html: '<div class="text-center py-20"><h1 class="text-4xl font-bold">欢迎</h1><p class="text-gray-500 mt-4">副标题</p><button class="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl">开始使用</button></div>' },
  { id: 'list', name: '列表', icon: '≡', category: '列表', defaultProps: { items: ['项目1', '项目2', '项目3'] }, html: '<ul class="divide-y"><li class="py-3 px-4">项目1</li><li class="py-3 px-4">项目2</li><li class="py-3 px-4">项目3</li></ul>' },
  { id: 'footer', name: '页脚', icon: '▔', category: '区块', defaultProps: { text: '© 2024 Neural Town' }, html: '<footer class="py-8 border-t text-center text-gray-400 text-sm">© 2024 Neural Town</footer>' },
  { id: 'avatar', name: '头像', icon: '👤', category: '媒体', defaultProps: { src: '', size: 'md', name: '用户' }, html: '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">U</div>' },
  { id: 'badge', name: '标签', icon: '#', category: '数据', defaultProps: { text: '新', color: 'indigo' }, html: '<span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">新</span>' },
];

interface ComponentLibraryProps {
  onDragStart: (component: UIComponent) => void;
}

export default function ComponentLibrary({ onDragStart }: ComponentLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(COMPONENTS.map(c => c.category))];
  const filtered = COMPONENTS.filter(c =>
    (!activeCategory || c.category === activeCategory) &&
    (!search || c.name.includes(search) || c.category.includes(search))
  );

  return (
    <div className="glass-panel w-56 h-full flex flex-col">
      <div className="p-2 border-b border-cosmic-border">
        <h3 className="text-xs font-mono text-white/60 uppercase mb-2">组件库</h3>
        <input
          className="cosmic-input text-xs h-7"
          placeholder="搜索组件..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1 p-1 overflow-x-auto border-b border-cosmic-border">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-2 py-1 rounded text-[10px] whitespace-nowrap ${!activeCategory ? 'bg-nebulae-purple/20 text-nebulae-purple' : 'text-white/50 hover:text-white/80'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 rounded text-[10px] whitespace-nowrap ${activeCategory === cat ? 'bg-nebulae-purple/20 text-nebulae-purple' : 'text-white/50 hover:text-white/80'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(comp => (
          <div
            key={comp.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('component', JSON.stringify(comp));
              onDragStart(comp);
            }}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors group"
          >
            <span className="text-sm">{comp.icon}</span>
            <span className="text-xs text-white/70 group-hover:text-white truncate">{comp.name}</span>
            <span className="ml-auto text-[10px] text-white/20">{comp.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}