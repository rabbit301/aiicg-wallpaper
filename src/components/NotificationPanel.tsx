'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Bell,
  X,
  Star,
  StarOff,
  Check,
  CheckCheck,
  Filter,
  Search,
  Trash2,
  ExternalLink,
  AlertCircle,
  Info,
  Gift,
  Zap,
  MessageSquare,
  Megaphone,
  Shield
} from 'lucide-react';
import { Notification, NotificationType, NotificationPriority } from '@/types/notification';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}


// 通知类型图标映射
const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    system: AlertCircle,
    announcement: Megaphone,
    update: Info,
    achievement: Gift,
    message: MessageSquare,
    warning: Shield,
    promotion: Zap,
  };
  return iconMap[type] || Bell;
};

// 优先级颜色映射
const getPriorityColor = (priority: NotificationPriority) => {
  const colorMap = {
    low: 'text-neutral-500 dark:text-neutral-400',
    normal: 'text-blue-500 dark:text-blue-400',
    high: 'text-orange-500 dark:text-orange-400',
    urgent: 'text-red-500 dark:text-red-400',
  };
  return colorMap[priority];
};

// 格式化时间（国际化）
const formatTime = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const isZh = locale === 'zh-CN';

  if (minutes < 1) return isZh ? '刚刚' : 'Just now';
  if (minutes < 60) return isZh ? `${minutes}分钟前` : `${minutes} minutes ago`;
  if (hours < 24) return isZh ? `${hours}小时前` : `${hours} hours ago`;
  if (days < 7) return isZh ? `${days}天前` : `${days} days ago`;
  return date.toLocaleDateString(locale);
};

export default function NotificationPanel({ isOpen, onClose, anchorRef }: NotificationPanelProps) {
  const { t, locale } = useLanguage();
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    toggleStar,
    deleteNotification
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 检查点击是否在面板内部
      if (panelRef.current && panelRef.current.contains(target)) {
        return; // 点击在面板内部，不关闭
      }

      // 检查点击是否在触发按钮上
      if (anchorRef.current && anchorRef.current.contains(target)) {
        return; // 点击在触发按钮上，不关闭（由按钮自己处理）
      }

      // 点击在外部，关闭面板
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'starred' && !notification.isStarred) return false;
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = stats.unread;

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed left-16 top-0 bottom-0 w-[400px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl shadow-2xl border-r border-neutral-200/50 dark:border-neutral-700/50 z-50 transition-all duration-300 ease-out ${
        isOpen
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-full pointer-events-none'
      }`}
      onClick={(e) => {
        // 阻止面板内部的所有点击事件冒泡到document
        e.stopPropagation();
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">
              {t('notificationPanel.title')}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {stats.total} {t('notificationPanel.totalCount')}
              {unreadCount > 0 && `, ${unreadCount} ${t('notificationPanel.unreadCount')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {t('notificationPanel.markAllRead')}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* 过滤标签 */}
      <div className="px-6 py-4 border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: t('notificationPanel.filters.all'), count: stats.total },
            { key: 'unread', label: t('notificationPanel.filters.unread'), count: stats.unread },
            { key: 'starred', label: t('notificationPanel.filters.starred'), count: stats.starred },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === key
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === key
                    ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 通知列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Bell className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              {searchQuery ? t('notificationPanel.empty.noSearchResults') : t('notificationPanel.empty.noNotifications')}
            </h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {searchQuery ? t('notificationPanel.empty.noSearchResultsDesc') : t('notificationPanel.empty.noNotificationsDesc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/50 dark:divide-neutral-700/50">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const priorityColor = getPriorityColor(notification.priority);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                    !notification.isRead ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* 图标 */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${priorityColor} bg-current/10`}>
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium leading-tight ${
                            !notification.isRead
                              ? 'text-neutral-900 dark:text-white'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {notification.summary || notification.content}
                          </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                              title={t('notificationPanel.actions.markRead')}
                            >
                              <Check className="h-3 w-3 text-neutral-500" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(notification.id);
                            }}
                            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            title={notification.isStarred ? t('notificationPanel.actions.unstar') : t('notificationPanel.actions.star')}
                          >
                            {notification.isStarred ? (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-3 w-3 text-neutral-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            title={t('notificationPanel.actions.delete')}
                          >
                            <Trash2 className="h-3 w-3 text-neutral-500" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatTime(notification.createdAt, locale)}
                          </span>
                          {notification.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-full">
                              {t('notificationPanel.priority.high')}
                            </span>
                          )}
                          {notification.priority === 'urgent' && (
                            <span className="px-2 py-0.5 bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-full">
                              {t('notificationPanel.priority.urgent')}
                            </span>
                          )}
                        </div>

                        {notification.actionUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notification.actionUrl, '_blank');
                            }}
                            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center space-x-1"
                          >
                            <span>{notification.actionText || t('notificationPanel.actions.viewDetails')}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}
