import React from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              AI Drama
            </span>
          </div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white font-medium">首页</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">作品广场</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">模型训练</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">算力中心</a>
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                开始创作
              </button>
              <button className="p-1 bg-slate-800 rounded-full border-2 border-slate-700">
                <User className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
