import { useState } from 'react';
import { Share2, Users, Gift, CheckCircle, Copy } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Invite = () => {
  const { user } = useStore();
  const [copied, setCopied] = useState(false);

  const inviteSteps = [
    { icon: Share2, title: '分享邀请链接', desc: '复制您的专属邀请码' },
    { icon: Users, title: '好友完成注册', desc: '新用户通过您的邀请注册' },
    { icon: Gift, title: '现金自动到账', desc: '奖励直接发放到您的钱包' }
  ];

  const handleCopyCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部渐变Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 primary-gradient opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#36B0FF]/20 rounded-full blur-3xl" />
        
        <div className="px-5 pt-16 pb-12 relative">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-3">邀请好友赚取现金奖励</h1>
          <p className="text-slate-500 text-center mb-6">每邀请1位安卓新用户，直接到账</p>
          
          <div className="text-center mb-8">
            <span className="text-5xl font-bold gold-text">{formatCurrency(3)}</span>
            <span className="text-lg text-slate-600 ml-2">微信现金</span>
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
        {/* 邀约数据 */}
        <GlassCard className="p-6 mb-6" hasNeonBorder>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold gold-text">12</p>
              <p className="text-sm text-slate-500 mt-1">已邀请人数</p>
            </div>
            <div>
              <p className="text-3xl font-bold gold-text">{formatCurrency(15)}</p>
              <p className="text-sm text-slate-500 mt-1">待发放现金</p>
            </div>
            <div>
              <p className="text-3xl font-bold gold-text">{formatCurrency(36)}</p>
              <p className="text-sm text-slate-500 mt-1">累计到账赏金</p>
            </div>
          </div>
        </GlassCard>

        {/* 邀请流程 */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">邀请流程</h2>
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 -mx-5 px-5">
          {inviteSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <GlassCard 
                key={index} 
                className="p-5 min-w-[140px] flex-shrink-0 text-center"
              >
                <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mx-auto mb-3 glow-effect">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* 活动规则 */}
        <div className="mb-6">
          <button className="flex items-center gap-2 text-slate-600 mb-3">
            <span className="font-medium">活动规则</span>
          </button>
          <GlassCard className="p-4">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-[#36B0FF] font-bold">1.</span>
                <span>邀请的好友必须是从未注册过的<span className="text-[#36B0FF] font-medium">安卓新用户</span></span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#36B0FF] font-bold">2.</span>
                <span>好友完成注册并完成首单任务后，奖励自动发放</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#36B0FF] font-bold">3.</span>
                <span>奖励直接发放到您的现金钱包，可随时提现</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#36B0FF] font-bold">4.</span>
                <span>活动长期有效，邀请人数无上限</span>
              </li>
            </ul>
          </GlassCard>
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
