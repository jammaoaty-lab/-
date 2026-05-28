import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Eye, Trash2, Shield, Download } from 'lucide-react';

// 模拟用户数据
const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  nickname: `用户${i + 1}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  phone: `138****${String(1000 + i).slice(-4)}`,
  email: `user${i + 1}@example.com`,
  userType: ['普通用户', '创作者', '会员用户', '企业用户'][Math.floor(Math.random() * 4)],
  level: Math.floor(Math.random() * 10) + 1,
  tokenBalance: Math.floor(Math.random() * 100000),
  worksCount: Math.floor(Math.random() * 100),
  status: ['正常', '禁用', '临时封禁'][Math.floor(Math.random() * 3)],
  registerTime: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  lastLoginTime: '2024-12-20 14:30:00',
}));

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [selectedType, setSelectedType] = useState('全部');

  // 过滤用户
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.includes(searchTerm) || user.nickname.includes(searchTerm);
    const matchesStatus = selectedStatus === '全部' || user.status === selectedStatus;
    const matchesType = selectedType === '全部' || user.userType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">全量用户列表</h1>
          <p className="text-slate-400 mt-1">管理平台所有用户账号</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出数据
          </button>
          <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增用户
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索用户名/昵称/手机号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="全部">全部状态</option>
              <option value="正常">正常</option>
              <option value="禁用">禁用</option>
              <option value="临时封禁">临时封禁</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="全部">全部类型</option>
              <option value="普通用户">普通用户</option>
              <option value="创作者">创作者</option>
              <option value="会员用户">会员用户</option>
              <option value="企业用户">企业用户</option>
            </select>

            <button className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              更多筛选
            </button>
          </div>
        </div>
      </div>

      {/* 用户表格 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  用户类型
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  等级
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Token余额
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  作品数
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.nickname} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium">{user.nickname}</p>
                        <p className="text-sm text-slate-500">{user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{user.userType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      LV.{user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-400">{user.tokenBalance.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{user.worksCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === '正常' && (
                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        正常
                      </span>
                    )}
                    {user.status === '禁用' && (
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                        禁用
                      </span>
                    )}
                    {user.status === '临时封禁' && (
                      <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        临时封禁
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{user.registerTime}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            显示 1 - {filteredUsers.length} 共 {filteredUsers.length} 条
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              上一页
            </button>
            <button className="px-3 py-1.5 bg-purple-600 rounded-lg text-sm">1</button>
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
