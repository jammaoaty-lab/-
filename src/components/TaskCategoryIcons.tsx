import React from 'react';
import IsometricIcon from './IsometricIcon';

// 简单任务图标（等轴侧视角）
const SimpleTaskIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3D矩形底座 */}
    <path d="M8 24L32 8L56 24L32 40L8 24Z" fill="url(#orangeGrad1)" stroke="#F97316" strokeWidth="1.5"/>
    <path d="M8 24L32 40L32 56L8 40L8 24Z" fill="url(#orangeGrad2)" stroke="#F97316" strokeWidth="1.5"/>
    <path d="M56 24L32 40L32 56L56 40L56 24Z" fill="url(#orangeGrad3)" stroke="#F97316" strokeWidth="1.5"/>
    
    {/* 勾选标记 */}
    <circle cx="32" cy="32" r="8" fill="#22C55E" opacity="0.9"/>
    <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    <defs>
      <linearGradient id="orangeGrad1" x1="8" y1="8" x2="56" y2="40">
        <stop stopColor="#FED7AA"/>
        <stop offset="1" stopColor="#FDBA74"/>
      </linearGradient>
      <linearGradient id="orangeGrad2" x1="8" y1="24" x2="32" y2="56">
        <stop stopColor="#FDBA74"/>
        <stop offset="1" stopColor="#F97316"/>
      </linearGradient>
      <linearGradient id="orangeGrad3" x1="56" y1="24" x2="32" y2="56">
        <stop stopColor="#FB923C"/>
        <stop offset="1" stopColor="#EA580C"/>
      </linearGradient>
    </defs>
  </svg>
);

// APP注册图标
const AppRegisterIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 手机3D效果 */}
    <rect x="20" y="12" width="24" height="40" rx="4" fill="url(#purpleGrad1)" stroke="#A855F7" strokeWidth="1.5"/>
    <rect x="23" y="16" width="18" height="30" rx="2" fill="url(#purpleGrad2)" stroke="#C084FC" strokeWidth="1"/>
    
    {/* 屏幕内容 */}
    <rect x="25" y="20" width="14" height="2" rx="1" fill="#E9D5FF"/>
    <rect x="25" y="24" width="10" height="1.5" rx="0.75" fill="#F3E8FF"/>
    <rect x="25" y="27" width="12" height="1.5" rx="0.75" fill="#F3E8FF"/>
    
    {/* 注册按钮 */}
    <circle cx="32" cy="40" r="4" fill="url(#purpleGrad3)"/>
    <path d="M32 38L32 42M30 40L34 40" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    
    {/* 3D侧面 */}
    <path d="M44 12L48 14L48 54L44 52V12Z" fill="url(#purpleGrad4)"/>
    <path d="M20 12L16 14L16 54L20 52V12Z" fill="url(#purpleGrad5)"/>
    
    <defs>
      <linearGradient id="purpleGrad1" x1="20" y1="12" x2="44" y2="52">
        <stop stopColor="#E9D5FF"/>
        <stop offset="1" stopColor="#C084FC"/>
      </linearGradient>
      <linearGradient id="purpleGrad2" x1="23" y1="16" x2="41" y2="46">
        <stop stopColor="#FAF5FF"/>
        <stop offset="1" stopColor="#F3E8FF"/>
      </linearGradient>
      <linearGradient id="purpleGrad3" x1="28" y1="36" x2="36" y2="44">
        <stop stopColor="#A855F7"/>
        <stop offset="1" stopColor="#9333EA"/>
      </linearGradient>
      <linearGradient id="purpleGrad4" x1="44" y1="12" x2="48" y2="54">
        <stop stopColor="#C084FC"/>
        <stop offset="1" stopColor="#9333EA"/>
      </linearGradient>
      <linearGradient id="purpleGrad5" x1="16" y1="14" x2="20" y2="52">
        <stop stopColor="#F3E8FF"/>
        <stop offset="1" stopColor="#C084FC"/>
      </linearGradient>
    </defs>
  </svg>
);

// 问卷调研图标
const SurveyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 文档3D效果 */}
    <path d="M12 48L12 16L44 8L52 24L52 56L20 56L12 48Z" fill="url(#blueGrad1)" stroke="#3B82F6" strokeWidth="1.5"/>
    
    {/* 问卷选项 */}
    <rect x="18" y="20" width="28" height="3" rx="1.5" fill="#DBEAFE"/>
    <circle cx="20" cy="28" r="2" fill="#3B82F6"/>
    <rect x="24" y="26.5" width="18" height="2" rx="1" fill="#DBEAFE"/>
    <circle cx="20" cy="34" r="2" fill="#DBEAFE" stroke="#3B82F6"/>
    <rect x="24" y="32.5" width="20" height="2" rx="1" fill="#EFF6FF"/>
    <circle cx="20" cy="40" r="2" fill="#DBEAFE" stroke="#3B82F6"/>
    <rect x="24" y="38.5" width="16" height="2" rx="1" fill="#EFF6FF"/>
    
    {/* 钢笔图标 */}
    <path d="M46 20L50 24L38 36L34 36L34 32L46 20Z" fill="#3B82F6"/>
    
    <defs>
      <linearGradient id="blueGrad1" x1="12" y1="8" x2="52" y2="56">
        <stop stopColor="#DBEAFE"/>
        <stop offset="1" stopColor="#93C5FD"/>
      </linearGradient>
    </defs>
  </svg>
);

