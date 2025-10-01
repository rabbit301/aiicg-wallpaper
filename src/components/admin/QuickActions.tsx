'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
};

export default function QuickActions() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSystemMaintenance = async () => {
    setLoading('maintenance');
    // 模拟系统维护操作
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('系统维护完成');
    setLoading(null);
  };

  const handleClearCache = async () => {
    setLoading('cache');
    // 模拟清理缓存操作
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('缓存清理完成');
    setLoading(null);
  };

  const handleBackupData = async () => {
    setLoading('backup');
    // 模拟数据备份操作
    await new Promise(resolve => setTimeout(resolve, 3000));
    alert('数据备份完成');
    setLoading(null);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'users',
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: '👥',
      color: 'blue',
      href: '/admin/users'
    },
    {
      id: 'wallpapers',
      title: '壁纸管理',
      description: '管理壁纸库和分类',
      icon: '🖼️',
      color: 'green',
      href: '/admin/wallpapers'
    },
    {
      id: 'notifications',
      title: '通知管理',
      description: '发送系统通知',
      icon: '📢',
      color: 'purple',
      href: '/admin/notifications',
      badge: 3
    },
    {
      id: 'settings',
      title: '系统设置',
      description: '配置系统参数',
      icon: '⚙️',
      color: 'gray',
      href: '/admin/settings'
    },
    {
      id: 'audit',
      title: '审计日志',
      description: '查看操作记录',
      icon: '📋',
      color: 'orange',
      href: '/admin/audit'
    },
    {
      id: 'maintenance',
      title: '系统维护',
      description: '执行系统维护任务',
      icon: '🔧',
      color: 'red',
      onClick: handleSystemMaintenance
    },
    {
      id: 'cache',
      title: '清理缓存',
      description: '清理系统缓存',
      icon: '🗑️',
      color: 'gray',
      onClick: handleClearCache
    },
    {
      id: 'backup',
      title: '数据备份',
      description: '备份重要数据',
      icon: '💾',
      color: 'blue',
      onClick: handleBackupData
    }
  ];

  const renderAction = (action: QuickAction) => {
    const isLoading = loading === action.id;
    const colorClass = colorClasses[action.color];

    const content = (
      <div className={`
        relative group p-4 rounded-xl border border-white/20
        bg-gradient-to-br ${colorClass}
        text-white transition-all duration-200
        hover:shadow-lg hover:scale-[1.02]
        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'animate-pulse' : ''}
      `}>
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-20 overflow-hidden">
          <div className="text-4xl transform rotate-12 translate-x-2 -translate-y-2">
            {action.icon}
          </div>
        </div>

        {/* 徽章 */}
        {action.badge && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {action.badge}
          </div>
        )}

        {/* 内容 */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{action.icon}</span>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-1">
            {action.title}
          </h3>
          
          <p className="text-sm opacity-90">
            {action.description}
          </p>
        </div>

        {/* 悬停效果 */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
      </div>
    );

    if (action.href) {
      return (
        <Link key={action.id} href={action.href}>
          {content}
        </Link>
      );
    }

    return (
      <button
        key={action.id}
        onClick={action.onClick}
        disabled={action.disabled || isLoading}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            快速操作
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            常用管理功能快速访问
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-sm">⚡</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(renderAction)}
      </div>
    </div>
  );
}
