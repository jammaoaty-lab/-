'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, seedDemo } = useNotificationStore();
  const router = useRouter();

  // Auto-seed demo data on first render if empty
  useEffect(() => {
    if (notifications.length === 0) {
      seedDemo();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
    setIsOpen(false);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="通知"
      >
        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-[10px] font-bold bg-danger-red text-white rounded-full flex items-center justify-center"
            style={{ minWidth: '18px', height: '18px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-cosmic-border bg-space-card/95 backdrop-blur-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-display font-semibold text-white">星际通讯</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-ai-blue hover:text-ai-blue/80 transition-colors"
                >
                  全部已读
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-sm">
                  暂无星际信号
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`relative px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      !notification.isRead ? 'bg-white/[0.03]' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: (TYPE_COLORS[notification.type] || '#888') + '20' }}
                      >
                        {TYPE_ICONS[notification.type] || '📌'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white/90 truncate">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-ai-blue shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                        <span className="text-[10px] text-white/30 mt-1 block">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="text-white/20 hover:text-danger-red transition-colors shrink-0 self-start mt-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                查看全部通知
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}