'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationStats, NotificationFilter } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleStar: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 创建多语言通知数据
const createMockNotifications = (locale: string): Notification[] => {
  const isZh = locale === 'zh-CN';

  return [
    {
      id: '1',
      type: 'system',
      priority: 'high',
      title: isZh ? '系统维护通知' : 'System Maintenance Notice',
      content: isZh
        ? '系统将于今晚23:00-01:00进行维护升级，期间服务可能暂时中断。感谢您的理解与支持。'
        : 'The system will undergo maintenance upgrade tonight from 23:00-01:00. Services may be temporarily interrupted. Thank you for your understanding and support.',
      summary: isZh ? '系统将于今晚23:00-01:00进行维护升级' : 'System maintenance upgrade tonight 23:00-01:00',
      isRead: false,
      isStarred: false,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'announcement',
      priority: 'normal',
      title: isZh ? '新功能发布：AI壁纸增强' : 'New Feature Release: AI Wallpaper Enhancement',
      content: isZh
        ? '我们很高兴地宣布推出全新的AI壁纸增强功能！现在您可以使用更先进的AI模型来生成更高质量的壁纸。'
        : 'We are excited to announce the launch of our new AI Wallpaper Enhancement feature! You can now use more advanced AI models to generate higher quality wallpapers.',
      summary: isZh ? '全新的AI壁纸增强功能已发布' : 'New AI Wallpaper Enhancement feature released',
      actionUrl: '/features/ai-enhance',
      actionText: isZh ? '立即体验' : 'Try Now',
      isRead: true,
      isStarred: true,
      createdAt: '2024-01-14T15:20:00Z',
      updatedAt: '2024-01-14T15:20:00Z',
    },
    {
      id: '3',
      type: 'achievement',
      priority: 'normal',
      title: isZh ? '恭喜获得成就：创作达人' : 'Congratulations! Achievement Unlocked: Creative Master',
      content: isZh
        ? '您已成功生成100张AI壁纸！继续创作，解锁更多精彩成就。'
        : 'You have successfully generated 100 AI wallpapers! Keep creating to unlock more exciting achievements.',
      summary: isZh ? '获得成就：创作达人' : 'Achievement unlocked: Creative Master',
      isRead: false,
      isStarred: false,
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z',
    },
    {
      id: '4',
      type: 'promotion',
      priority: 'low',
      title: isZh ? 'VIP会员限时优惠' : 'VIP Membership Limited Time Offer',
      content: isZh
        ? '升级VIP会员享受无限制AI生成、高清下载等特权。限时8折优惠，仅限本周！'
        : 'Upgrade to VIP membership to enjoy unlimited AI generation, HD downloads and other privileges. Limited time 20% off, this week only!',
      summary: isZh ? 'VIP会员限时8折优惠' : 'VIP membership 20% off limited time',
      actionUrl: '/pricing',
      actionText: isZh ? '立即升级' : 'Upgrade Now',
      isRead: true,
      isStarred: false,
      createdAt: '2024-01-12T14:00:00Z',
      updatedAt: '2024-01-12T14:00:00Z',
    },
    {
      id: '5',
      type: 'message',
      priority: 'normal',
      title: isZh ? '欢迎加入AIICG壁纸平台！' : 'Welcome to AIICG Wallpaper Platform!',
      content: isZh
        ? '感谢您注册AIICG壁纸平台！您现在可以开始创作属于自己的AI壁纸了。如有任何问题，请随时联系我们的客服团队。'
        : 'Thank you for registering with AIICG Wallpaper Platform! You can now start creating your own AI wallpapers. If you have any questions, please feel free to contact our customer service team.',
      summary: isZh ? '欢迎加入AIICG壁纸平台！' : 'Welcome to AIICG Wallpaper Platform!',
      isRead: false,
      isStarred: false,
      createdAt: '2024-01-11T08:00:00Z',
      updatedAt: '2024-01-11T08:00:00Z',
    },
  ];
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { locale } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 计算统计信息
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    starred: notifications.filter(n => n.isStarred).length,
    byType: {
      system: notifications.filter(n => n.type === 'system').length,
      announcement: notifications.filter(n => n.type === 'announcement').length,
      update: notifications.filter(n => n.type === 'update').length,
      achievement: notifications.filter(n => n.type === 'achievement').length,
      message: notifications.filter(n => n.type === 'message').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      promotion: notifications.filter(n => n.type === 'promotion').length,
    },
  };

  // 添加通知
  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // 标记为已读
  const markAsRead = async (id: string) => {
    try {
      const { api } = await import('@/lib/api-client');
      await api.notifications.markAsRead(id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true, updatedAt: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // 可以显示错误提示
    }
  };

  // 全部标记为已读
  const markAllAsRead = async () => {
    try {
      const { api } = await import('@/lib/api-client');
      await api.notifications.markAllAsRead();

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, updatedAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 切换收藏状态
  const toggleStar = async (id: string) => {
    try {
      const { api } = await import('@/lib/api-client');
      await api.notifications.toggleStar(id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred, updatedAt: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to toggle notification star:', error);
    }
  };

  // 删除通知
  const deleteNotification = async (id: string) => {
    try {
      const { api } = await import('@/lib/api-client');
      await api.notifications.delete(id);

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 清空所有通知
  const clearAll = () => {
    setNotifications([]);
  };

  // 获取通知
  const fetchNotifications = async (filter?: NotificationFilter) => {
    setIsLoading(true);
    try {
      const { api } = await import('@/lib/api-client');
      const response = await api.notifications.getList(filter);
      // Go 后端返回格式：直接 data = { items, meta }
      if ((response as any)?.items) {
        setNotifications((response as any).items);
      } else if ((response as any)?.data?.items) {
        // 兼容旧格式
        setNotifications((response as any).data.items);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // 如果API失败，使用模拟数据
      setNotifications(createMockNotifications(locale));
    } finally {
      setIsLoading(false);
    }
  };

  // 只在用户登录时获取通知，语言切换时重新加载
  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        const { api } = await import('@/lib/api-client');
        try {
          await fetchNotifications();
        } catch {}
        // 如果列表为空，尝试初始化用户通知（后端会为现有通知建立用户关联）
        try {
          if (notifications.length === 0) {
            await api.notifications.init();
            await fetchNotifications();
          }
        } catch (e) {
          // 忽略初始化失败
        }
      })();
    } else {
      // 用户未登录时清空通知
      setNotifications([]);
    }
  }, [isLoggedIn, locale]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      stats,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      toggleStar,
      deleteNotification,
      clearAll,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
