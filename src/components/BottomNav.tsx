import { Home, Users, PlusSquare, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTab, setCurrentTab } = useStore();

  const tabs = [
    { id: 0, icon: Home, label: '任务广场', path: '/' },
    { id: 1, icon: Users, label: '好友邀约', path: '/invite' },
    { id: 2, icon: PlusSquare, label: '发布管理', path: '/publish' },
    { id: 3, icon: User, label: '个人中心', path: '/profile' }
  ];

  const getCurrentTab = () => {
    const path = location.pathname;
    const tab = tabs.find(t => t.path === path);
    return tab ? tab.id : 0;
  };

  const activeTab = getCurrentTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* 顶部冰蓝色分割线 */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#36B0FF] to-transparent" />
      
      {/* 导航栏主体 */}
      <div className="glass-effect">
        <div className="flex justify-around items-center py-3 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  navigate(tab.path);
                }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'scale-95' : 'hover:scale-105'
                }`}
              >
                <div className={`relative ${isActive ? 'glow-effect' : ''}`}>
                  <Icon
                    size={24}
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-[#36B0FF] fill-[#36B0FF]' 
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-[#36B0FF]' 
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
