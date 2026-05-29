import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TaskSquare from "@/pages/TaskSquare";
import Invite from "@/pages/Invite";
import PublishManage from "@/pages/PublishManage";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import CreateTask from "@/pages/CreateTask";
import MyTasks from "@/pages/MyTasks";
import Announcement from "@/pages/Announcement";
import BottomNav from "@/components/BottomNav";

// 充值页面
const RechargePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-8">
      <div className="px-5 pt-12 pb-5 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border mr-4"
        >
          <span className="text-slate-600">←</span>
        </button>
        <h1 className="text-xl font-bold text-slate-800">账户充值</h1>
      </div>
      <div className="px-5">
        <div className="glass-effect p-6 rounded-2xl neon-border text-center mb-6">
          <p className="text-slate-500 text-sm mb-2">充值金额</p>
          <p className="text-4xl font-bold gold-text">¥0.00</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[50, 100, 200, 500, 1000, 2000].map(amount => (
            <button key={amount} className="p-4 glass-effect rounded-xl neon-border hover:ring-2 hover:ring-[#36B0FF]/50">
              <p className="text-lg font-bold text-slate-800">¥{amount}</p>
            </button>
          ))}
        </div>
        <div className="glass-effect p-4 rounded-2xl neon-border mb-6">
          <p className="text-slate-600 font-medium">支付方式</p>
          <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">微</div>
            <span className="flex-1 text-slate-700">微信支付</span>
            <div className="w-5 h-5 rounded-full border-2 border-[#36B0FF] bg-[#36B0FF] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <button className="w-full primary-gradient text-white py-4 rounded-xl font-semibold glow-effect">
          确认充值
        </button>
      </div>
    </div>
  );
};

// 提现页面
const WithdrawPage = () => {
  return (
    <div className="min-h-screen bg-[#F2F7FF] pb-8">
      <div className="px-5 pt-12 pb-5 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center neon-border mr-4"
        >
          <span className="text-slate-600">←</span>
        </button>
        <h1 className="text-xl font-bold text-slate-800">余额提现</h1>
      </div>
      <div className="px-5">
        <div className="glass-effect p-6 rounded-2xl neon-border text-center mb-6">
          <p className="text-slate-500 text-sm mb-2">可提现余额</p>
          <p className="text-4xl font-bold gold-text">¥2,266.50</p>
        </div>
        <div className="glass-effect p-4 rounded-2xl neon-border mb-4">
          <label className="block text-sm text-slate-600 mb-2">提现金额</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#FFD266] font-bold">¥</span>
            <input
              type="number"
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-transparent border-b border-slate-200 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {[100, 500, 1000, '全部'].map(amount => (
              <button key={amount} className="px-4 py-2 glass-effect rounded-lg text-sm text-slate-600">
                {typeof amount === 'number' ? `¥${amount}` : amount}
              </button>
            ))}
          </div>
        </div>
        <div className="glass-effect p-4 rounded-2xl neon-border mb-6">
          <p className="text-slate-600 font-medium">到账方式</p>
          <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">微</div>
            <span className="flex-1 text-slate-700">微信零钱</span>
            <div className="w-5 h-5 rounded-full border-2 border-[#36B0FF] bg-[#36B0FF] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <button className="w-full primary-gradient text-white py-4 rounded-xl font-semibold glow-effect">
          确认提现
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">
          提现规则：最低提现10元，预计1-3个工作日到账
        </p>
      </div>
    </div>
  );
};

// 主应用布局组件
const AppLayout = () => {
  const location = useLocation();
  
  // 判断是否显示底部导航栏的页面
  const showBottomNav = ['/', '/invite', '/publish', '/wallet', '/profile'].includes(location.pathname);

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<TaskSquare />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/publish" element={<PublishManage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/announcement" element={<Announcement />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
