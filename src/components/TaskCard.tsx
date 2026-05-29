import { Task } from '../types';
import { formatCurrency } from '../utils/format';
import GlassCard from './GlassCard';
import { Zap, Flame } from 'lucide-react';

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
      className="p-5 cursor-pointer hover:scale-[1.01] transition-transform duration-300 relative"
      onClick={onClick}
    >
      {/* 置顶标签 - 固定在左上角外侧 */}
      {task.isPinned && (
        <div className="absolute -top-2 -left-2 z-10">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#36B0FF] to-[#0F56E8] text-white text-xs font-bold rounded-xl shadow-md">
            置顶
          </span>
        </div>
      )}
      
      {/* 热门标签 - 固定在右上角内侧 */}
      {task.isHot && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
            <Flame size={12} fill="currentColor" />
            热门
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* 第一行：悬赏主信息 + 赏金 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 悬赏主头像 */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#36B0FF]/30 shadow-sm">
              <img
                src={task.publisherAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={task.publisherName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 悬赏主昵称 */}
            <span className="text-sm font-medium text-slate-700">
              {task.publisherName || '匿名用户'}
            </span>
          </div>
          
          {/* 赏金金额 */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Zap size={14} className="text-[#FFD266]" />
              <span className="text-sm text-slate-500">赏金</span>
            </div>
            <div className="text-2xl font-bold gold-text">
              {formatCurrency(task.reward)}
            </div>
          </div>
        </div>

        {/* 第二行：分类 + 标题 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
            {task.title}
          </h3>
        </div>

        {/* 第三行：进度条 */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>剩余名额</span>
            <span>{task.minUsers - task.currentUsers} / {task.minUsers}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#36B0FF] to-[#0F56E8] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* 第四行：审核时效 + 立即接单按钮 */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {task.reviewTime || '24小时审核'}
          </span>
          <button className="px-5 py-2 primary-gradient text-white text-sm font-semibold rounded-xl glow-effect hover:opacity-90 transition-opacity">
            立即接单
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default TaskCard;
