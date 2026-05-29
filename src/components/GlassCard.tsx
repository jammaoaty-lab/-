import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hasNeonBorder?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlassCard = ({ 
  children, 
  className = '', 
  hasNeonBorder = false,
  rounded = 'xl' 
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
    >
      {children}
    </div>
  );
};

export default GlassCard;
