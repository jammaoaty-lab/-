import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Megaphone, Calendar } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Announcement = () => {
  const navigate = useNavigate();

  // 模拟公告列表
  const announcements = [
    {
      id: 1,
      title: '新用户专享¥50现金奖励',
      content: '欢迎加入众包任务平台！新用户注册即可领取¥50现金奖励，完成首单任务还有额外红包。',
      type: '活动',
      date: '2024-01-15',
      isNew: true
    },
    {
      id: 2,
      title: '每日签到领¥10现金',
      content: '每日打开APP签到即可领取¥10现金奖励，连续签到7天额外获得神秘大奖！',
      type: '活动',
      date: '2024-01-14',
      isNew: true
    },
    {
      id: 3,
      title: '邀请好友赚赏金',
      content: '邀请好友注册并完成任务，即可获得丰厚赏金奖励，多邀多得，上不封顶！',
      type: '公告',
      date: '2024-01-13',
      isNew: false
    },
    {
      id: 4,
      title: '系统升级维护通知',
      content: '为了提供更好的服务体验，系统将于本周六凌晨2:00-4:00进行升级维护，届时可能会影响部分功能使用。',
      type: '通知',
      date: '2024-01-12',
      isNew: false
    },
    {
      id: 5,
      title: '春节活动预告',
      content: '春节期间将推出一系列超值活动，敬请期待！完成指定任务更有机会获得iPhone 15大奖！',
      type: '活动',
      date: '2024-01-10',
      isNew: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case '活动':
        return 'bg-[#FFD266] text-slate-800';
      case '公告':
        return 'bg-[#36B0FF] text-white';
      case '通知':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-300 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border hover:scale-95 transition-transform duration-300"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center glow-effect">
              <Bell size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">公告中心</h1>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 公告列表 */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <GlassCard 
              key={announcement.id} 
              className="p-5 cursor-pointer hover:scale-[1.01] transition-transform duration-300"
              hasNeonBorder
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(54,176,255,0.15), rgba(15,86,232,0.08))' }}>
                    <Megaphone size={20} className="text-[#36B0FF]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    {announcement.isNew && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">NEW</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2 line-clamp-1">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>{announcement.date}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* 空状态提示 */}
        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 glass-effect rounded-2xl flex items-center justify-center mb-4 neon-border">
              <Bell size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-base">暂无公告</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcement;
