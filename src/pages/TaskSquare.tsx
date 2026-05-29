import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Bell, Wallet, RefreshCw, Loader2, X, Megaphone, MessageSquare, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import { Task } from '../types';
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

  const categories = [
    { name: '全部悬赏', bgColor: '#E5E7EB', textColor: '#6B7280' },
    { name: '简单任务', bgColor: '#D1F0F5', textColor: '#4A98A8' },
    { name: 'APP注册', bgColor: '#E1F3E8', textColor: '#4CAF7E' },
    { name: '问卷调研', bgColor: '#FDECE3', textColor: '#E67E50' },
    { name: '游戏任务', bgColor: '#EBE5F6', textColor: '#9B7CCD' },
    { name: '高额赏金', bgColor: '#FCE4E4', textColor: '#E05263' }
  ];

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
      className="min-h-screen page-background pb-28"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
              <p className="text-body text-text-secondary">欢迎来到众包任务</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-card btn-press"
            >
              {isRefreshing ? (
                <Loader2 size={20} className="text-primary animate-spin" />
              ) : (
                <RefreshCw size={20} className="text-text-tertiary" />
              )}
            </button>
            <button 
              onClick={() => setShowSignIn(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-card btn-press relative"
            >
              <Bell size={20} className="text-text-tertiary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 1. 通栏系统公告滚动栏 */}
        {showAnnouncement && (
          <div 
            className="mb-5 rounded-card-large p-4 bg-tag-primary cursor-pointer card-scroll"
            onClick={() => navigate('/announcement')}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Megaphone size={20} className="text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="whitespace-nowrap text-text-secondary text-body">
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
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
              >
                <X size={14} className="text-text-placeholder" />
              </button>
            </div>
          </div>
        )}

        {/* 2. 横向四宫格功能瓷片区 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <button 
            onClick={() => navigate('/my-tasks')}
            className="bg-white rounded-card-large p-4 flex flex-col items-center gap-2 shadow-card btn-press"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#D1F0F5' }}>
              <MessageSquare size={22} style={{ color: '#4A98A8' }} />
            </div>
            <span className="text-caption font-medium text-text-primary">我的任务</span>
          </button>

          <button 
            onClick={() => navigate('/publish')}
            className="bg-white rounded-card-large p-4 flex flex-col items-center gap-2 shadow-card btn-press"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E1F3E8' }}>
              <Gift size={22} style={{ color: '#4CAF7E' }} />
            </div>
            <span className="text-caption font-medium text-text-primary">发布任务</span>
          </button>

          <button 
            onClick={() => navigate('/invite')}
            className="bg-white rounded-card-large p-4 flex flex-col items-center gap-2 shadow-card btn-press"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FDECE3' }}>
              <Users size={22} style={{ color: '#E67E50' }} />
            </div>
            <span className="text-caption font-medium text-text-primary">邀请好友</span>
          </button>

          <button 
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-card-large p-4 flex flex-col items-center gap-2 shadow-card btn-press"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#EBE5F6' }}>
              <Wallet size={22} style={{ color: '#9B7CCD' }} />
            </div>
            <span className="text-caption font-medium text-text-primary">在线客服</span>
          </button>
        </div>

        {/* 3. 通栏新人奖励Banner（深色运营卡片） */}
        {showNewUserBanner && !hasClaimedNewUserReward && (
          <div 
            className="mb-5 dark-banner p-5 cursor-pointer card-scroll"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-caption font-bold tag-round">新人专属</span>
                </div>
                <div>
                  <p className="text-caption text-gray-400 mb-1">新用户注册奖励</p>
                  <p className="text-3xl font-bold text-profit-red">¥50.00</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleClaimNewUserReward}
              >
                立即领取
              </Button>
            </div>
          </div>
        )}

        {/* 4. 深色科技风运营Banner */}
        <div className="mb-5 p-5 card-scroll relative overflow-hidden rounded-card-large" style={{ background: 'linear-gradient(135deg, #1A2333 0%, #0F172A 50%, #1E293B 100%)' }}>
          {/* 多彩渐变光晕背景 */}
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #00C8E0 0%, transparent 70%)' }}></div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}></div>
          
          {/* 丰富粒子光点背景 */}
          <div className="absolute inset-0">
            <div className="absolute top-3 left-8 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
            <div className="absolute top-8 right-16 w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/50"></div>
            <div className="absolute bottom-10 left-24 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50"></div>
            <div className="absolute bottom-6 right-10 w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-lg shadow-violet-400/50"></div>
            <div className="absolute top-16 right-32 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <div className="absolute top-6 left-1/3 w-1 h-1 rounded-full bg-pink-400 animate-pulse"></div>
            <div className="absolute bottom-16 right-1/4 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
            <div className="absolute top-1/2 left-16 w-1 h-1 rounded-full bg-yellow-400 animate-pulse"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            {/* 左侧文案 */}
            <div className="flex-1">
              <h3 className="text-title font-bold mb-2" style={{ 
                background: 'linear-gradient(90deg, #00C8E0, #10B981, #F59E0B)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>全民悬赏接单平台</h3>
              <p className="text-body text-gray-300">海量正规任务，完成即可现金结算提现</p>
            </div>
            
            {/* 右侧科技简约配图 */}
            <div className="ml-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-card-large flex items-center justify-center relative" style={{ 
                background: 'linear-gradient(145deg, rgba(0,200,224,0.15) 0%, rgba(16,185,129,0.1) 100%)',
                border: '1px solid rgba(0,200,224,0.3)',
                boxShadow: '0 0 20px rgba(0,200,224,0.2), inset 0 0 20px rgba(0,200,224,0.05)'
              }}>
                {/* 科技感网格 */}
                <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-cyan-400/80 shadow-lg shadow-cyan-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-lime-400/80 shadow-lg shadow-lime-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-amber-400/80 shadow-lg shadow-amber-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-violet-400/80 shadow-lg shadow-violet-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-emerald-400/80 shadow-lg shadow-emerald-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-sky-400/80 shadow-lg shadow-sky-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-pink-400/80 shadow-lg shadow-pink-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400/80 shadow-lg shadow-yellow-400/50"></div>
                  <div className="w-4 h-4 rounded-full bg-fuchsia-400/80 shadow-lg shadow-fuchsia-400/50"></div>
                </div>
                
                {/* 连接线条 */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 80 80">
                  <line x1="15" y1="15" x2="65" y2="65" stroke="#00C8E0" strokeWidth="1"/>
                  <line x1="65" y1="15" x2="15" y2="65" stroke="#10B981" strokeWidth="1"/>
                  <line x1="40" y1="10" x2="40" y2="70" stroke="#F59E0B" strokeWidth="0.5"/>
                </svg>
              </div>
              
              <div className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 分类筛选横向胶囊标签栏 */}
        <div className="mb-5 overflow-x-auto pb-2 -mx-5 px-5">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-5 py-2 capsule-btn text-body font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.name
                    ? 'primary-gradient text-white shadow-float'
                    : ''
                }`}
                style={selectedCategory === category.name ? undefined : { backgroundColor: category.bgColor, color: category.textColor }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 刷新提示 */}
        {isRefreshing && (
          <div className="text-center py-3 mb-4">
            <div className="inline-flex items-center gap-2 text-primary text-body">
              <Loader2 size={16} className="animate-spin" />
              <span>正在刷新任务...</span>
            </div>
          </div>
        )}

        {/* 任务列表单列瀑布流 */}
        <div className="space-y-4 pb-4">
          {displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="bg-white shadow-float px-6 py-3 rounded-card-large flex items-center gap-2">
            <div className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-text-primary font-medium text-body">
              {hasClaimedNewUserReward ? '新人奖励领取成功，¥50已到账！' : '签到成功，¥10已到账！'}
            </span>
          </div>
        </div>
      )}

      {/* 签到弹窗（居中悬浮） */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSignIn(false)}
          />
          <div className="relative w-full max-w-md bg-white modal-round shadow-float p-6 animate-slide-up">
            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-placeholder hover:text-text-tertiary"
            >
              <X size={18} />
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

export default TaskSquare;
