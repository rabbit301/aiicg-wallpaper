export type NotificationType = 
  | 'system'      // 系统通知
  | 'announcement' // 公告
  | 'update'      // 更新通知
  | 'achievement' // 成就通知
  | 'message'     // 消息
  | 'warning'     // 警告
  | 'promotion';  // 推广

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  summary?: string; // 简短摘要，用于列表显示
  icon?: string;
  image?: string; // 可选的图片
  actionUrl?: string; // 点击后跳转的URL
  actionText?: string; // 操作按钮文字
  isRead: boolean;
  isStarred: boolean; // 是否收藏
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // 过期时间
  metadata?: {
    [key: string]: any; // 额外的元数据
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  starred: number;
  byType: {
    [key in NotificationType]: number;
  };
}

export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  isStarred?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
    };
  };
}
