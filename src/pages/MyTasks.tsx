import { useState, useEffect } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';

// 定义状态筛选参数类型
type TaskStatus = 'all' | 'in_progress' | 'under_review' | 'pending_settlement' | 'rejected' | 'timeout';

const MyTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tasks } = useStore();
  
  // 从路由状态中获取筛选参数，默认为 'all'
  const [activeTab, setActiveTab] = useState<TaskStatus>('all');
  
  // 状态标签配置
  const statusTabs = [
    { id: 'all' as TaskStatus, label: '全部' },
    { id: 'in_progress' as TaskStatus, label: '进行中' },
    { id: 'under_review' as TaskStatus, label: '审核中' },
    { id: 'pending_settlement' as TaskStatus, label: '待结算' },
    { id: 'rejected' as TaskStatus, label: '已驳回' },
    { id: 'timeout' as TaskStatus, label: '已超时' },
  ];
  
  // 从 location state 中获取初始筛选状态
  useEffect(() => {
    if (location.state && location.state.status) {
      setActiveTab(location.state.status as TaskStatus);
    }
  }, [location.state]);
  
  // 模拟的我参与的任务数据
  const myTasks = [
    {
      id: '1',
      title: 'APP新用户注册体验',
      category: 'APP注册',
      reward: 5.5,
      status: 'in_progress',
      createTime: '2024-12-15 10:30',
    },
    {
      id: '2',
      title: '产品问卷调查',
      category: '问卷调研',
      reward: 3.0,
      status: 'under_review',
      createTime: '2024-12-14 15:20',
    },
    {
      id: '3',
      title: '小游戏试玩3分钟',
      category: '游戏任务',
      reward: 2.5,
      status: 'pending_settlement',
      createTime: '2024-12-13 09:15',
    },
    {
      id: '4',
      title: '电商平台浏览任务',
      category: '简单任务',
      reward: 1.5,
      status: 'rejected',
      createTime: '2024-12-12 18:45',
    },
    {
      id: '5',
      title: '社交媒体分享任务',
      category: '简单任务',
      reward: 2.0,
      status: 'timeout',
      createTime: '2024-12-10 11:30',
    },
  ];
  
  // 根据状态筛选任务
  const filteredTasks = activeTab === 'all' 
    ? myTasks 
    : myTasks.filter(task => task.status === activeTab);
  
  // 获取状态样式
  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string, text: string, label: string }> = {
      in_progress: { bg: 'bg-blue-50', text: 'text-[#36B0FF]', label: '进行中' },
      under_review: { bg: 'bg-yellow-50', text: 'text-[#FFD266]', label: '审核中' },
      pending_settlement: { bg: 'bg-green-50', text: 'text-[#22C55E]', label: '待结算' },
      rejected: { bg: 'bg-red-50', text: 'text-[#EF4444]', label: '已驳回' },
      timeout: { bg: 'bg-gray-50', text: 'text-[#6B7280]', label: '已超时' },
    };
    return styles[status] || styles.in_progress;
  };
  
  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-8">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5 flex items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border mr-3 active:scale-[0.97] transition-transform duration-200"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">我参与的悬赏任务</h1>
      </div>
      
      {/* 分类筛选标签 */}
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
                activeTab === tab.id
                  ? 'primary-gradient text-white glow-effect'
                  : 'glass-effect text-slate-600 neon-border hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 任务列表 */}
      <div className="px-5 space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const statusStyle = getStatusStyle(task.status);
            return (
              <GlassCard key={task.id} className="p-5 hover:scale-[1.01] transition-transform duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 任务状态和分类 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
                        {task.category}
                      </span>
                    </div>
                    
                    {/* 任务标题 */}
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                      {task.title}
                    </h3>
                    
                    {/* 时间 */}
                    <p className="text-sm text-slate-400">
                      {task.createTime}
                    </p>
                  </div>
                  
                  {/* 赏金金额 */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Zap size={14} className="text-[#FFD266]" />
                      <span className="text-xs text-slate-500">赏金</span>
                    </div>
                    <p className="text-2xl font-bold gold-text">
                      {formatCurrency(task.reward)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        ) : (
          // 空状态
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 opacity-50 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-slate-200 rounded-full flex items-center justify-center">
                <span className="text-3xl text-slate-300">📋</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无该状态的任务</h3>
            <p className="text-slate-500 text-sm">去任务广场看看有没有合适的任务吧</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
