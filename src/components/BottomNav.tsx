import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { BottomNavIcon } from './BottomNavIcons';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTab, setCurrentTab } = useStore();

  const tabs = [
    { id: 0, type: 'tasks' as const, label: '任务广场', path: '/' },
    { id: 1, type: 'invite' as const, label: '好友邀约', path: '/invite' },
    { id: 2, type: 'publish' as const, label: '发布管理', path: '/publish' },
    { id: 3, type: 'wallet' as const, label: '我的钱包', path: '/wallet' },
    { id: 4, type: 'profile' as const, label: '个人中心', path: '/profile' }
  ];

  const getCurrentTab = () => {
    const path = location.pathname;
    const tab = tabs.find(t => t.path === path);
    return tab ? tab.id : 0;
  };

  const activeTab = getCurrentTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white">
      {/* 顶部轻量分割线 */}
      <div className="h-[0.5px] bg-gray-100" />
      
      {/* 导航栏主体 - 宽度均分、图标文字对齐 */}
      <div className="bg-white">
        <div className="flex justify-center items-center py-2 pb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  navigate(tab.path);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200 btn-press ${
                  isActive ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10">
                  <BottomNavIcon
                    type={tab.type}
                    size={22}
                    active={isActive}
                  />
                </div>
                <span
                  className={`text-caption font-medium transition-all duration-200 text-center ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-text-tertiary'
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
