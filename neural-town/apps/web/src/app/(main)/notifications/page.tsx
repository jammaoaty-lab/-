'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useNotificationStore, type Notification } from '@/stores/notification-store';
import { useRouter } from 'next/navigation';

const TYPE_ICONS: Record<Notification['type'], string> = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
  mention: '@',
  challenge: '🏆',
  system: '📢',
  certification: '✅',
};

const TYPE_COLORS: Record<Notification['type'], string> = {
  like: '#FF6B6B',
  comment: '#6C5CE7',
  follow: '#00E5FF',
  mention: '#FFD166',
  challenge: '#FF9100',
  system: '#00F2A9',
  certification: '#E040FB',
};

type TabFilter = 'all' | 'unread' | 'mention' | 'system';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'mention', label: '@提及' },
  { key: 'system', label: '系统' },
];

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, seedDemo } =
    useNotificationStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Seed demo data if store is empty on mount
  useEffect(() => {
    if (notifications.length === 0) {
      seedDemo();
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'mention':
        return notifications.filter((n) => n.type === 'mention');
      case 'system':
        return notifications.filter((n) => n.type === 'system');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gradient flex items-center gap-2">
          <span>📬</span>
          <span>星际通讯中心</span>
        </h1>
        {unreadCount > 0 && (
          <CosmicButton
            variant="secondary"
            size="sm"
            onClick={markAllAsRead}
          >
            全部已读
          </CosmicButton>
        )}
      </div>

      {/* Tab Filters */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-space-card/50 border border-cosmic-border">
        {TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? notifications.length
              : tab.key === 'unread'
                ? unreadCount
                : tab.key === 'mention'
                  ? notifications.filter((n) => n.type === 'mention').length
                  : notifications.filter((n) => n.type === 'system').length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-nebulae-purple/20 text-nebulae-purple shadow-[0_0_12px_rgba(108,92,231,0.15)]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && count > 0 && (
                <span className="ml-1.5 text-xs text-white/40">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4 opacity-30">
            {activeTab === 'unread' ? '✨' : '📭'}
          </div>
          <p className="text-white/40 text-lg">
            {activeTab === 'unread'
              ? '所有星际信号已读取完毕'
              : activeTab === 'mention'
                ? '暂无 @提及'
                : activeTab === 'system'
                  ? '暂无系统通知'
                  : '暂未收到任何星际信号'}
          </p>
          <p className="text-white/20 text-sm mt-2">通讯频道静默中，去探索星域吧</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <CosmicCard
                  padding="md"
                  hoverable
                  className={`cursor-pointer ${
                    !notification.isRead
                      ? 'border-l-2 border-l-ai-blue bg-ai-blue/[0.02]'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {/* Type Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5"
                      style={{
                        backgroundColor: (TYPE_COLORS[notification.type] || '#888') + '20',
                      }}
                    >
                      {TYPE_ICONS[notification.type] || '📌'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.fromUser && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center text-[10px] font-medium">
                              {notification.fromUser.displayName[0]}
                            </div>
                            <span className="text-xs font-medium text-white/70">
                              {notification.fromUser.displayName}
                            </span>
                            <span className="text-white/20">·</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-white/90 truncate">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-ai-blue shrink-0 animate-pulse" />
                        )}
                      </div>

                      <p className="text-sm text-white/60 leading-relaxed">
                        {notification.body}
                      </p>

                      <span className="text-xs text-white/30 mt-2 block">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-white/20 hover:text-danger-red transition-colors shrink-0 self-start mt-1 p-1"
                      aria-label="删除通知"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </CosmicCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}