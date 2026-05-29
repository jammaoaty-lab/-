import { useState } from 'react';
import { ArrowLeft, History, Plus, Minus, ChevronRight, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import Button from '../components/Button';

const Wallet = () => {
  const navigate = useNavigate();
  const { user, transactions } = useStore();
  const [selectedTab, setSelectedTab] = useState('全部流水');

  const tabs = ['全部流水', '任务收入', '发单支出', '邀请奖励', '充值记录', '提现记录'];

  const getFilteredTransactions = () => {
    const allTransactions = [
      { id: '1', type: 'income', category: '任务收入', amount: 5.5, description: 'APP注册任务奖励', time: '2024-12-15 10:30' },
      { id: '2', type: 'income', category: '任务收入', amount: 3.0, description: '问卷调查奖励', time: '2024-12-14 15:20' },
      { id: '3', type: 'income', category: '邀请奖励', amount: 10.0, description: '好友【小明】注册并完成首单', time: '2024-12-14 14:10' },
      { id: '4', type: 'income', category: '邀请奖励', amount: 5.0, description: '好友【小红】完成任务佣金', time: '2024-12-13 20:30' },
      { id: '5', type: 'expense', category: '提现记录', amount: 100.0, description: '提现到微信', time: '2024-12-13 09:15' },
      { id: '6', type: 'income', category: '邀请奖励', amount: 3.0, description: '好友【小刚】注册奖励', time: '2024-12-12 18:45' },
    ];
    
    if (selectedTab === '全部流水') {
      return allTransactions;
    }
    return allTransactions.filter(t => t.category === selectedTab);
  };
  
  const transactionList = getFilteredTransactions();

  return (
    <div className="min-h-screen page-background pb-8">
      <div className="safe-area pt-14 pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-card btn-press"
          >
            <ArrowLeft size={20} className="text-text-tertiary" />
          </button>
          <h1 className="text-title font-bold text-text-primary">我的现金钱包</h1>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-card btn-press">
            <History size={20} className="text-text-tertiary" />
          </button>
        </div>
      </div>

      <div className="safe-area">
        <div className="dark-banner p-6 module-spacing card-scroll">
          <p className="text-caption text-gray-400 mb-2">总资产</p>
          <p className="text-4xl font-bold text-white mb-6">{formatCurrency(user?.balance || 0)}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)' }}>
              <p className="text-[11px] text-emerald-300 mb-1 w-full">可用余额</p>
              <p className="text-xl font-semibold text-white mb-3 w-full text-center">
                {formatCurrency((user?.balance || 0) - (user?.frozenBalance || 0))}
              </p>
              <Button 
                variant="primary" 
                size="sm"
                className="w-full"
                onClick={() => navigate('/withdraw')}
              >
                提现
              </Button>
            </div>
            <div className="p-4 rounded-2xl flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(0,200,224,0.15) 0%, rgba(0,200,224,0.05) 100%)' }}>
              <p className="text-[11px] text-cyan-300 mb-1 w-full">冻结金额</p>
              <p className="text-xl font-semibold text-gray-400 mb-3 w-full text-center">
                {formatCurrency(user?.frozenBalance || 0)}
              </p>
              <div className="w-full py-2 px-4 bg-white/5 text-gray-500 rounded-2xl text-caption text-center">
                暂不可用
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 module-spacing">
          <Button 
            variant="primary" 
            size="lg"
            className="flex-1 btn-height-lg"
            onClick={() => navigate('/recharge')}
          >
            <Plus size={20} className="mr-2" />
            账户充值
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            className="flex-1 btn-height-lg"
            onClick={() => navigate('/withdraw')}
          >
            <Minus size={20} className="mr-2" />
            余额提现
          </Button>
        </div>

        <div className="module-spacing overflow-x-auto pb-2 -mx-[16px] px-[16px]">
          <div className="flex gap-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-5 py-3 capsule-btn text-body font-medium transition-all duration-200 whitespace-nowrap h-[44px] ${
                  selectedTab === tab
                    ? 'primary-gradient text-white shadow-float'
                    : 'bg-white text-text-tertiary shadow-card'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 module-spacing">
          {transactionList.map((transaction) => {
            // 根据类别设置颜色
            let iconBg, iconColor, amountColor;
            if (transaction.category === '任务收入') {
              iconBg = 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)';
              iconColor = '#10B981'; // 薄荷绿
              amountColor = '#10B981';
            } else if (transaction.category === '邀请奖励') {
              iconBg = 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)';
              iconColor = '#F59E0B'; // 暖橙色
              amountColor = '#F59E0B';
            } else if (transaction.category === '提现记录') {
              iconBg = 'linear-gradient(135deg, rgba(245,63,63,0.15) 0%, rgba(245,63,63,0.05) 100%)';
              iconColor = '#F53F3F'; // 浅红色
              amountColor = '#1D2129';
            } else if (transaction.category === '发单支出') {
              iconBg = 'linear-gradient(135deg, rgba(156,163,175,0.15) 0%, rgba(156,163,175,0.05) 100%)';
              iconColor = '#9CA3AF'; // 灰色
              amountColor = '#1D2129';
            } else {
              iconBg = 'linear-gradient(135deg, rgba(0,200,224,0.15) 0%, rgba(0,200,224,0.05) 100%)';
              iconColor = '#00C8E0'; // 主色
              amountColor = transaction.type === 'income' ? '#10B981' : '#1D2129';
            }
            
            return (
              <div key={transaction.id} className="white-card p-5">
                <div className="flex items-center justify-between h-[60px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-task flex items-center justify-center" style={{ background: iconBg }}>
                      {transaction.type === 'income' ? <Plus size={18} strokeWidth={2} style={{ color: iconColor }} /> : <Minus size={18} strokeWidth={2} style={{ color: iconColor }} />}
                    </div>
                    <div>
                      <p className="text-body font-medium text-text-primary">{transaction.description}</p>
                      <p className="text-caption text-text-tertiary">{transaction.time}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold flex-shrink-0" style={{ color: amountColor }}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {transactionList.length > 0 && (
          <button className="w-full py-4 text-center text-text-tertiary text-body mt-4">
            查看更多 <ChevronRight size={16} className="inline" />
          </button>
        )}
      </div>
      
      <div className="safe-area pb-24 mt-6">
        <button
          onClick={() => navigate('/invite')}
          className="w-full white-card p-5 flex items-center justify-between card-scroll"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center primary-gradient">
              <Gift size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-body font-semibold text-text-primary">邀请好友赚现金</p>
              <p className="text-caption text-text-tertiary mt-1">邀请好友注册并完成任务，双方都得现金</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-profit-red">¥256</span>
            <ChevronRight size={20} className="text-text-placeholder" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Wallet;
