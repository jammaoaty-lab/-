import { useState } from 'react';
import { ArrowLeft, History, Plus, Minus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Wallet = () => {
  const navigate = useNavigate();
  const { user, transactions } = useStore();
  const [selectedTab, setSelectedTab] = useState('全部流水');

  const tabs = ['全部流水', '任务收入', '发单支出', '邀请奖励', '充值记录', '提现记录'];

  const transactionList = [
    { id: '1', type: 'income', amount: 5.5, description: 'APP注册任务奖励', time: '2024-12-15 10:30' },
    { id: '2', type: 'income', amount: 3.0, description: '问卷调查奖励', time: '2024-12-14 15:20' },
    { id: '3', type: 'expense', amount: 100.0, description: '提现到微信', time: '2024-12-13 09:15' },
    { id: '4', type: 'income', amount: 3.0, description: '邀请好友奖励', time: '2024-12-12 18:45' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-8">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">我的现金钱包</h1>
        <button className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border">
          <History size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="px-5">
        {/* 总资产卡片 */}
        <GlassCard className="p-8 mb-6 text-center" hasNeonBorder>
          <p className="text-sm text-slate-500 mb-2">总资产</p>
          <p className="text-5xl font-bold gold-text mb-6">{formatCurrency(user?.balance || 0)}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass-effect rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">可用余额</p>
              <p className="text-2xl font-semibold text-[#0F56E8]">
                {formatCurrency((user?.balance || 0) - (user?.frozenBalance || 0))}
              </p>
              <Button 
                variant="primary" 
                size="sm"
                className="mt-3 w-full"
                onClick={() => navigate('/withdraw')}
              >
                提现
              </Button>
            </div>
            <div className="p-4 glass-effect rounded-2xl">
              <p className="text-xs text-slate-500 mb-1">冻结金额</p>
              <p className="text-2xl font-semibold text-slate-500">
                {formatCurrency(user?.frozenBalance || 0)}
              </p>
              <div className="mt-3 w-full py-2 px-4 bg-slate-100 text-slate-400 rounded-xl text-sm">
                暂不可用
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 核心操作按钮 */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant="primary" 
            size="lg"
            isGlow
            className="flex-1"
            onClick={() => navigate('/recharge')}
          >
            <Plus size={20} className="mr-2" />
            账户充值
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            isGlow
            className="flex-1"
            onClick={() => navigate('/withdraw')}
          >
            <Minus size={20} className="mr-2" />
            余额提现
          </Button>
        </div>

        {/* 流水筛选Tab */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-5 px-5">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedTab === tab
                    ? 'primary-gradient text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 流水列表 */}
        <div className="space-y-3">
          {transactionList.map((transaction) => (
            <GlassCard key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? <Plus size={18} /> : <Minus size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{transaction.description}</p>
                    <p className="text-xs text-slate-400">{transaction.time}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'gold-text' : 'text-slate-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* 更多按钮 */}
        {transactionList.length > 0 && (
          <button className="w-full py-4 text-center text-slate-500 text-sm mt-4">
            查看更多 <ChevronRight size={16} className="inline" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Wallet;
