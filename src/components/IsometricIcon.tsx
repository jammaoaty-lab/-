import React from 'react';

interface IsometricIconProps {
  icon: React.ReactNode;
  size?: number;
  color?: string;
  rotation?: number;
  className?: string;
}

export const IsometricIcon: React.FC<IsometricIconProps> = ({
  icon,
  size = 48,
  color = '#36B0FF',
  rotation = 0,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center perspective-1000 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 3D基座 */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/30"
        style={{
          transform: `rotateX(20deg) rotateY(-20deg) rotate(${rotation}deg)`,
        }}
      />
      
      {/* 等轴侧投影底图 */}
      <div 
        className="absolute inset-2 rounded-xl bg-gradient-to-br from-black/10 to-black/5"
        style={{
          transform: `translateY(8px) rotateX(20deg) rotateY(-20deg) rotate(${rotation}deg)`,
          filter: 'blur(4px)',
        }}
      />
      
      {/* 主图标容器 - 等轴侧视角 */}
      <div 
        className="absolute inset-4 rounded-lg bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/40 shadow-xl"
        style={{
          transform: `rotateX(20deg) rotateY(-20deg) rotate(${rotation}deg) translateZ(8px)`,
        }}
      >
        {/* 内部渐变发光 */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}40, transparent)`,
          }}
        />
      </div>
      
      {/* 图标SVG - 3D放置 */}
      <div 
        className="relative z-20 flex items-center justify-center"
        style={{
          transform: `rotateX(20deg) rotateY(-20deg) rotate(${rotation}deg) translateZ(16px)`,
          width: size * 0.5,
          height: size * 0.5,
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        >
          {icon}
        </div>
      </div>
      
      {/* 顶部高光层 */}
      <div 
        className="absolute inset-4 rounded-t-lg bg-gradient-to-b from-white/60 to-transparent pointer-events-none"
        style={{
          transform: `rotateX(20deg) rotateY(-20deg) rotate(${rotation}deg) translateZ(12px)`,
        }}
      />
    </div>
  );
};

export default IsometricIcon;
