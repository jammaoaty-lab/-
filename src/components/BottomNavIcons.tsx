import React from 'react';
import IsometricIcon from './IsometricIcon';

// 任务广场图标
const TaskSquareIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 等轴侧网格 */}
    <path d="M8 32L32 16L56 32L32 48L8 32Z" fill="url(#blueGrad1)" stroke="#36B0FF" strokeWidth="1.5"/>
    <path d="M8 32L32 48L32 64L8 48L8 32Z" fill="url(#blueGrad2)" stroke="#36B0FF" strokeWidth="1.5"/>
    <path d="M56 32L32 48L32 64L56 48L56 32Z" fill="url(#blueGrad3)" stroke="#36B0FF" strokeWidth="1.5"/>
    
    {/* 任务卡片 */}
    <rect x="18" y="20" width="12" height="8" rx="1.5" fill="url(#blueGrad4)" stroke="#0F56E8" strokeWidth="1"/>
    <rect x="34" y="24" width="12" height="8" rx="1.5" fill="url(#blueGrad5)" stroke="#0F56E8" strokeWidth="1"/>
    <rect x="22" y="32" width="16" height="8" rx="1.5" fill="url(#blueGrad6)" stroke="#0F56E8" strokeWidth="1"/>
    
    <defs>
      <linearGradient id="blueGrad1" x1="8" y1="16" x2="56" y2="48">
        <stop stopColor="#DBEAFE"/>
        <stop offset="1" stopColor="#93C5FD"/>
      </linearGradient>
      <linearGradient id="blueGrad2" x1="8" y1="32" x2="32" y2="64">
        <stop stopColor="#93C5FD"/>
        <stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
      <linearGradient id="blueGrad3" x1="56" y1="32" x2="32" y2="64">
        <stop stopColor="#60A5FA"/>
        <stop offset="1" stopColor="#2563EB"/>
      </linearGradient>
      <linearGradient id="blueGrad4" x1="18" y1="20" x2="30" y2="28">
        <stop stopColor="#60A5FA"/>
        <stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
      <linearGradient id="blueGrad5" x1="34" y1="24" x2="46" y2="32">
        <stop stopColor="#93C5FD"/>
        <stop offset="1" stopColor="#60A5FA"/>
      </linearGradient>
      <linearGradient id="blueGrad6" x1="22" y1="32" x2="38" y2="40">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#2563EB"/>
      </linearGradient>
    </defs>
  </svg>
);

// 好友邀约图标
const InviteIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 两个用户等轴侧 */}
    <circle cx="24" cy="28" r="10" fill="url(#greenGrad1)" stroke="#22C55E" strokeWidth="1.5"/>
    <circle cx="40" cy="28" r="10" fill="url(#greenGrad2)" stroke="#22C55E" strokeWidth="1.5"/>
    
    {/* 连接线条 */}
    <path d="M30 32L34 32" stroke="#166534" strokeWidth="2" strokeDasharray="2 2"/>
    
    {/* 用户头像 */}
    <circle cx="24" cy="28" r="6" fill="url(#greenGrad3)"/>
    <path d="M21 32L24 34L27 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    
    <circle cx="40" cy="28" r="6" fill="url(#greenGrad4)"/>
    <path d="M37 32L40 34L43 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* 基础 */}
    <ellipse cx="24" cy="46" rx="10" ry="3" fill="#166534" opacity="0.2"/>
    <ellipse cx="40" cy="46" rx="10" ry="3" fill="#166534" opacity="0.2"/>
    
    <defs>
      <linearGradient id="greenGrad1" x1="14" y1="18" x2="34" y2="38">
        <stop stopColor="#DCFCE7"/>
        <stop offset="1" stopColor="#86EFAC"/>
      </linearGradient>
      <linearGradient id="greenGrad2" x1="30" y1="18" x2="50" y2="38">
        <stop stopColor="#F0FDF4"/>
        <stop offset="1" stopColor="#86EFAC"/>
      </linearGradient>
      <linearGradient id="greenGrad3" x1="18" y1="22" x2="30" y2="34">
        <stop stopColor="#22C55E"/>
        <stop offset="1" stopColor="#16A34A"/>
      </linearGradient>
      <linearGradient id="greenGrad4" x1="34" y1="22" x2="46" y2="34">
        <stop stopColor="#4ADE80"/>
        <stop offset="1" stopColor="#22C55E"/>
      </linearGradient>
    </defs>
  </svg>
);

