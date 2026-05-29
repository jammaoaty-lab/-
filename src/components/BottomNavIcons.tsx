import React from 'react';
import { Home, Users, PlusSquare, Wallet, User } from 'lucide-react';

interface BottomNavIconProps {
  type: 'tasks' | 'invite' | 'publish' | 'wallet' | 'profile';
  size?: number;
  active?: boolean;
}

export const BottomNavIcon: React.FC<BottomNavIconProps> = ({
  type,
  size = 24,
  active = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'tasks':
        return <Home size={size} strokeWidth={2} />;
      case 'invite':
        return <Users size={size} strokeWidth={2} />;
      case 'publish':
        return <PlusSquare size={size} strokeWidth={2} />;
      case 'wallet':
        return <Wallet size={size} strokeWidth={2} />;
      case 'profile':
        return <User size={size} strokeWidth={2} />;
      default:
        return <Home size={size} strokeWidth={2} />;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getIcon()}
    </div>
  );
};

export default BottomNavIcon;
