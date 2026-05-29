import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hasNeonBorder?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const GlassCard = ({ 
  children, 
  className = '', 
  hasNeonBorder = false,
  rounded = 'xl',
  onClick
}: GlassCardProps) => {
  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-[22px]'
  };

  return (
    <div
      className={`
        glass-effect 
        ${roundedClasses[rounded]} 
        ${hasNeonBorder ? 'neon-border glass-card-shadow' : 'card-shadow'} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
