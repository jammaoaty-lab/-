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
  // 新增字段
  isPinned?: boolean; // 置顶
  isHot?: boolean; // 热门
  publisherName?: string; // 发布者名称
  publisherAvatar?: string; // 发布者头像
  reviewTime?: string; // 审核时效
  viewCount?: number; // 浏览量
  completionRate?: number; // 完成率
  createTime?: string; // 创建时间
  score?: number; // 推荐算法分数
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
