import React from 'react';
import {
  Users,
  Video,
  TrendingUp,
  DollarSign,
  Cpu,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// 模拟数据
const userGrowthData = Array.from({ length: 7 }, (_, i) => ({
  date: `12-${15 + i}`,
  newUsers: Math.floor(Math.random() * 200) + 100,
  activeUsers: Math.floor(Math.random() * 1000) + 500,
}));

const worksData = Array.from({ length: 7 }, (_, i) => ({
  date: `12-${15 + i}`,
  shortVideos: Math.floor(Math.random() * 500) + 200,
  longVideos: Math.floor(Math.random() * 100) + 20,
}));

const categoryData = [
  { name: '漫剧', value: 35 },
  { name: 'AI短剧', value: 25 },
  { name: 'AI动漫', value: 20 },
  { name: '影视片段', value: 20 },
];

const COLORS = ['#a855f7', '#0ea5e9', '#10b981', '#f59e0b'];

const StatCard = ({ icon: Icon, title, value, change, trend, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-6">{title}</h3>
    {children}
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">全局数据大屏</h1>
          <p className="text-slate-400 mt-1">实时监控平台核心运营数据</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
            今日
          </button>
          <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm">
            本周
          </button>
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
            本月
          </button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="总用户数"
          value="128,456"
          change="+12.5%"
          trend="up"
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={Video}
          title="总作品数"
          value="89,234"
          change="+8.3%"
          trend="up"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={TrendingUp}
          title="今日创作量"
          value="2,345"
          change="+15.2%"
          trend="up"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          title="今日收益"
          value="¥12,580"
          change="+5.7%"
          trend="up"
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户增长趋势 */}
        <ChartCard title="用户增长趋势">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="newUsers" stroke="#a855f7" fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="activeUsers" stroke="#0ea5e9" fillOpacity={0.3} fill="#0ea5e9" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 作品发布趋势 */}
        <ChartCard title="作品发布趋势">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={worksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Bar dataKey="shortVideos" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="longVideos" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 作品分类占比 */}
        <ChartCard title="作品分类占比">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 系统状态和告警 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 实时监控 */}
        <ChartCard title="实时监控面板">
          <div className="space-y-4">
            {[
              { name: '本地推理服务', status: '正常', value: 75, color: 'bg-green-500' },
              { name: '云端推理服务', status: '正常', value: 60, color: 'bg-green-500' },
              { name: '任务队列', status: '繁忙', value: 85, color: 'bg-yellow-500' },
              { name: 'GPU节点1', status: '正常', value: 55, color: 'bg-green-500' },
              { name: 'GPU节点2', status: '告警', value: 92, color: 'bg-red-500' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${item.color} text-white`}>
                    {item.status}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* 最近告警 */}
        <ChartCard title="最近告警">
          <div className="space-y-3">
            {[
              { type: 'warning', message: 'GPU节点2负载过高', time: '2分钟前' },
              { type: 'error', message: '任务队列阻塞', time: '5分钟前' },
              { type: 'warning', message: '存储空间不足80%', time: '15分钟前' },
              { type: 'info', message: '视频API调用异常', time: '30分钟前' },
              { type: 'success', message: '自动扩容完成', time: '1小时前' },
            ].map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                {alert.type === 'success' && <Activity className="w-5 h-5 text-green-500 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
