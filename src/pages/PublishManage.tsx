import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/format';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const PublishManage = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [selectedStatus, setSelectedStatus] = useState('上架中');

  const statusTabs = ['上架中', '待审核', '已暂停', '已结束', '已下架'];

  const publishedTasks = [
    {
      id: '1',
      title: 'APP新用户注册体验',
      budget: 550,
      currentUsers: 45,
      deadline: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      title: '产品问卷调查',
      budget: 300,
      currentUsers: 78,
      deadline: '2024-12-25',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'text-green-500 bg-green-50',
      pending: 'text-orange-500 bg-orange-50',
      paused: 'text-gray-500 bg-gray-50',
      ended: 'text-blue-500 bg-blue-50'
    };
    return colors[status] || 'text-gray-500 bg-gray-50';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: '进行中',
      pending: '待审核',
      paused: '已暂停',
      ended: '已结束'
    };
    return texts[status] || '未知';
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-24">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold text-slate-800 text-center">任务发布管理</h1>
        <div className="absolute top-12 right-5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/wallet')}
          >
            账户充值
          </Button>
        </div>
      </div>

      <div className="px-5">
        {/* 资金卡片 */}
        <GlassCard className="p-5 mb-6" hasNeonBorder>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">发单账户余额</p>
              <p className="text-3xl font-bold gold-text">{formatCurrency(user?.balance || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">上架中任务</p>
              <p className="text-xl font-bold text-[#0F56E8]">2个</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="md"
              className="flex-1"
              onClick={() => navigate('/wallet')}
            >
              账户充值
            </Button>
            <Button 
              variant="primary" 
              size="md"
              className="flex-1"
              onClick={() => navigate('/wallet')}
            >
              提现余额
            </Button>
          </div>
        </GlassCard>

        {/* 状态筛选Tab */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-5 px-5">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedStatus === status
                    ? 'primary-gradient text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 已发布任务列表 */}
        {publishedTasks.length > 0 ? (
          <div className="space-y-4">
            {publishedTasks.map((task) => (
              <GlassCard key={task.id} className="p-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">
                        总预算: <span className="gold-text font-semibold">{formatCurrency(task.budget)}</span>
                      </span>
                      <span className="text-slate-500">
                        已接单: <span className="text-[#0F56E8] font-semibold">{task.currentUsers}人</span>
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} />
                    编辑
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 text-red-500 border-red-300"
                  >
                    <Trash2 size={16} />
                    下架
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 opacity-50">
              <Package size={96} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无发布中的悬赏任务</h3>
            <p className="text-slate-500 mb-8">创建您的第一个任务开始赚钱吧</p>
            
            <Button 
              variant="primary" 
              size="xl" 
              isGlow
              onClick={() => navigate('/create-task')}
            >
              <Plus size={24} className="mr-2" />
              创建新悬赏任务
            </Button>
          </div>
        )}

        {/* 创建任务按钮（始终显示） */}
        <div className="mt-8">
          <Button 
            variant="primary" 
            size="xl" 
            isGlow
            className="w-full"
            onClick={() => navigate('/create-task')}
          >
            <Plus size={24} className="mr-2" />
            创建新悬赏任务
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublishManage;
