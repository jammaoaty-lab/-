import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Video,
  Community,
  Cpu,
  Database,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';

// 后台菜单配置
const menuConfig = [
  {
    id: 'overview',
    title: '系统总览',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard', title: '全局数据大屏', path: '/admin/dashboard' },
      { id: 'reports', title: '数据统计报表', path: '/admin/reports' },
      { id: 'monitor', title: '实时监控面板', path: '/admin/monitor' },
    ],
  },
  {
    id: 'auth',
    title: '权限管理',
    icon: Shield,
    children: [
      { id: 'admins', title: '管理员账号管理', path: '/admin/admins' },
      { id: 'roles', title: '角色权限配置', path: '/admin/roles' },
      { id: 'menus', title: '菜单权限分配', path: '/admin/menus' },
    ],
  },
  {
    id: 'users',
    title: '用户管理',
    icon: Users,
    children: [
      { id: 'user-list', title: '全量用户列表', path: '/admin/users' },
      { id: 'user-levels', title: '用户等级&标签管理', path: '/admin/user-levels' },
      { id: 'memberships', title: '会员套餐管理', path: '/admin/memberships' },
      { id: 'token-logs', title: '用户Token账务明细', path: '/admin/token-logs' },
    ],
  },
  {
    id: 'content',
    title: '内容管理',
    icon: Video,
    children: [
      { id: 'works', title: '全平台作品总览', path: '/admin/works' },
      { id: 'short-videos', title: '短视频管理', path: '/admin/short-videos' },
      { id: 'long-videos', title: '长视频专项管理', path: '/admin/long-videos' },
      { id: 'content-audit', title: '作品审核管理', path: '/admin/content-audit' },
      { id: 'recommendations', title: '作品推荐配置', path: '/admin/recommendations' },
    ],
  },
  {
    id: 'community',
    title: '社区运营',
    icon: Community,
    children: [
      { id: 'circles', title: '圈子管理', path: '/admin/circles' },
      { id: 'topics', title: '话题管理', path: '/admin/topics' },
      { id: 'post-audit', title: '帖子&评论审核', path: '/admin/post-audit' },
      { id: 'rewards', title: '作品打赏管理', path: '/admin/rewards' },
      { id: 'ranks', title: '创作者榜单配置', path: '/admin/ranks' },
    ],
  },
  {
    id: 'tasks',
    title: '通用创作任务管理',
    icon: Cpu,
    children: [
      { id: 'ai-tasks', title: '全局AI创作任务列表', path: '/admin/ai-tasks' },
      { id: 'workbench-monitor', title: '工作台任务监控', path: '/admin/workbench-monitor' },
      { id: 'snapshots', title: '创作快照管理', path: '/admin/snapshots' },
    ],
  },
  {
    id: 'long-video',
    title: '长视频任务专项管理',
    icon: Video,
    children: [
      { id: 'shot-tasks', title: '镜头生成任务监控', path: '/admin/shot-tasks' },
      { id: 'video-synthesis', title: '视频合成任务监控', path: '/admin/video-synthesis' },
      { id: 'tts-tasks', title: 'TTS配音任务监控', path: '/admin/tts-tasks' },
      { id: 'ffmpeg-tasks', title: 'FFmpeg处理任务列表', path: '/admin/ffmpeg-tasks' },
      { id: 'failed-tasks', title: '失败任务重试/清理', path: '/admin/failed-tasks' },
    ],
  },
  {
    id: 'system',
    title: '系统运维工具',
    icon: Settings,
    children: [
      { id: 'queues', title: '异步队列可视化管理', path: '/admin/queues' },
      { id: 'server-monitor', title: '服务器&进程监控', path: '/admin/server-monitor' },
      { id: 'file-manager', title: '在线文件管理', path: '/admin/file-manager' },
      { id: 'scheduled-tasks', title: '定时任务可视化', path: '/admin/scheduled-tasks' },
      { id: 'cleanup', title: '临时文件一键清理', path: '/admin/cleanup' },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(['overview', 'users']);

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 侧边栏 */}
      <aside
        className={clsx(
          'bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo区域 */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 菜单列表 */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuConfig.map((menu) => (
            <div key={menu.id} className="mb-1 px-2">
              {/* 一级菜单 */}
              <button
                onClick={() => toggleMenu(menu.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group"
              >
                <menu.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-sm font-medium">{menu.title}</span>
                    {expandedMenus.includes(menu.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* 二级子菜单 */}
              {sidebarOpen && expandedMenus.includes(menu.id) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {menu.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      className={({ isActive }) =>
                        clsx(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        )
                      }
                    >
                      {child.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="全局搜索..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium">管理员</p>
                <p className="text-xs text-slate-500">超级管理员</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
