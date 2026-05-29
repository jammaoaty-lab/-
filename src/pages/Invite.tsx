import { useState } from 'react';
import { Share2, Users, Gift, CheckCircle, Copy, Link, Image, MessageSquare, ChevronDown, ChevronUp, Bell, Wallet, TrendingUp, Trophy, Coins } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import Button from '../components/Button';

const Invite = () => {
  const { user } = useStore();
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signedDays, setSignedDays] = useState([1, 2, 3]);
  const [showToast, setShowToast] = useState(false);
  const [todaySigned, setTodaySigned] = useState(false);

  // 模拟已邀请好友列表
  const invitedFriends = [
    { id: 1, nickname: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', registerTime: '2024-01-15', hasFirstTask: true, totalReward: 15.5 },
    { id: 2, nickname: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', registerTime: '2024-01-14', hasFirstTask: true, totalReward: 8.0 },
    { id: 3, nickname: '小刚', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', registerTime: '2024-01-13', hasFirstTask: false, totalReward: 5.0 },
    { id: 4, nickname: '小丽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', registerTime: '2024-01-12', hasFirstTask: true, totalReward: 22.5 },
    { id: 5, nickname: '小华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', registerTime: '2024-01-11', hasFirstTask: false, totalReward: 5.0 },
  ];

  // 阶梯奖励
  const stepRewards = [
    { target: 5, reward: 50, completed: 2, label: '邀请满5位' },
    { target: 10, reward: 150, completed: 2, label: '邀请满10位' },
    { target: 20, reward: 400, completed: 2, label: '邀请满20位' },
  ];

  // 四宫格数据
  const statsData = [
    { label: '已邀请', value: '12', icon: Users, color: '#00C8E0', bgGradient: 'linear-gradient(135deg, rgba(0,200,224,0.15) 0%, rgba(0,200,224,0.05) 100%)' },
    { label: '今日收益', value: '¥35.5', icon: Coins, color: '#F53F3F', bgGradient: 'linear-gradient(135deg, rgba(245,63,63,0.15) 0%, rgba(245,63,63,0.05) 100%)' },
    { label: '累计收益', value: '¥256.0', icon: Wallet, color: '#F53F3F', bgGradient: 'linear-gradient(135deg, rgba(245,63,63,0.12) 0%, rgba(245,63,63,0.04) 100%)' },
    { label: '待结算', value: '¥85.5', icon: TrendingUp, color: '#00C8E0', bgGradient: 'linear-gradient(135deg, rgba(0,200,224,0.12) 0%, rgba(0,200,224,0.04) 100%)' },
  ];

  // 常用功能入口
  const functionEntries = [
    { label: '复制链接', icon: Link, color: 'primary-gradient' },
    { label: '生成海报', icon: Image, color: 'bg-orange-500' },
    { label: '微信分享', icon: MessageSquare, color: 'bg-green-500' },
    { label: '我的团队', icon: Users, color: 'bg-purple-500' },
  ];

  const handleCopyCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `https://example.com/invite?code=${user?.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 签到功能
  const handleSignIn = () => {
    if (todaySigned) return;
    
    const newSignedDays = [...signedDays, Math.max(...signedDays) + 1];
    setSignedDays(newSignedDays);
    setTodaySigned(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setTimeout(() => setShowSignIn(false), 1500);
  };

  return (
    <div className="min-h-screen page-background pb-28">
      {/* 顶部状态栏 + 欢迎昵称栏 */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt="头像"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-title font-bold text-text-primary">Hi {user?.name || '用户'}</h2>
              <p className="text-body text-text-secondary">邀请好友赚更多</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSignIn(true)}
            className="w-10 h-10 rounded-card-large flex items-center justify-center bg-white shadow-card btn-press relative"
          >
            <Bell size={20} className="text-text-tertiary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* 四栏数据卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {statsData.map((stat, index) => (
            <div key={index} className="p-4 text-center card-scroll rounded-card-large" style={{ background: stat.bgGradient }}>
              <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.8)' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p className="text-subtitle font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-caption text-text-tertiary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 裂变等级进度 */}
        <div className="white-card p-5 mb-5">
          <h3 className="text-subtitle font-bold text-text-primary mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            阶梯额外奖励
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {stepRewards.map((step, index) => (
              <div key={index} className="bg-tag-light rounded-card-task p-4 text-center">
                <p className="text-caption text-text-tertiary mb-1">{step.label}</p>
                <p className="text-title font-bold text-profit-red mb-2">{formatCurrency(step.reward)}</p>
                <div className="text-caption">
                  <span className="text-primary">{step.completed}</span>
                  <span className="text-text-placeholder">/{step.target}</span>
                </div>
                {/* 进度条 */}
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full primary-gradient transition-all duration-500"
                    style={{ width: `${(step.completed / step.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 我的收益订单四宫格 */}
        <div className="white-card p-5 mb-5">
          <h3 className="text-subtitle font-bold text-text-primary mb-4">我的收益</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-card-task" style={{ background: 'linear-gradient(135deg, rgba(245,63,63,0.12) 0%, rgba(245,63,63,0.04) 100%)' }}>
              <p className="text-caption text-text-tertiary mb-1">今日新增</p>
              <p className="text-[26px] font-bold" style={{ color: '#F53F3F' }}>¥35.50</p>
              <p className="text-caption text-text-tertiary mt-1">+12.5%</p>
            </div>
            <div className="p-4 rounded-card-task" style={{ background: 'linear-gradient(135deg, rgba(0,200,224,0.12) 0%, rgba(0,200,224,0.04) 100%)' }}>
              <p className="text-caption text-text-tertiary mb-1">待结算</p>
              <p className="text-[26px] font-bold" style={{ color: '#00C8E0' }}>¥85.50</p>
              <p className="text-caption text-text-tertiary mt-1">7天后到账</p>
            </div>
          </div>
        </div>

        {/* 深色Banner */}
        <div className="dark-banner p-5 mb-5 card-scroll">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-caption font-bold tag-round">限时福利</span>
              </div>
              <div>
                <p className="text-caption text-gray-400 mb-1">每邀请1位好友</p>
                <p className="text-[28px] font-bold text-profit-red">¥10.00</p>
                <p className="text-caption text-gray-400">双向都得现金奖励</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-caption text-gray-400 mb-1">我的邀请码</p>
              <p className="text-lg font-bold text-white">{user?.inviteCode}</p>
              <button 
                onClick={handleCopyCode}
                className="mt-2 px-4 py-1.5 bg-white/10 text-white text-caption rounded-full flex items-center gap-1 mx-auto"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
        </div>

        {/* 常用功能入口 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {functionEntries.map((entry, index) => (
            <button 
              key={index}
              onClick={index === 0 ? handleCopyLink : undefined}
              className="white-card p-4 flex flex-col items-center gap-2 btn-press"
            >
              <div className={`w-12 h-12 ${entry.color} rounded-full flex items-center justify-center shadow-float`}>
                <entry.icon size={22} className="text-white" />
              </div>
              <span className="text-caption font-medium text-text-primary">{entry.label}</span>
            </button>
          ))}
        </div>

        {/* 已邀请好友列表 */}
        <div className="mb-5">
          <h3 className="text-subtitle font-bold text-text-primary mb-4">已邀请好友</h3>
          <div className="space-y-3">
            {invitedFriends.map((friend) => (
              <div key={friend.id} className="white-card p-4 card-scroll">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.nickname} className="w-12 h-12 rounded-card-task" />
                    <div>
                      <p className="text-body font-medium text-text-primary">{friend.nickname}</p>
                      <p className="text-caption text-text-tertiary">{friend.registerTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {friend.hasFirstTask ? (
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-caption font-medium tag-round mb-1">
                        已完成首单
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-600 text-caption font-medium tag-round mb-1">
                        待完成首单
                      </span>
                    )}
                    <p className="text-subtitle font-bold text-profit-red">+{formatCurrency(friend.totalReward)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 活动规则折叠面板 */}
        <div className="mb-5">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-text-secondary mb-3"
          >
            <span className="text-subtitle font-bold text-text-primary">📋 活动规则</span>
            {showRules ? <ChevronUp size={20} className="text-text-tertiary" /> : <ChevronDown size={20} className="text-text-tertiary" />}
          </button>
          
          {showRules && (
            <div className="white-card p-5 animate-fade-in">
              <div className="space-y-5">
                {/* 一级直邀奖励 */}
                <div>
                  <h4 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center text-white text-caption">1</span>
                    一级直邀奖励
                  </h4>
                  <ul className="space-y-2 text-body text-text-secondary ml-8">
                    <li>• 好友注册+实名认证：您获得¥5</li>
                    <li>• 好友首单任务完成：您额外获得¥3</li>
                    <li>• 好友后续每单：您获得任务赏金5%佣金（永久）</li>
                  </ul>
                </div>

                {/* 二级间接奖励 */}
                <div>
                  <h4 className="text-body font-bold text-text-primary mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-caption" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>2</span>
                    二级间接奖励
                  </h4>
                  <ul className="space-y-2 text-body text-text-secondary ml-8">
                    <li>• 好友邀请的用户注册并完成首单：您获得¥2</li>
                    <li>• 二级用户后续每单：您获得任务赏金2%佣金</li>
                  </ul>
                </div>

                {/* 资金结算规则 */}
                <div>
                  <h4 className="text-body font-bold text-text-primary mb-3">💰 资金结算规则</h4>
                  <ul className="space-y-2 text-body text-text-secondary">
                    <li>• 所有奖励先进入冻结余额，7天冻结期后自动解冻</li>
                    <li>• 好友任务审核驳回、弃单、封号，对应奖励作废</li>
                    <li>• 奖励明细在钱包-邀请奖励分类中查看</li>
                  </ul>
                </div>

                {/* 防作弊规则 */}
                <div>
                  <h4 className="text-body font-bold text-text-primary mb-3">⚠️ 防作弊规则</h4>
                  <ul className="space-y-2 text-body text-text-secondary">
                    <li>• 同一设备/IP短时间批量注册判定异常</li>
                    <li>• 一个身份证仅一个有效账号</li>
                    <li>• 作弊账号直接封号，清空所有邀请收益</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部分享按钮 */}
        <Button 
          variant="primary" 
          size="xl" 
          className="w-full flex items-center justify-center gap-2 shadow-float"
        >
          <Share2 size={24} />
          立即分享邀请
        </Button>
      </div>

      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="bg-white shadow-float px-6 py-3 rounded-card-large flex items-center gap-2">
            <div className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-text-primary font-medium text-body">
              签到成功，¥10已到账！
            </span>
          </div>
        </div>
      )}

      {/* 签到弹窗 */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSignIn(false)}
          />
          <div className="relative w-full max-w-md bg-white modal-round shadow-float p-6 animate-slide-up">
            <button 
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-placeholder hover:text-text-tertiary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-title font-bold text-text-primary text-center mb-6">每日签到</h2>
            
            {/* 日历签到 */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div 
                  key={day}
                  className={`aspect-square rounded-card-large flex flex-col items-center justify-center transition-all duration-200 ${
                    signedDays.includes(day) 
                      ? 'primary-gradient text-white shadow-float' 
                      : 'bg-gray-50 text-text-placeholder'
                  }`}
                >
                  <span className="text-[10px] opacity-80">周{['一', '二', '三', '四', '五', '六', '日'][day-1]}</span>
                  <span className="font-bold text-lg">{day}</span>
                </div>
              ))}
            </div>
            
            {/* 连续签到奖励 */}
            <div className="p-5 mb-6 text-center bg-gray-50 rounded-card-large">
              <p className="text-body text-text-tertiary mb-2">连续签到7天可领取现金奖励</p>
              <p className="text-3xl font-bold text-profit-red">¥10.00</p>
            </div>
            
            {/* 签到按钮 */}
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              disabled={todaySigned}
              onClick={handleSignIn}
            >
              {todaySigned ? '今日已签到' : '立即签到'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
