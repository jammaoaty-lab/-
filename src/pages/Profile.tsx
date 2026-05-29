import { ChevronRight, Wallet, Briefcase, FileText, Shield, Bell, MessageCircle, FileCheck, Clock, CheckCircle2, AlertCircle, XCircle, Timer, Users, Gift, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import Button from '../components/Button';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  // 接单状态数据
  const taskStatuses = [
    { id: 'in_progress', label: '进行中', count: 3, icon: Clock, color: '#36B0FF' },
    { id: 'under_review', label: '审核中', count: 2, icon: CheckCircle2, color: '#FFD266' },
    { id: 'pending_settlement', label: '待结算', count: 5, icon: AlertCircle, color: '#22C55E' },
    { id: 'rejected', label: '已驳回', count: 1, icon: XCircle, color: '#EF4444' },
  ];

  const settingsItems = [
    { icon: Shield, label: '账号与安全' },
    { icon: Bell, label: '消息通知' },
    { icon: MessageCircle, label: '在线客服' },
    { icon: FileCheck, label: '用户协议' },
    { icon: FileCheck, label: '隐私政策' },
  ];

  // 点击状态卡片跳转 - 统一跳转到我参与的任务列表页，带筛选参数
  const handleStatusClick = (statusId: string) => {
    navigate('/my-tasks', { 
      state: { status: statusId } 
    });
  };

  return (
    <div className="min-h-screen page-background pb-28">
      {/* 顶部头像昵称栏 */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-card-large overflow-hidden bg-white shadow-card">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 primary-gradient rounded-full flex items-center justify-center shadow-float">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <div>
              <h2 className="text-title font-bold text-text-primary">{user?.name || '用户'}</h2>
              <p className="text-body text-text-secondary">入驻 {user?.joinDate || '2024'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/wallet')}
            className="w-11 h-11 rounded-card-large flex items-center justify-center bg-white shadow-card btn-press"
          >
            <Wallet size={22} className="text-primary" />
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* 四栏数据卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="white-card p-4 text-center btn-press">
            <p className="text-caption text-text-secondary mb-1">总资产</p>
            <p className="text-xl font-bold text-profit-red">{formatCurrency(user?.balance || 0)}</p>
          </div>
          <div className="white-card p-4 text-center btn-press">
            <p className="text-caption text-text-secondary mb-1">可用余额</p>
            <p className="text-xl font-bold text-primary">{formatCurrency((user?.balance || 0) - (user?.frozenBalance || 0))}</p>
          </div>
          <div className="white-card p-4 text-center btn-press">
            <p className="text-caption text-text-secondary mb-1">冻结金额</p>
            <p className="text-xl font-bold text-text-tertiary">{formatCurrency(user?.frozenBalance || 0)}</p>
          </div>
          <div className="white-card p-4 text-center btn-press">
            <p className="text-caption text-text-secondary mb-1">累计收益</p>
            <p className="text-xl font-bold text-profit-red">¥888</p>
          </div>
        </div>

        {/* 接单状态横向卡片 */}
        <div className="white-card p-5 mb-5 card-scroll">
          <h3 className="text-subtitle font-medium text-text-primary mb-4">接单状态</h3>
          <div className="grid grid-cols-4 gap-3">
            {taskStatuses.map((status) => {
              const Icon = status.icon;
              return (
                <button
                  key={status.id}
                  onClick={() => handleStatusClick(status.id)}
                  className="flex flex-col items-center gap-2 btn-press"
                >
                  <div 
                    className="w-10 h-10 rounded-card-large flex items-center justify-center"
                    style={{ backgroundColor: `${status.color}15` }}
                  >
                    <Icon size={20} style={{ color: status.color }} />
                  </div>
                  <p className="text-caption text-text-secondary">{status.label}</p>
                  <p className="text-body font-bold" style={{ color: status.color }}>{status.count}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 我的工作台四宫格 */}
        <div className="mb-5">
          <h3 className="text-subtitle font-medium text-text-primary mb-4">我的工作台</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/my-tasks', { state: { status: 'all' } })}
              className="white-card p-5 flex flex-col gap-3 btn-press"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 primary-gradient rounded-card-large flex items-center justify-center">
                  <Briefcase size={22} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-caption font-medium tag-round">11</span>
              </div>
              <p className="text-body font-medium text-text-primary">我参与的任务</p>
            </button>

            <button 
              onClick={() => navigate('/invite')}
              className="white-card p-5 flex flex-col gap-3 btn-press"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-orange-500 rounded-card-large flex items-center justify-center">
                  <Users size={22} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-caption font-medium tag-round">¥256</span>
              </div>
              <p className="text-body font-medium text-text-primary">邀请好友</p>
              <p className="text-caption text-text-tertiary">已邀12人</p>
            </button>

            <button 
              onClick={() => navigate('/publish')}
              className="white-card p-5 flex flex-col gap-3 btn-press"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-500 rounded-card-large flex items-center justify-center">
                  <Gift size={22} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-caption font-medium tag-round">2</span>
              </div>
              <p className="text-body font-medium text-text-primary">我发布的任务</p>
            </button>

            <button 
              onClick={() => navigate('/wallet')}
              className="white-card p-5 flex flex-col gap-3 btn-press"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-500 rounded-card-large flex items-center justify-center">
                  <FileText size={22} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-caption font-medium tag-round">140</span>
              </div>
              <p className="text-body font-medium text-text-primary">资金账单</p>
            </button>
          </div>
        </div>

        {/* 深色Banner */}
        <div className="dark-banner p-5 mb-5 card-scroll">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 primary-gradient rounded-card-large flex items-center justify-center">
                <User size={22} className="text-white" />
              </div>
              <div>
                <p className="text-body text-gray-300 mb-1">升级会员享更多福利</p>
                <p className="text-caption text-gray-400">任务优先接，收益翻倍</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              size="md"
            >
              立即升级
            </Button>
          </div>
        </div>

        {/* 系统设置列表 */}
        <div className="mb-5">
          <h3 className="text-subtitle font-medium text-text-primary mb-4">系统设置</h3>
          <div className="white-card overflow-hidden">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-card-large flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="text-body text-text-primary">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-text-tertiary" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="text-center py-8 text-text-tertiary text-caption">
          <p>© 2024 众包任务平台 版权所有</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
