import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Bell, Wallet, RefreshCw, Loader2, X, Megaphone, MessageSquare, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import { Task } from '../types';
import GlassCard from '../components/GlassCard';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';

const TaskSquare = () => {
  const navigate = useNavigate();
  const { user, tasks, setUser } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('全部悬赏');
  const [showSignIn, setShowSignIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [signedDays, setSignedDays] = useState([1, 2, 3]);
  const [showToast, setShowToast] = useState(false);
  const [todaySigned, setTodaySigned] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showNewUserBanner, setShowNewUserBanner] = useState(true);
  const [hasClaimedNewUserReward, setHasClaimedNewUserReward] = useState(false);
  const touchStartY = useRef(0);

  const categories = ['全部悬赏', '简单任务', 'APP注册', '问卷调研', '游戏任务', '高额赏金'];

  // 智能排序算法
  const sortTasks = useCallback((tasksToSort: Task[]): Task[] => {
    const sortedTasks = [...tasksToSort];
    
    // 1. 置顶任务永远在最上面
    // 2. 热门任务在置顶下方
    // 3. 剩余任务按算法分数排序 + 随机微调保证多样性
    return sortedTasks.sort((a, b) => {
      // 置顶优先
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // 热门其次
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      
      // 算法分数 + 随机微调
      const scoreA = (a.score || 0) + Math.random() * 10;
      const scoreB = (b.score || 0) + Math.random() * 10;
      return scoreB - scoreA;
    });
  }, []);

  // 初始化和筛选任务
  const filteredTasks = selectedCategory === '全部悬赏' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  // 第一次加载和筛选变化时更新displayTasks
  useEffect(() => {
    setDisplayTasks(sortTasks(filteredTasks));
  }, [selectedCategory, filteredTasks, sortTasks]);

  // 签到功能
  const handleSignIn = () => {
    if (todaySigned) return;
    
    const newSignedDays = [...signedDays, Math.max(...signedDays) + 1];
    setSignedDays(newSignedDays);
    setTodaySigned(true);
    
    // 签到成功，增加余额
    if (user) {
      setUser({
        ...user,
        balance: user.balance + 10
      });
    }
    
    // 显示Toast提示
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    
    // 关闭弹窗
    setTimeout(() => setShowSignIn(false), 1500);
  };

  // 刷新功能
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // 模拟刷新请求
    setTimeout(() => {
      // 刷新时重新排序，模拟新任务
      const refreshedTasks = filteredTasks.map(task => ({
        ...task,
        currentUsers: Math.min(
          task.currentUsers + Math.floor(Math.random() * 3),
          task.minUsers
        )
      }));
      
      setDisplayTasks(sortTasks(refreshedTasks));
      setIsRefreshing(false);
    }, 1000);
  }, [isRefreshing, filteredTasks, sortTasks]);

  // 下拉手势刷新
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;
    
    // 下拉超过100px触发刷新
    if (diff > 100) {
      handleRefresh();
    }
  };

  // 领取新人奖励
  const handleClaimNewUserReward = () => {
    if (hasClaimedNewUserReward) return;
    
    setHasClaimedNewUserReward(true);
    setShowNewUserBanner(false);
    
    if (user) {
      setUser({
        ...user,
        balance: user.balance + 50
      });
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div 
      className="min-h-screen bg-[#F2F7FF] pb-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
              onClick={handleRefresh}
              className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border transition-transform duration-300 active:scale-90"
            >
              {isRefreshing ? (
                <Loader2 size={20} className="text-[#36B0FF] animate-spin" />
              ) : (
                <RefreshCw size={20} className="text-slate-500" />
              )}
            </button>
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
        {/* 1. 通栏系统公告栏 */}
        {showAnnouncement && (
          <div 
            className="mb-5 rounded-2xl glass-effect neon-border p-4 cursor-pointer hover:scale-[1.01] transition-transform duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(54,176,255,0.15), rgba(15,86,232,0.08))' }}
            onClick={() => navigate('/announcement')}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Megaphone size={20} className="text-[#36B0FF]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="whitespace-nowrap text-slate-700 text-sm">
                  <div className="animate-marquee inline-block">
                    📢 系统公告：新用户专享¥50现金奖励！每日签到领¥10，邀请好友赚更多！新人好礼，限时领取！&nbsp;&nbsp;&nbsp;&nbsp;
                    📢 系统公告：新用户专享¥50现金奖励！每日签到领¥10，邀请好友赚更多！新人好礼，限时领取！&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnnouncement(false);
                }}
                className="flex-shrink-0 w-6 h-6 glass-effect rounded-full flex items-center justify-center"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* 2. 4宫格功能瓷片区 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <button 
            onClick={() => navigate('/wallet')}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 primary-gradient rounded-full flex items-center justify-center glow-effect">
              <Wallet size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">我的钱包</span>
          </button>

          <button 
            onClick={() => navigate('/my-tasks')}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-effect" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">我的任务</span>
          </button>

          <button 
            onClick={() => navigate('/announcement')}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-effect" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <Bell size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">公告中心</span>
          </button>

          <button 
            onClick={() => navigate('/invite')}
            className="glass-effect neon-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-effect" style={{ background: 'linear-gradient(135deg, #A855F7, #9333EA)' }}>
              <Users size={22} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-700">邀请好友</span>
          </button>
        </div>

        {/* 3. 新人专享奖励通栏Banner */}
        {showNewUserBanner && !hasClaimedNewUserReward && (
          <div 
            className="mb-5 rounded-2xl p-5 cursor-pointer hover:scale-[1.01] transition-transform duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(255,210,102,0.25), rgba(54,176,255,0.15))' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="inline-block px-3 py-1 bg-[#FFD266] text-slate-800 text-xs font-bold rounded-full">新人专属</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">新用户注册奖励</p>
                  <p className="text-3xl font-bold gold-text">¥50.00</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                isGlow
                onClick={handleClaimNewUserReward}
              >
                立即领取
              </Button>
            </div>
          </div>
        )}

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

        {/* 刷新提示 */}
        {isRefreshing && (
          <div className="text-center py-3 mb-4">
            <div className="inline-flex items-center gap-2 text-[#36B0FF] text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>正在刷新任务...</span>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        <div className="space-y-4">
          {displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="glass-effect neon-border px-6 py-3 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-slate-700 font-medium">
              {hasClaimedNewUserReward ? '新人奖励领取成功，¥50已到账！' : '签到成功，¥10已到账！'}
            </span>
          </div>
        </div>
      )}

      {/* 签到弹窗 */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSignIn(false)}
          />
          <div className="relative w-full max-w-md glass-effect rounded-[26px] neon-border glass-card-shadow p-6 animate-fade-in">
            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4 w-8 h-8 glass-effect rounded-full flex items-center justify-center neon-border hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
            
            {/* 顶部装饰条 */}
            <div className="w-12 h-1 bg-slate-300/50 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">每日签到</h2>
            
            {/* 日历签到 */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div 
                  key={day}
                  className={`aspect-square rounded-[12px] flex flex-col items-center justify-center transition-all duration-300 ${
                    signedDays.includes(day) 
                      ? 'primary-gradient text-white' 
                      : 'glass-effect neon-border text-slate-400'
                  }`}
                >
                  <span className="text-[10px] opacity-80">周{['一', '二', '三', '四', '五', '六', '日'][day-1]}</span>
                  <span className="font-bold text-lg">{day}</span>
                </div>
              ))}
            </div>
            
            {/* 连续签到奖励 */}
            <div className="p-5 mb-6 text-center">
              <p className="text-sm text-slate-500 mb-2">连续签到7天可领取现金奖励</p>
              <p className="text-3xl font-bold gold-text">¥10.00</p>
            </div>
            
            {/* 签到按钮 */}
            <Button 
              variant="primary" 
              size="lg" 
              isGlow
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

export default TaskSquare;
