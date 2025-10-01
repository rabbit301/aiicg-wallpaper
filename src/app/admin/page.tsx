'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api-client';
import StatsCard from '@/components/admin/StatsCard';
import ChartCard from '@/components/admin/ChartCard';
import QuickActions from '@/components/admin/QuickActions';
import ActivityLog from '@/components/admin/ActivityLog';

interface DashboardStats {
  totalUsers: number;
  totalWallpapers: number;
  todayGenerations: number;
  storageUsed: number;
  onlineUsers: number;
  apiCalls: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}

export default function AdminPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟统计数据
  const mockStats: DashboardStats = {
    totalUsers: 1247,
    totalWallpapers: 8934,
    todayGenerations: 156,
    storageUsed: 75.6,
    onlineUsers: 23,
    apiCalls: 2847,
    systemStatus: 'healthy'
  };

  // 模拟图表数据
  const generationTrendData = {
    labels: [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')],
    datasets: [{
      label: t('pages.admin.dashboard.charts.generationTrend'),
      data: [45, 67, 89, 123, 156, 134, 98],
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F6'
    }]
  };

  const categoryData = {
    labels: [t('landscape'), t('abstract'), t('anime'), t('pages.admin.dashboard.categories.technology'), t('pages.admin.dashboard.categories.others')],
    datasets: [{
      label: t('pages.admin.dashboard.charts.categoryDistribution'),
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    }]
  };

  // 加载仪表板数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 调用真实的API获取仪表板数据
      const res: any = await api.admin.getDashboard();
      const data = res?.data || res;
      setStats(data);
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
      // 如果API调用失败，使用模拟数据作为fallback
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 检查用户权限
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('pages.admin.dashboard.access.restrictedTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('pages.admin.dashboard.access.restrictedMessage')}
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('pages.admin.dashboard.access.backToHome')}
          </a>
        </div>
      </div>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>

        {/* 其他内容骨架 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('pages.admin.dashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pages.admin.dashboard.welcome')}，{user?.username} | {t('pages.admin.dashboard.systemStatus')}：
          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
            stats?.systemStatus === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            stats?.systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {stats?.systemStatus === 'healthy' ? t('pages.admin.dashboard.statusHealthy') :
             stats?.systemStatus === 'warning' ? t('pages.admin.dashboard.statusWarning') :
             t('pages.admin.dashboard.statusError')}
          </span>
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('pages.admin.dashboard.stats.totalUsers')}
          value={stats?.totalUsers || 0}
          change={{ value: 12, type: 'increase', period: t('pages.admin.dashboard.stats.previousMonth') }}
          icon={<span className="text-xl">👥</span>}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title={t('pages.admin.dashboard.stats.totalWallpapers')}
          value={stats?.totalWallpapers || 0}
          change={{ value: 8, type: 'increase', period: t('pages.admin.dashboard.stats.previousWeek') }}
          icon={<span className="text-xl">🖼️</span>}
          color="green"
          loading={loading}
        />
        <StatsCard
          title={t('pages.admin.dashboard.stats.todayGenerations')}
          value={stats?.todayGenerations || 0}
          change={{ value: 5, type: 'decrease', period: t('pages.admin.dashboard.stats.previousDay') }}
          icon={<span className="text-xl">✨</span>}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title={t('pages.admin.dashboard.stats.storageUsed')}
          value={`${stats?.storageUsed || 0}%`}
          change={{ value: 3, type: 'increase', period: t('pages.admin.dashboard.stats.previousWeek') }}
          icon={<span className="text-xl">💾</span>}
          color="orange"
          loading={loading}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('pages.admin.dashboard.charts.generationTrend')}
          subtitle={t('pages.admin.dashboard.charts.generationTrendSubtitle')}
          data={generationTrendData}
          type="line"
          height={250}
          loading={loading}
          actions={
            <select className="px-2 py-1 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <option>{t('pages.admin.dashboard.charts.days7')}</option>
              <option>{t('pages.admin.dashboard.charts.days30')}</option>
              <option>{t('pages.admin.dashboard.charts.days90')}</option>
            </select>
          }
        />

        <ChartCard
          title={t('pages.admin.dashboard.charts.categoryDistribution')}
          subtitle={t('pages.admin.dashboard.charts.categoryDistributionSubtitle')}
          data={categoryData}
          type="doughnut"
          height={250}
          loading={loading}
        />
      </div>

      {/* 快速操作和活动日志 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <QuickActions />
        </div>
        <div>
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