// 游戏任务图标
const GameTaskIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 游戏手柄3D效果 */}
    <rect x="12" y="20" width="40" height="24" rx="12" fill="url(#greenGrad1)" stroke="#22C55E" strokeWidth="1.5"/>
    
    {/* 方向键 */}
    <rect x="18" y="26" width="8" height="8" rx="2" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1"/>
    <rect x="20" y="28" width="4" height="2" fill="#22C55E"/>
    <rect x="21" y="29" width="2" height="4" fill="#22C55E"/>
    
    {/* 动作按钮 */}
    <circle cx="42" cy="30" r="3" fill="#FECACA" stroke="#EF4444" strokeWidth="1"/>
    <circle cx="48" cy="30" r="3" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1"/>
    
    {/* 3D细节 */}
    <ellipse cx="32" cy="44" rx="16" ry="4" fill="url(#greenGrad2)" opacity="0.5"/>
    
    <defs>
      <linearGradient id="greenGrad1" x1="12" y1="20" x2="52" y2="44">
        <stop stopColor="#DCFCE7"/>
        <stop offset="1" stopColor="#86EFAC"/>
      </linearGradient>
      <linearGradient id="greenGrad2" x1="16" y1="40" x2="48" y2="48">
        <stop stopColor="#22C55E" opacity="0.3"/>
        <stop offset="1" stopColor="#166534" opacity="0.2"/>
      </linearGradient>
    </defs>
  </svg>
);

// 高额赏金图标
const HighRewardIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 金币堆3D效果 */}
    <ellipse cx="32" cy="48" rx="16" ry="6" fill="url(#goldGrad1)"/>
    <ellipse cx="32" cy="44" rx="14" ry="5" fill="url(#goldGrad2)"/>
    <ellipse cx="32" cy="40" rx="12" ry="4" fill="url(#goldGrad3)"/>
    
    {/* 主金币 */}
    <circle cx="32" cy="32" r="12" fill="url(#goldGrad4)" stroke="#F59E0B" strokeWidth="1.5"/>
    
    {/* 币值符号 */}
    <text x="32" y="37" textAnchor="middle" fill="#92400E" fontSize="14" fontWeight="bold">¥</text>
    
    {/* 星星装饰 */}
    <path d="M48 20L49.5 23.5L53 24L50.5 26.5L51 30L48 28L45 30L45.5 26.5L43 24L46.5 23.5L48 20Z" fill="#FCD34D"/>
    <path d="M16 24L17 26.5L19.5 27L18 29L18.5 32L16 30.5L13.5 32L14 29L12.5 27L15 26.5L16 24Z" fill="#FCD34D" opacity="0.8"/>
    
    <defs>
      <linearGradient id="goldGrad1" x1="16" y1="42" x2="48" y2="54">
        <stop stopColor="#D97706"/>
        <stop offset="1" stopColor="#92400E"/>
      </linearGradient>
      <linearGradient id="goldGrad2" x1="18" y1="39" x2="46" y2="49">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#D97706"/>
      </linearGradient>
      <linearGradient id="goldGrad3" x1="20" y1="36" x2="44" y2="44">
        <stop stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      <linearGradient id="goldGrad4" x1="20" y1="20" x2="44" y2="44">
        <stop stopColor="#FEF3C7"/>
        <stop offset="0.5" stopColor="#FCD34D"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);

interface TaskCategoryIconProps {
  category: string;
  size?: number;
}

export const TaskCategoryIcon: React.FC<TaskCategoryIconProps> = ({
  category,
  size = 40,
}) => {
  const getIconAndColor = () => {
    switch (category) {
      case '简单任务':
        return { icon: <SimpleTaskIcon />, color: '#F97316' };
      case 'APP注册':
        return { icon: <AppRegisterIcon />, color: '#A855F7' };
      case '问卷调研':
        return { icon: <SurveyIcon />, color: '#3B82F6' };
      case '游戏任务':
        return { icon: <GameTaskIcon />, color: '#22C55E' };
      case '高额赏金':
        return { icon: <HighRewardIcon />, color: '#F59E0B' };
      default:
        return { icon: <SimpleTaskIcon />, color: '#6B7280' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <IsometricIcon
      icon={icon}
      size={size}
      color={color}
    />
  );
};

export default TaskCategoryIcon;
