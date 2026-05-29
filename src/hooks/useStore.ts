import { create } from 'zustand';
import { User, Task, Transaction } from '../types';

interface AppState {
  currentTab: number;
  user: User | null;
  tasks: Task[];
  transactions: Transaction[];
  setCurrentTab: (tab: number) => void;
  setUser: (user: User) => void;
  addTask: (task: Task) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const useStore = create<AppState>((set) => ({
  currentTab: 0,
  user: {
    id: '1',
    name: '科技达人',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    balance: 2586.50,
    frozenBalance: 320.00,
    inviteCode: 'TECH2024',
    joinDate: '2024-01-15'
  },
  tasks: [
    {
      id: '1',
      title: '【新用户专享】电商平台注册认证',
      category: 'APP注册',
      reward: 8.8,
      totalBudget: 880,
      minUsers: 100,
      currentUsers: 32,
      status: 'active',
      deadline: '2024-12-31',
      publisherId: '2',
      isPinned: true,
      isHot: true,
      publisherName: '云科技官方',
      publisherAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
      reviewTime: '2小时审核',
      viewCount: 1580,
      completionRate: 95,
      createTime: '2024-12-15 09:30',
      score: 98
    },
    {
      id: '2',
      title: '热门手游试玩体验3分钟',
      category: '游戏任务',
      reward: 5.0,
      totalBudget: 500,
      minUsers: 100,
      currentUsers: 75,
      status: 'active',
      deadline: '2024-12-28',
      publisherId: '3',
      isPinned: false,
      isHot: true,
      publisherName: '游戏发行商',
      publisherAvatar: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop',
      reviewTime: '1小时审核',
      viewCount: 1200,
      completionRate: 92,
      createTime: '2024-12-15 11:20',
      score: 88
    },
    {
      id: '3',
      title: '产品用户体验问卷调查',
      category: '问卷调研',
      reward: 3.5,
      totalBudget: 350,
      minUsers: 100,
      currentUsers: 45,
      status: 'active',
      deadline: '2024-12-25',
      publisherId: '4',
      isPinned: false,
      isHot: true,
      publisherName: '调研公司',
      publisherAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      reviewTime: '6小时审核',
      viewCount: 980,
      completionRate: 88,
      createTime: '2024-12-14 14:30',
      score: 78
    },
    {
      id: '4',
      title: '简单浏览网页30秒',
      category: '简单任务',
      reward: 1.2,
      totalBudget: 120,
      minUsers: 100,
      currentUsers: 90,
      status: 'active',
      deadline: '2024-12-20',
      publisherId: '5',
      isPinned: false,
      isHot: false,
      publisherName: '网络服务商',
      publisherAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
      reviewTime: '24小时审核',
      viewCount: 450,
      completionRate: 85,
      createTime: '2024-12-13 08:15',
      score: 55
    },
    {
      id: '5',
      title: '高额赏金！APP深度测试',
      category: '高额赏金',
      reward: 15.0,
      totalBudget: 1500,
      minUsers: 100,
      currentUsers: 18,
      status: 'active',
      deadline: '2024-12-30',
      publisherId: '6',
      isPinned: false,
      isHot: true,
      publisherName: '科技公司',
      publisherAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
      reviewTime: '3小时审核',
      viewCount: 1350,
      completionRate: 80,
      createTime: '2024-12-15 07:45',
      score: 90
    },
    {
      id: '6',
      title: '社交平台分享任务',
      category: '简单任务',
      reward: 2.0,
      totalBudget: 400,
      minUsers: 200,
      currentUsers: 150,
      status: 'active',
      deadline: '2024-12-22',
      publisherId: '7',
      isPinned: false,
      isHot: false,
      publisherName: '营销推广',
      publisherAvatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&h=100&fit=crop',
      reviewTime: '12小时审核',
      viewCount: 320,
      completionRate: 75,
      createTime: '2024-12-12 16:30',
      score: 40
    }
  ],
  transactions: [
    { id: '1', type: 'income', amount: 5.5, description: 'APP注册任务奖励', createdAt: '2024-12-15 10:30' },
    { id: '2', type: 'income', amount: 3.0, description: '问卷调查奖励', createdAt: '2024-12-14 15:20' },
    { id: '3', type: 'expense', amount: 100.0, description: '提现到微信', createdAt: '2024-12-13 09:15' },
    { id: '4', type: 'income', amount: 3.0, description: '邀请好友奖励', createdAt: '2024-12-12 18:45' }
  ],
  setCurrentTab: (tab: number) => set({ currentTab: tab }),
  setUser: (user: User) => set({ user }),
  addTask: (task: Task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addTransaction: (transaction: Transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  }))
}));
