import { Task } from '../types';
import { formatCurrency } from '../utils/format';
import GlassCard from './GlassCard';
import { Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'APP注册': 'bg-purple-100 text-purple-600',
      '问卷调研': 'bg-blue-100 text-blue-600',
      '游戏任务': 'bg-green-100 text-green-600',
      '简单任务': 'bg-orange-100 text-orange-600',
      '高额赏金': 'bg-red-100 text-red-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const progress = (task.currentUsers / task.minUsers) * 100;

  return (
    <GlassCard 
      className="p-5 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* 任务分类 */}
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>
          
          {/* 任务标题 */}
          <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
            {task.title}
          </h3>
          
          {/* 进度条 */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>剩余名额</span>
              <span>{task.minUsers - task.currentUsers} / {task.minUsers}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full primary-gradient rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 赏金金额 */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end mb-1">
            <Zap size={14} className="text-[#FFD266]" />
            <span className="text-sm text-slate-500">赏金</span>
          </div>
          <div className="text-2xl font-bold gold-text">
            {formatCurrency(task.reward)}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TaskCard;
