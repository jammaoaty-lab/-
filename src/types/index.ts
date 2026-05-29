export interface User {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  frozenBalance: number;
  inviteCode: string;
  joinDate: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  reward: number;
  totalBudget: number;
  minUsers: number;
  currentUsers: number;
  status: 'active' | 'pending' | 'paused' | 'ended' | 'removed';
  deadline: string;
  publisherId: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  inviterId: string;
  inviteeId: string;
  reward: number;
  createdAt: string;
}
