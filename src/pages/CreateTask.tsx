import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const CreateTask = () => {
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    title: '',
    category: '',
    totalBudget: '',
    rewardPerPerson: '',
    minUsers: '',
    duration: '',
    reviewTime: '',
    requirements: [''],
    steps: [''],
  });

  const categories = ['全部悬赏', '简单任务', 'APP注册', '问卷调研', '游戏任务', '高额赏金'];

  const handleAddStep = () => {
    setTaskData(prev => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const handleRemoveStep = (index: number) => {
    if (taskData.steps.length > 1) {
      setTaskData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index),
      }));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    setTaskData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step),
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setTaskData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req),
    }));
  };

  const handleAddRequirement = () => {
    setTaskData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-32">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-12 pb-5 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border mr-4"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">发布新悬赏任务</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* 任务基础信息 */}
        <GlassCard className="p-5" hasNeonBorder>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">任务基础信息</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">任务标题</label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50"
                placeholder="请输入任务标题"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 mb-2">任务分类</label>
              <select
                value={taskData.category}
                onChange={(e) => setTaskData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50 bg-transparent"
              >
                <option value="">请选择任务分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 mb-2">任务总预算（元）</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#FFD266] font-bold">¥</span>
                <input
                  type="number"
                  value={taskData.totalBudget}
                  onChange={(e) => setTaskData(prev => ({ ...prev, totalBudget: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 赏金规则设置 */}
        <GlassCard className="p-5" hasNeonBorder>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">赏金规则设置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">单人完成赏金（元）</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#FFD266] font-bold">¥</span>
                <input
                  type="number"
                  value={taskData.rewardPerPerson}
                  onChange={(e) => setTaskData(prev => ({ ...prev, rewardPerPerson: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 mb-2">最低接单人数</label>
              <input
                type="number"
                value={taskData.minUsers}
                onChange={(e) => setTaskData(prev => ({ ...prev, minUsers: e.target.value }))}
                className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50"
                placeholder="请输入最低接单人数"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 mb-2">任务有效时长</label>
              <select
                value={taskData.duration}
                onChange={(e) => setTaskData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50 bg-transparent"
              >
                <option value="">请选择任务时长</option>
                <option value="1">1天</option>
                <option value="3">3天</option>
                <option value="7">7天</option>
                <option value="15">15天</option>
                <option value="30">30天</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* 任务审核规则 */}
        <GlassCard className="p-5" hasNeonBorder>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">任务审核规则</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">审核时效</label>
              <select
                value={taskData.reviewTime}
                onChange={(e) => setTaskData(prev => ({ ...prev, reviewTime: e.target.value }))}
                className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50 bg-transparent"
              >
                <option value="">请选择审核时效</option>
                <option value="1">1小时</option>
                <option value="6">6小时</option>
                <option value="12">12小时</option>
                <option value="24">24小时</option>
                <option value="48">48小时</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 mb-2">提交材料要求</label>
              {taskData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50"
                    placeholder="请输入材料要求"
                  />
                  {taskData.requirements.length > 1 && (
                    <button
                      onClick={() => {
                        setTaskData(prev => ({
                          ...prev,
                          requirements: prev.requirements.filter((_, i) => i !== index),
                        }));
                      }}
                      className="w-12 h-12 glass-effect rounded-xl flex items-center justify-center text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddRequirement}
                className="w-full py-3 border-2 border-dashed border-[#36B0FF]/30 rounded-xl text-[#36B0FF] hover:bg-[#36B0FF]/5 transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                添加材料要求
              </button>
            </div>
          </div>
        </GlassCard>

        {/* 任务步骤详情 */}
        <GlassCard className="p-5" hasNeonBorder>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">任务步骤详情</h3>
          
          <div className="space-y-4">
            {taskData.steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 primary-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">步骤 {index + 1}</span>
                  {taskData.steps.length > 1 && (
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="ml-auto text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <textarea
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl neon-border focus:outline-none focus:ring-2 focus:ring-[#36B0FF]/50 resize-none"
                  rows={3}
                  placeholder="请详细描述这一步需要做什么..."
                />
              </div>
            ))}
            
            <button
              onClick={handleAddStep}
              className="w-full py-3 border-2 border-dashed border-[#36B0FF]/30 rounded-xl text-[#36B0FF] hover:bg-[#36B0FF]/5 transition-colors"
            >
              <Plus size={18} className="inline mr-2" />
              添加步骤
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 glass-effect border-t border-[#36B0FF]/20">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1"
          >
            预览任务
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            isGlow
            className="flex-1"
            onClick={() => navigate('/publish')}
          >
            提交发布
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
