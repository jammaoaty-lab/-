'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { useAuthStore } from '@/stores/auth-store';

interface MenuItem {
  label: string;
  items: {
    label?: string;
    shortcut?: string;
    action?: () => void;
    divider?: boolean;
  }[];
}

export default function TopMenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleLeftPanel, toggleRightPanel, toggleBottomPanel, setDiffMode } = useEditorStore();
  const { user } = useAuthStore();

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menus: MenuItem[] = [
    {
      label: '文件',
      items: [
        { label: '新建文件', shortcut: 'Ctrl+N', action: () => { setActiveMenu(null); } },
        { label: '打开文件', shortcut: 'Ctrl+O', action: () => { setActiveMenu(null); } },
        { label: '保存', shortcut: 'Ctrl+S', action: () => { setActiveMenu(null); } },
        { label: '全部保存', shortcut: 'Ctrl+Shift+S', action: () => { setActiveMenu(null); } },
        { divider: true },
        { label: '关闭文件', shortcut: 'Ctrl+W', action: () => { toggleLeftPanel(); setActiveMenu(null); } },
      ],
    },
    {
      label: '编辑',
      items: [
        { label: '撤销', shortcut: 'Ctrl+Z', action: () => { setActiveMenu(null); } },
        { label: '重做', shortcut: 'Ctrl+Shift+Z', action: () => { setActiveMenu(null); } },
        { divider: true },
        { label: '查找', shortcut: 'Ctrl+F', action: () => { setActiveMenu(null); } },
        { label: '替换', shortcut: 'Ctrl+H', action: () => { setActiveMenu(null); } },
        { divider: true },
        { label: '切换注释', shortcut: 'Ctrl+/', action: () => { setActiveMenu(null); } },
        { label: '格式化文档', shortcut: 'Shift+Alt+F', action: () => { setActiveMenu(null); } },
      ],
    },
    {
      label: '选择',
      items: [
        { label: '全选', shortcut: 'Ctrl+A', action: () => { setActiveMenu(null); } },
        { label: '扩展选择', shortcut: 'Shift+Alt+Right', action: () => { setActiveMenu(null); } },
        { label: '选择所有匹配项', shortcut: 'Ctrl+Shift+L', action: () => { setActiveMenu(null); } },
      ],
    },
    {
      label: '查看',
      items: [
        { label: '文件浏览器', shortcut: 'Ctrl+B', action: () => { toggleLeftPanel(); setActiveMenu(null); } },
        { label: 'AI 伴侣', shortcut: 'Ctrl+Shift+I', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: '终端面板', shortcut: 'Ctrl+`', action: () => { toggleBottomPanel(); setActiveMenu(null); } },
        { divider: true },
        { label: '差异对比', action: () => { setDiffMode(true); setActiveMenu(null); } },
        { label: '禅模式', action: () => { setActiveMenu(null); } },
      ],
    },
    {
      label: '运行',
      items: [
        { label: '运行项目', shortcut: 'F5', action: () => { setActiveMenu(null); } },
        { label: '调试模式', shortcut: 'Ctrl+F5', action: () => { setActiveMenu(null); } },
        { divider: true },
        { label: '运行测试', action: () => { setActiveMenu(null); } },
        { label: '代码检查', action: () => { setActiveMenu(null); } },
      ],
    },
    {
      label: 'AI',
      items: [
        { label: 'AI: 生成代码', shortcut: 'Ctrl+K Ctrl+G', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: 'AI: 重构', shortcut: 'Ctrl+K Ctrl+R', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: 'AI: 解释代码', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: 'AI: 生成测试', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: 'AI: 生成文档', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { divider: true },
        { label: 'AI: 优化性能', action: () => { toggleRightPanel(); setActiveMenu(null); } },
        { label: 'AI: 多语言翻译', action: () => { toggleRightPanel(); setActiveMenu(null); } },
      ],
    },
  ];

  return (
    <div ref={menuRef} className="h-7 bg-[#060B1C] border-b border-[#1A1F35] flex items-center shrink-0 select-none">
      {/* Menu Items */}
      <div className="flex items-center h-full">
        {menus.map((menu) => (
          <div key={menu.label} className="relative h-full">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
              className={`h-full px-3 text-[11px] transition-colors ${
                activeMenu === menu.label
                  ? 'bg-white/[0.07] text-white'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              {menu.label}
            </button>

            <AnimatePresence>
              {activeMenu === menu.label && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-0.5 w-56 bg-[#0D1020] border border-[#2A2F45] rounded-lg shadow-2xl z-50 overflow-hidden"
                >
                  {menu.items.map((item, i) =>
                    item.divider ? (
                      <div key={i} className="border-t border-[#2A2F45]/50 my-1" />
                    ) : (
                      <button
                        key={i}
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-white/[0.05] transition-colors"
                      >
                        <span className="text-white/80">{item.label || ''}</span>
                        {item.shortcut && (
                          <span className="text-[10px] text-white/30 ml-4">{item.shortcut}</span>
                        )}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Right Side - Project Info */}
      <div className="ml-auto flex items-center gap-2 pr-3">
        <span className="text-[10px] text-white/30">stellar-catalog</span>
        {user && (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00E5FF] flex items-center justify-center text-[9px] text-white font-medium">
            {user.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </div>
  );
}