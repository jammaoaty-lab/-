import { ChevronRight, Wallet, Briefcase, FileText, Settings, Shield, Bell, MessageCircle, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  const workspaceItems = [
    { icon: Briefcase, label: '我参与的悬赏任务', count: 5 },
    { icon: Briefcase, label: '我发布的任务', count: 2 },
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

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部个人信息区域 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 primary-gradient opacity-10" />
        <div className="px-5 pt-12 pb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt="头像"
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#36B0FF] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{user?.name}</h2>
              <p className="text-sm text-slate-500">入驻时间: {user?.joinDate}</p>
            </div>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-2"
            >
              <Wallet size={18} />
              我的钱包
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 总资产卡片 */}
        <GlassCard className="p-6 mb-6 text-center" hasNeonBorder>
          <p className="text-sm text-slate-500 mb-2">钱包总资产</p>
          <p className="text-4xl font-bold gold-text mb-4">{formatCurrency(user?.balance || 0)}</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">可用余额</p>
              <p className="text-lg font-semibold text-[#0F56E8]">{formatCurrency((user?.balance || 0) - (user?.frozenBalance || 0))}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">冻结金额</p>
              <p className="text-lg font-semibold text-slate-500">{formatCurrency(user?.frozenBalance || 0)}</p>
            </div>
          </div>
        </GlassCard>

        {/* 工作台 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">我的工作台</h3>
          <GlassCard className="overflow-hidden">
            {workspaceItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => item.label.includes('发布') ? navigate('/publish') : null}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center">
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{item.count}</span>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </button>
              );
            })}
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
