import { useState } from 'react';
import { Search, Bell, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';

const TaskSquare = () => {
  const navigate = useNavigate();
  const { user, tasks } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('全部悬赏');
  const [showSignIn, setShowSignIn] = useState(false);

  const categories = ['全部悬赏', '简单任务', 'APP注册', '问卷调研', '游戏任务', '高额赏金'];

  const filteredTasks = selectedCategory === '全部悬赏' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center glow-effect">
              <span className="text-white font-bold text-lg">众</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">众包任务</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border">
              <Search size={20} className="text-slate-500" />
            </div>
            <button 
              onClick={() => setShowSignIn(true)}
              className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border relative"
            >
              <Bell size={20} className="text-slate-500" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD266] rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 现金资产条 */}
        <GlassCard className="p-4 mb-6" hasNeonBorder>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">钱包现金余额</p>
                <p className="text-2xl font-bold gold-text">{formatCurrency(user?.balance || 0)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/wallet')}
            >
              打开钱包
            </Button>
          </div>
        </GlassCard>

        {/* 分类筛选 */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-5 px-5">
          <div className="flex gap-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'primary-gradient text-white glow-effect'
                    : 'glass-effect text-slate-600 neon-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 任务列表 */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* 签到弹窗 */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSignIn(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-[28px] p-6 animate-slide-up">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">每日签到</h2>
            
            {/* 日历签到 */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div 
                  key={day}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                    day <= 3 
                      ? 'primary-gradient text-white' 
                      : 'glass-effect text-slate-400'
                  }`}
                >
                  <span className="text-xs">周{['一', '二', '三', '四', '五', '六', '日'][day-1]}</span>
                  <span className="font-bold">{day}</span>
                </div>
              ))}
            </div>
            
            {/* 连续签到奖励 */}
            <GlassCard className="p-4 mb-6 text-center">
              <p className="text-sm text-slate-500 mb-2">连续签到7天可获得</p>
              <p className="text-2xl font-bold gold-text">¥10.00</p>
            </GlassCard>
            
            <Button 
              variant="primary" 
              size="lg" 
              isGlow
              className="w-full"
              onClick={() => setShowSignIn(false)}
            >
              立即签到
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSquare;
