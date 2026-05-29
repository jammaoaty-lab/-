import React from 'react';
import { CheckCircle, Smartphone, FileText, Gamepad2, Coins } from 'lucide-react';
import IsometricIcon from './IsometricIcon';

interface TaskCategoryIconProps {
  category: string;
  size?: number;
}

export const TaskCategoryIcon: React.FC<TaskCategoryIconProps> = ({
  category,
  size = 36,
}) => {
  const getIconAndColor = () => {
    switch (category) {
      case '简单任务':
        return { icon: <CheckCircle size={size * 0.6} color="#F97316" fill="#F97316" />, color: '#F97316' };
      case 'APP注册':
        return { icon: <Smartphone size={size * 0.6} color="#A855F7" fill="#A855F7" />, color: '#A855F7' };
      case '问卷调研':
        return { icon: <FileText size={size * 0.6} color="#3B82F6" fill="#3B82F6" />, color: '#3B82F6' };
      case '游戏任务':
        return { icon: <Gamepad2 size={size * 0.6} color="#22C55E" fill="#22C55E" />, color: '#22C55E' };
      case '高额赏金':
        return { icon: <Coins size={size * 0.6} color="#F59E0B" fill="#F59E0B" />, color: '#F59E0B' };
      default:
        return { icon: <CheckCircle size={size * 0.6} color="#6B7280" fill="#6B7280" />, color: '#6B7280' };
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
