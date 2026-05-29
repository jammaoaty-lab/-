import React from 'react';
import { Home, Users, PlusSquare, User } from 'lucide-react';
import IsometricIcon from './IsometricIcon';

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
        return { 
          icon: <Home size={size * 0.6} color={active ? '#36B0FF' : '#6B7280'} fill={active ? '#36B0FF' : 'none'} />, 
          color: '#36B0FF' 
        };
      case 'invite':
        return { 
          icon: <Users size={size * 0.6} color={active ? '#22C55E' : '#6B7280'} fill={active ? '#22C55E' : 'none'} />, 
          color: '#22C55E' 
        };
      case 'publish':
        return { 
          icon: <PlusSquare size={size * 0.6} color={active ? '#A855F7' : '#6B7280'} fill={active ? '#A855F7' : 'none'} />, 
          color: '#A855F7' 
        };
      case 'profile':
        return { 
          icon: <User size={size * 0.6} color={active ? '#F97316' : '#6B7280'} fill={active ? '#F97316' : 'none'} />, 
          color: '#F97316' 
        };
      default:
        return { 
          icon: <Home size={size * 0.6} color="#6B7280" fill="none" />, 
          color: '#6B7280' 
        };
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

export default BottomNavIcon;
