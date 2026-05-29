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
      title: 'APP新用户注册体验',
      category: 'APP注册',
      reward: 5.5,
      totalBudget: 550,
      minUsers: 100,
      currentUsers: 45,
      status: 'active',
      deadline: '2024-12-31',
      publisherId: '2'
    },
    {
      id: '2',
      title: '产品问卷调查',
      category: '问卷调研',
      reward: 3.0,
      totalBudget: 300,
      minUsers: 100,
      currentUsers: 78,
      status: 'active',
      deadline: '2024-12-25',
      publisherId: '3'
    },
    {
      id: '3',
      title: '小游戏试玩3分钟',
      category: '游戏任务',
      reward: 2.5,
      totalBudget: 500,
      minUsers: 200,
      currentUsers: 120,
      status: 'active',
      deadline: '2024-12-28',
      publisherId: '4'
    },
    {
      id: '4',
      title: '电商平台浏览任务',
      category: '简单任务',
      reward: 1.5,
      totalBudget: 150,
      minUsers: 100,
      currentUsers: 95,
      status: 'active',
      deadline: '2024-12-20',
      publisherId: '5'
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
