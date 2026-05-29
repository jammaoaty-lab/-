import { Task } from '../types';
import { formatCurrency } from '../utils/format';
import { Zap, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { TaskCategoryIcon } from './TaskCategoryIcons';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const progress = (task.currentUsers / task.minUsers) * 100;
  // 判断是否为高额任务：category为"高额赏金"或reward>=10
  const isHighReward = task.category === '高额赏金' || task.reward >= 10;

  return (
    <div 
      className="rounded-card-task shadow-card p-5 cursor-pointer card-scroll relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,252,255,0.92) 100%)' }}
      onClick={onClick}
    >
      {/* 置顶标签 - 左上角（调整位置避免覆盖头像） */}
      {task.isPinned && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block px-3 py-1 text-primary text-caption font-semibold tag-round" style={{ background: '#E6F7FF' }}>
            置顶
          </span>
        </div>
      )}
      
      {/* 热门标签 - 右上角 */}
      {task.isHot && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-white text-caption font-semibold tag-round" style={{ background: 'linear-gradient(135deg, #FF9A50 0%, #FF6B35 100%)' }}>
            <Flame size={12} fill="currentColor" />
            热门
          </span>
        </div>
      )}
      
      {/* 高额任务标签 - 如果同时有置顶和热门，放在热门标签左侧 */}
      {isHighReward && (
        <div className={`absolute top-3 z-10 ${task.isHot ? 'right-20' : 'right-3'}`}>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-white text-caption font-semibold tag-round" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #F53F3F 100%)' }}>
            高额
          </span>
        </div>
      )}

      <div className={`space-y-4 ${(task.isPinned || task.isHot || isHighReward) ? 'pt-7' : ''}`}>
        {/* 第一行：悬赏主信息 + 赏金 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 悬赏主头像 */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              <img
                src={task.publisherAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={task.publisherName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 悬赏主昵称 */}
            <span className="text-body font-medium text-text-primary">
              {task.publisherName || '匿名用户'}
            </span>
          </div>
          
          {/* 赏金金额 */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Zap size={14} className="text-primary" />
              <span className="text-caption text-text-tertiary">赏金</span>
            </div>
            <div className="text-2xl font-bold text-profit-red">
              {formatCurrency(task.reward)}
            </div>
          </div>
        </div>

        {/* 第二行：分类标签 + 标题 */}
        <div className="flex items-start gap-3">
          <span className="px-2 py-1 bg-tag-primary text-primary text-caption tag-round">
            {task.category}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-semibold text-text-primary line-clamp-2">
              {task.title}
            </h3>
          </div>
        </div>

        {/* 第三行：进度条 */}
        <div>
          <div className="flex justify-between text-caption text-text-tertiary mb-1">
            <span>剩余名额</span>
            <span>{task.minUsers - task.currentUsers} / {task.minUsers}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full primary-gradient rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* 第四行：审核时效 + 立即接单按钮 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-text-tertiary text-caption">
            <Clock size={14} />
            <span>{task.reviewTime || '24小时审核'}</span>
          </div>
          <button className="px-6 py-2 primary-gradient text-white text-body font-semibold capsule-btn btn-press">
            立即接单
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
