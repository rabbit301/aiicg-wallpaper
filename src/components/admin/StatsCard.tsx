'use client';

import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-300'
  },
  green: {
    bg: 'from-green-500/20 to-green-600/20',
    border: 'border-green-500/30',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-700 dark:text-green-300'
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-700 dark:text-purple-300'
  },
  orange: {
    bg: 'from-orange-500/20 to-orange-600/20',
    border: 'border-orange-500/30',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-700 dark:text-orange-300'
  },
  red: {
    bg: 'from-red-500/20 to-red-600/20',
    border: 'border-red-500/30',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-700 dark:text-red-300'
  },
  gray: {
    bg: 'from-gray-500/20 to-gray-600/20',
    border: 'border-gray-500/30',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-700 dark:text-gray-300'
  }
};

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  loading = false 
}: StatsCardProps) {
  const { t } = useLanguage();
  const colors = colorClasses[color];

  return (
    <div className={`
      relative overflow-hidden rounded-xl border ${colors.border}
      bg-gradient-to-br ${colors.bg}
      backdrop-blur-md
      p-6 transition-all duration-200
      hover:shadow-lg hover:scale-[1.02]
      group
    `}>
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`w-full h-full ${colors.icon} transform rotate-12 scale-150`}>
          {icon}
        </div>
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {/* 图标和标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 ${colors.icon}`}>
            {icon}
          </div>
          {change && (
            <div className={`
              flex items-center gap-1 text-xs px-2 py-1 rounded-full
              ${change.type === 'increase' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                change.type === 'decrease' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'}
            `}>
              {change.type === 'increase' && '↗'}
              {change.type === 'decrease' && '↘'}
              {change.type === 'neutral' && '→'}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>

        {/* 数值 */}
        <div className="mb-2">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          )}
        </div>

        {/* 标题 */}
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {title}
        </div>

        {/* 变化说明 */}
        {change && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {change.period}
          </div>
        )}
      </div>

      {/* 加载状态覆盖 */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
