import React from 'react';

interface GlassIconProps {
  children: React.ReactNode;
  size?: number;
  gradient?: string;
  className?: string;
}

export const GlassIcon: React.FC<GlassIconProps> = ({
  children,
  size = 24,
  gradient = 'from-blue-400 to-blue-600',
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 3D玻璃质感外框 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-blue-500/20" />
      
      {/* 内发光效果 */}
      <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
      
      {/* 主渐变填充 */}
      <div className={`absolute inset-2 rounded-md bg-gradient-to-br ${gradient} opacity-90`} />
      
      {/* 高光效果 */}
      <div className="absolute inset-2 rounded-t-md bg-gradient-to-b from-white/40 to-transparent" />
      
      {/* 图标内容 */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: size * 0.6, height: size * 0.6 }}>
        <div className="filter drop-shadow-md">
          {children}
        </div>
      </div>
      
      {/* 边缘光晕 */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-blue-400/30" />
    </div>
  );
};

export default GlassIcon;
