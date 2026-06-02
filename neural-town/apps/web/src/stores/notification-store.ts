import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'challenge' | 'system' | 'certification';
  title: string;
  body: string;
  fromUser?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  // Seed with some demo notifications
  seedDemo: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (data) => {
    const notification: Notification = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  
  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  
  removeNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },
  
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },
  
  seedDemo: () => {
    const now = Date.now();
    const demos: Omit<Notification, 'id' | 'isRead' | 'createdAt'>[] = [
      { type: 'like', title: '新的点赞', body: '星际探索者 赞了你的作品 "赛博朋克城市夜景"', fromUser: { id: '1', displayName: '星际探索者' }, targetUrl: '/community' },
      { type: 'comment', title: '新的评论', body: '星云设计师 评论了你的帖子: "这个配色太棒了！可以分享一下Prompt吗？"', fromUser: { id: '2', displayName: '星云设计师' }, targetUrl: '/community' },
      { type: 'follow', title: '新的关注', body: '前端宇航员 关注了你', fromUser: { id: '3', displayName: '前端宇航员' }, targetUrl: '/profile' },
      { type: 'challenge', title: '挑战赛提醒', body: '本周情感挑战赛 "未来城市" 还有3天截止，快来参加吧！', targetUrl: '/playground' },
      { type: 'system', title: '系统通知', body: '恭喜！你已连续登录7天，获得 "恒星级活跃" 勋章', targetUrl: '/profile' },
      { type: 'mention', title: '@提及', body: 'AI导演 在帖子中 @了你: "来看看这个分镜设计"', fromUser: { id: '4', displayName: 'AI导演' }, targetUrl: '/community' },
      { type: 'certification', title: '认证通过', body: '恭喜！你的 "前端工程师" 认证已通过审核', targetUrl: '/profile' },
    ];
    
    const notifications: Notification[] = demos.map((d, i) => ({
      ...d,
      id: `demo-${i}`,
      isRead: i >= 3, // first 3 are unread
      createdAt: new Date(now - i * 3600000).toISOString(),
    }));
    
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },
}));