import { useState } from 'react';
import { Share2, Users, Gift, CheckCircle, Copy, Link, Image, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Invite = () => {
  const { user } = useStore();
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部渐变Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 primary-gradient opacity-15" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#36B0FF]/30 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FFD266]/20 rounded-full blur-2xl" />
        
        <div className="px-5 pt-16 pb-10 relative">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-3">邀请好友做任务</h1>
          <p className="text-slate-500 text-center mb-6">双向都得现金奖励</p>
          
          {/* 核心收益 */}
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 mb-2">每邀请1位好友，您和好友都有奖励</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold gold-text">{formatCurrency(10)}</span>
              <span className="text-lg text-slate-600">起</span>
            </div>
          </div>

          {/* 邀请码输入框 */}
          <GlassCard className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1">我的邀请码</p>
              <p className="text-lg font-bold text-[#0F56E8]">{user?.inviteCode}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyCode}
              className="flex items-center gap-2"
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? '已复制' : '复制'}
            </Button>
          </GlassCard>
        </div>
      </div>

      <div className="px-5">
        {/* 数据统计卡片 */}
        <GlassCard className="p-6 mb-6" hasNeonBorder>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold gold-text">12</p>
              <p className="text-sm text-slate-500 mt-1">已邀请人数</p>
            </div>
            <div>
              <p className="text-3xl font-bold gold-text">{formatCurrency(85.5)}</p>
              <p className="text-sm text-slate-500 mt-1">待结算佣金</p>
            </div>
            <div>
              <p className="text-3xl font-bold gold-text">{formatCurrency(256.0)}</p>
              <p className="text-sm text-slate-500 mt-1">累计已到账</p>
            </div>
          </div>
        </GlassCard>

        {/* 阶梯额外奖励 */}
        <GlassCard className="p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">🎉 阶梯额外奖励</h3>
          <div className="grid grid-cols-3 gap-3">
            {stepRewards.map((step, index) => (
              <div key={index} className="p-3 glass-effect rounded-xl text-center">
                <p className="text-xs text-slate-500 mb-1">{step.label}</p>
                <p className="text-xl font-bold gold-text mb-2">{formatCurrency(step.reward)}</p>
                <div className="text-xs">
                  <span className="text-[#36B0FF]">{step.completed}</span>
                  <span className="text-slate-400">/{step.target}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 三大分享按钮 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            onClick={handleCopyLink}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 primary-gradient rounded-full flex items-center justify-center glow-effect">
              <Link size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">复制链接</span>
          </button>

          <button 
            onClick={() => {}}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-effect" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <Image size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">生成海报</span>
          </button>

          <button 
            onClick={() => {}}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-effect" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">微信分享</span>
          </button>
        </div>

        {/* 已邀请好友列表 */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">已邀请好友</h3>
          <div className="space-y-3">
            {invitedFriends.map((friend) => (
              <GlassCard key={friend.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.nickname} className="w-12 h-12 rounded-xl" />
                    <div>
                      <p className="font-medium text-slate-800">{friend.nickname}</p>
                      <p className="text-xs text-slate-400">{friend.registerTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {friend.hasFirstTask ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full mb-1">
                        已完成首单
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded-full mb-1">
                        待完成首单
                      </span>
                    )}
                    <p className="font-bold gold-text">+{formatCurrency(friend.totalReward)}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 活动规则折叠面板 */}
        <div className="mb-6">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-slate-600 mb-3"
          >
            <span className="font-medium">📋 活动规则</span>
            {showRules ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showRules && (
            <GlassCard className="p-5">
              <div className="space-y-4">
                {/* 一级直邀奖励 */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center text-white text-xs">1</span>
                    一级直邀奖励
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 ml-8">
                    <li>• 好友注册+实名认证：您获得¥5</li>
                    <li>• 好友首单任务完成：您额外获得¥3</li>
                    <li>• 好友后续每单：您获得任务赏金5%佣金（永久）</li>
                  </ul>
                </div>

                {/* 二级间接奖励 */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>2</span>
                    二级间接奖励
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 ml-8">
                    <li>• 好友邀请的用户注册并完成首单：您获得¥2</li>
                    <li>• 二级用户后续每单：您获得任务赏金2%佣金</li>
                  </ul>
                </div>

                {/* 冻结规则 */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">💰 资金结算规则</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• 所有奖励先进入冻结余额，7天冻结期后自动解冻</li>
                    <li>• 好友任务审核驳回、弃单、封号，对应奖励作废</li>
                    <li>• 奖励明细在钱包-邀请奖励分类中查看</li>
                  </ul>
                </div>

                {/* 防作弊规则 */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">⚠️ 防作弊规则</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• 同一设备/IP短时间批量注册判定异常</li>
                    <li>• 一个身份证仅一个有效账号</li>
                    <li>• 作弊账号直接封号，清空所有邀请收益</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* 底部分享按钮 */}
        <Button 
          variant="primary" 
          size="xl" 
          isGlow
          className="w-full flex items-center justify-center gap-2"
        >
          <Share2 size={24} />
          立即分享邀请
        </Button>
      </div>
    </div>
  );
};

export default Invite;
