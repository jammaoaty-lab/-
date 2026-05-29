import React from 'react';

interface IsometricIconProps {
  icon: React.ReactNode;
  size?: number;
  color?: string;
  className?: string;
}

export const IsometricIcon: React.FC<IsometricIconProps> = ({
  icon,
  size = 48,
  color = '#36B0FF',
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 3D玻璃基座 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/20 shadow-lg" style={{ transform: 'rotateX(15deg) rotateY(-10deg)' }} />
      
      {/* 图标内容 - 等轴侧放置 */}
      <div 
        className="absolute inset-2 flex items-center justify-center z-10"
        style={{ 
          transform: 'rotateX(15deg) rotateY(-10deg) translateZ(4px)'
        }}
      >
        <div 
          className="flex items-center justify-center"
          style={{ 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        >
          {icon}
        </div>
      </div>
      
      {/* 3D边框 */}
      <div className="absolute inset-0 rounded-2xl border-t border-white/30 pointer-events-none" style={{ transform: 'rotateX(15deg) rotateY(-10deg)' }} />
    </div>
  );
};

export default IsometricIcon;
