import { ChevronRight, Wallet, Briefcase, FileText, Shield, Bell, MessageCircle, FileCheck, Clock, CheckCircle2, AlertCircle, XCircle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  // 接单状态数据
  const taskStatuses = [
    { id: 'in_progress', label: '进行中任务', count: 3, icon: Clock, color: '#36B0FF' },
    { id: 'under_review', label: '审核中任务', count: 2, icon: CheckCircle2, color: '#FFD266' },
    { id: 'pending_settlement', label: '待结算任务', count: 5, icon: AlertCircle, color: '#22C55E' },
    { id: 'rejected', label: '已驳回任务', count: 1, icon: XCircle, color: '#EF4444' },
    { id: 'timeout', label: '已超时任务', count: 0, icon: Timer, color: '#6B7280' },
  ];

  const financialItems = [
    { icon: FileText, label: '现金收支明细', count: 128 },
    { icon: FileText, label: '邀请奖励明细', count: 12 },
  ];

  const settingsItems = [
    { icon: Shield, label: '账号与安全' },
    { icon: Bell, label: '消息通知' },
    { icon: MessageCircle, label: '在线客服' },
    { icon: FileCheck, label: '用户协议' },
    { icon: FileCheck, label: '隐私政策' },
  ];

  // 点击状态卡片跳转
  const handleStatusClick = (statusId: string) => {
    // 这里可以传递状态参数，示例直接跳转到任务广场
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部头部磨砂渐变栏 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 primary-gradient opacity-15" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#36B0FF]/20 rounded-full blur-3xl" />
        
        <div className="px-5 pt-12 pb-8 relative">
          <div className="flex items-center gap-4">
            {/* 左侧圆形头像框 */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 primary-gradient rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            
            {/* 中间账号信息 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-800 mb-1 truncate">{user?.name}</h2>
              <p className="text-sm text-slate-500">入驻时间: {user?.joinDate}</p>
            </div>
            
            {/* 右上角悬浮蓝色发光按钮 */}
            <Button 
              variant="primary" 
              size="sm"
              isGlow
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-2 shadow-xl"
            >
              <Wallet size={18} />
              我的钱包
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 总资产玻璃卡片 */}
        <GlassCard className="p-8 mb-6 text-center" hasNeonBorder>
          <p className="text-sm text-slate-500 mb-2">钱包总资产</p>
          <p className="text-5xl font-bold gold-text mb-6">{formatCurrency(user?.balance || 0)}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">可用余额</p>
              <p className="text-xl font-bold text-[#0F56E8]">
                {formatCurrency((user?.balance || 0) - (user?.frozenBalance || 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">冻结金额</p>
              <p className="text-xl font-bold text-slate-500">
                {formatCurrency(user?.frozenBalance || 0)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 【我的工作台】磨砂分组大卡片 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">我的工作台</h3>
          
          <GlassCard className="p-5" hasNeonBorder>
            {/* 第一行：左右均分两大功能入口卡片 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => navigate('/')}
                className="p-5 bg-white rounded-2xl card-shadow hover:scale-[1.02] transition-all duration-300 text-left relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center">
                    <Briefcase size={24} className="text-white" />
                  </div>
                  <span className="px-3 py-1 bg-[#36B0FF]/10 text-[#36B0FF] text-xs font-bold rounded-full">
                    11
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700">我参与的悬赏任务</p>
              </button>
              
              <button
                onClick={() => navigate('/publish')}
                className="p-5 bg-white rounded-2xl card-shadow hover:scale-[1.02] transition-all duration-300 text-left relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center">
                    <Briefcase size={24} className="text-white" />
                  </div>
                  <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold rounded-full">
                    2
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700">我发布的任务</p>
              </button>
            </div>
            
            {/* 第二行：接单状态横向统计面板 */}
            <div className="grid grid-cols-5 gap-3">
              {taskStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.id}
                    onClick={() => handleStatusClick(status.id)}
                    className="glass-effect p-4 rounded-2xl neon-border hover:scale-[1.05] transition-all duration-300 text-center"
                  >
                    <Icon size={24} style={{ color: status.color }} className="mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 mb-1">{status.label}</p>
                    <p className="text-lg font-bold" style={{ color: status.color }}>{status.count}</p>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* 资金账单 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">资金账单</h3>
          <GlassCard className="overflow-hidden">
            {financialItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => navigate('/wallet')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border">
                      <Icon size={20} className="text-[#0F56E8]" />
                    </div>
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{item.count}条</span>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </button>
              );
            })}
          </GlassCard>
        </div>

        {/* 系统设置 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">系统设置</h3>
          <GlassCard className="overflow-hidden">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border">
                      <Icon size={20} className="text-[#0F56E8]" />
                    </div>
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </button>
              );
            })}
          </GlassCard>
        </div>

        {/* 底部版权信息 */}
        <div className="text-center py-8 text-slate-400 text-sm">
          <p>© 2024 众包任务平台 版权所有</p>
          <p className="mt-1">专注于提供正规、安全的众包服务</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