// 发布管理图标
const PublishIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 发布按钮等轴侧 */}
    <path d="M20 40L32 28L44 40L32 52L20 40Z" fill="url(#purpleGrad1)" stroke="#A855F7" strokeWidth="1.5"/>
    <path d="M20 40L32 52L32 60L20 48L20 40Z" fill="url(#purpleGrad2)" stroke="#A855F7" strokeWidth="1.5"/>
    <path d="M44 40L32 52L32 60L44 48L44 40Z" fill="url(#purpleGrad3)" stroke="#A855F7" strokeWidth="1.5"/>
    
    {/* 发布箭头 */}
    <path d="M32 20L32 32M28 26L32 22L36 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* 文档图标 */}
    <rect x="26" y="36" width="12" height="10" rx="1.5" fill="url(#purpleGrad4)" stroke="#9333EA" strokeWidth="1"/>
    <rect x="28" y="39" width="6" height="1.5" rx="0.75" fill="#F3E8FF"/>
    <rect x="28" y="42" width="8" height="1.5" rx="0.75" fill="#E9D5FF"/>
    
    <defs>
      <linearGradient id="purpleGrad1" x1="20" y1="28" x2="44" y2="52">
        <stop stopColor="#F3E8FF"/>
        <stop offset="1" stopColor="#C084FC"/>
      </linearGradient>
      <linearGradient id="purpleGrad2" x1="20" y1="40" x2="32" y2="60">
        <stop stopColor="#C084FC"/>
        <stop offset="1" stopColor="#9333EA"/>
      </linearGradient>
      <linearGradient id="purpleGrad3" x1="44" y1="40" x2="32" y2="60">
        <stop stopColor="#A855F7"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <linearGradient id="purpleGrad4" x1="26" y1="36" x2="38" y2="46">
        <stop stopColor="#E9D5FF"/>
        <stop offset="1" stopColor="#C084FC"/>
      </linearGradient>
    </defs>
  </svg>
);

// 个人中心图标
const ProfileIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 个人卡片等轴侧 */}
    <path d="M16 36L32 24L48 36L32 48L16 36Z" fill="url(#orangeGrad1)" stroke="#F97316" strokeWidth="1.5"/>
    <path d="M16 36L32 48L32 56L16 44L16 36Z" fill="url(#orangeGrad2)" stroke="#F97316" strokeWidth="1.5"/>
    <path d="M48 36L32 48L32 56L48 44L48 36Z" fill="url(#orangeGrad3)" stroke="#F97316" strokeWidth="1.5"/>
    
    {/* 用户头像 */}
    <circle cx="32" cy="34" r="6" fill="url(#orangeGrad4)"/>
    
    {/* 用户名 */}
    <rect x="24" y="42" width="16" height="2.5" rx="1.25" fill="#FED7AA"/>
    <rect x="26" y="46" width="12" height="1.5" rx="0.75" fill="#FDBA74"/>
    
    <defs>
      <linearGradient id="orangeGrad1" x1="16" y1="24" x2="48" y2="48">
        <stop stopColor="#FFEDD5"/>
        <stop offset="1" stopColor="#FDBA74"/>
      </linearGradient>
      <linearGradient id="orangeGrad2" x1="16" y1="36" x2="32" y2="56">
        <stop stopColor="#FDBA74"/>
        <stop offset="1" stopColor="#F97316"/>
      </linearGradient>
      <linearGradient id="orangeGrad3" x1="48" y1="36" x2="32" y2="56">
        <stop stopColor="#FB923C"/>
        <stop offset="1" stopColor="#EA580C"/>
      </linearGradient>
      <linearGradient id="orangeGrad4" x1="26" y1="28" x2="38" y2="40">
        <stop stopColor="#F97316"/>
        <stop offset="1" stopColor="#EA580C"/>
      </linearGradient>
    </defs>
  </svg>
);

interface BottomNavIconProps {
  type: 'tasks' | 'invite' | 'publish' | 'profile';
  size?: number;
  active?: boolean;
}

export const BottomNavIcon: React.FC<BottomNavIconProps> = ({
  type,
  size = 44,
  active = false,
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'tasks':
        return { icon: <TaskSquareIcon />, color: '#36B0FF' };
      case 'invite':
        return { icon: <InviteIcon />, color: '#22C55E' };
      case 'publish':
        return { icon: <PublishIcon />, color: '#A855F7' };
      case 'profile':
        return { icon: <ProfileIcon />, color: '#F97316' };
      default:
        return { icon: <TaskSquareIcon />, color: '#6B7280' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <IsometricIcon
      icon={icon}
      size={size}
      color={color}
      rotation={active ? 5 : 0}
    />
  );
};

export default BottomNavIcon;
