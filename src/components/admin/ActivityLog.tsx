'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActivityItem {
  id: string;
  type: 'user' | 'system' | 'error' | 'warning';
  action: string;
  description: string;
  user?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const activityIcons = {
  user: '👤',
  system: '⚙️',
  error: '❌',
  warning: '⚠️'
};

const activityColors = {
  user: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  system: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  warning: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
};

export default function ActivityLog() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'user' | 'system' | 'error'>('all');

  // 模拟活动数据
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'user',
      action: '用户登录',
      description: '管理员 admin 登录系统',
      user: 'admin',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'user',
      action: '生成壁纸',
      description: '用户 john_doe 生成了新壁纸',
      user: 'john_doe',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metadata: { wallpaperId: 'wp_123', prompt: '夕阳下的山脉' }
    },
    {
      id: '3',
      type: 'system',
      action: '数据备份',
      description: '系统自动备份完成',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'user',
      action: '删除壁纸',
      description: '管理员删除了违规壁纸',
      user: 'admin',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      metadata: { wallpaperId: 'wp_456', reason: '违规内容' }
    },
    {
      id: '5',
      type: 'warning',
      action: '存储空间警告',
      description: '存储空间使用率超过80%',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      type: 'user',
      action: '用户注册',
      description: '新用户 alice_smith 注册账户',
      user: 'alice_smith',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      type: 'error',
      action: 'API错误',
      description: '图像生成API调用失败',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      metadata: { error: 'Rate limit exceeded', endpoint: '/api/generate' }
    },
    {
      id: '8',
      type: 'system',
      action: '缓存清理',
      description: '系统缓存清理完成',
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // 模拟加载数据
    const loadActivities = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
      setLoading(false);
    };

    loadActivities();
  }, []);

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            最近活动
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            系统和用户操作记录
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
          >
            <option value="all">全部</option>
            <option value="user">用户操作</option>
            <option value="system">系统事件</option>
            <option value="error">错误日志</option>
          </select>
          
          <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-sm">🔄</span>
          </button>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          // 加载状态
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无活动记录
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              {/* 图标 */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${activityColors[activity.type]}
              `}>
                {activityIcons[activity.type]}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.action}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>

                {/* 元数据 */}
                {activity.metadata && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="text-xs">📋</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            显示最近 {filteredActivities.length} 条记录
          </span>
          
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            查看全部日志 →
          </button>
        </div>
      </div>
    </div>
  );
}
