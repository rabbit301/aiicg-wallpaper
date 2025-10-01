'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Download,
  Image,
  Eye,
  Heart,
  Share2,
  Filter
} from 'lucide-react';

interface StatsData {
  overview: {
    totalGenerated: number;
    totalDownloads: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalTimeSpent: number;
  };
  trends: {
    daily: { date: string; generated: number; downloads: number; views: number }[];
    weekly: { week: string; generated: number; downloads: number; views: number }[];
    monthly: { month: string; generated: number; downloads: number; views: number }[];
  };
  categories: {
    landscape: number;
    portrait: number;
    abstract: number;
    anime: number;
    realistic: number;
    minimalist: number;
  };
  popularPrompts: { prompt: string; count: number; avgRating: number }[];
  timeAnalysis: {
    hourly: number[];
    daily: { day: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
}

export default function StatsTab() {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'generated' | 'downloads' | 'views'>('generated');

  useEffect(() => {
    loadStatsData();
  }, [timeRange]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      
      // 模拟数据加载
      const mockData: StatsData = {
        overview: {
          totalGenerated: 1247,
          totalDownloads: 3892,
          totalViews: 15680,
          totalLikes: 892,
          totalShares: 234,
          totalTimeSpent: 12450
        },
        trends: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            generated: Math.floor(Math.random() * 20) + 5,
            downloads: Math.floor(Math.random() * 50) + 10,
            views: Math.floor(Math.random() * 200) + 50
          })),
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: `第${i + 1}周`,
            generated: Math.floor(Math.random() * 100) + 20,
            downloads: Math.floor(Math.random() * 200) + 50,
            views: Math.floor(Math.random() * 800) + 200
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: `${i + 1}月`,
            generated: Math.floor(Math.random() * 300) + 100,
            downloads: Math.floor(Math.random() * 600) + 200,
            views: Math.floor(Math.random() * 2000) + 800
          }))
        },
        categories: {
          landscape: 45,
          portrait: 30,
          abstract: 15,
          anime: 25,
          realistic: 40,
          minimalist: 20
        },
        popularPrompts: [
          { prompt: '自然风景，山脉，日落', count: 156, avgRating: 4.8 },
          { prompt: '抽象艺术，几何图形', count: 134, avgRating: 4.6 },
          { prompt: '动漫风格，少女，樱花', count: 98, avgRating: 4.7 },
          { prompt: '极简主义，线条，黑白', count: 87, avgRating: 4.5 },
          { prompt: '科幻场景，未来城市', count: 76, avgRating: 4.9 }
        ],
        timeAnalysis: {
          hourly: Array.from({ length: 24 }, () => Math.floor(Math.random() * 20) + 5),
          daily: [
            { day: '周一', count: 45 }, { day: '周二', count: 52 }, { day: '周三', count: 48 },
            { day: '周四', count: 61 }, { day: '周五', count: 58 }, { day: '周六', count: 72 },
            { day: '周日', count: 65 }
          ],
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: `${i + 1}月`,
            count: Math.floor(Math.random() * 200) + 100
          }))
        }
      };

      setStatsData(mockData);
    } catch (error) {
      console.error('Failed to load statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricData = () => {
    if (!statsData) return [];
    
    switch (timeRange) {
      case '7d':
        return statsData.trends.daily.slice(-7);
      case '30d':
        return statsData.trends.daily;
      case '90d':
        return statsData.trends.weekly.slice(-12);
      case '1y':
        return statsData.trends.monthly;
      default:
        return statsData.trends.daily;
    }
  };

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'generated':
        return item.generated;
      case 'downloads':
        return item.downloads;
      case 'views':
        return item.views;
      default:
        return item.generated;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'generated':
        return t('generatedCount');
      case 'downloads':
        return t('downloadsCount');
      case 'views':
        return t('viewsCount');
      default:
        return t('generatedCount');
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'landscape':
        return t('landscape');
      case 'portrait':
        return t('portrait');
      case 'abstract':
        return t('abstract');
      case 'anime':
        return t('anime');
      case 'realistic':
        return t('realistic');
      case 'minimalist':
        return t('minimalist');
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">{t('loadingStats')}</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">{t('noStatsData')}</h3>
        <p className="text-neutral-600 dark:text-neutral-400">{t('noStatsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('statsTitle')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('statsDescription')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-neutral-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">{t('last7Days')}</option>
            <option value="30d">{t('last30Days')}</option>
            <option value="90d">{t('last90Days')}</option>
            <option value="1y">{t('lastYear')}</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {statsData.overview.totalGenerated.toLocaleString()}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalGenerated')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {statsData.overview.totalDownloads.toLocaleString()}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalDownloads')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {statsData.overview.totalViews.toLocaleString()}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalViews')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {statsData.overview.totalLikes.toLocaleString()}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalLikes')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Share2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {statsData.overview.totalShares.toLocaleString()}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalShares')}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {Math.round(statsData.overview.totalTimeSpent / 60)}{t('formatMinutes')}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">{t('totalTime')}</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('trendAnalysis')}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedMetric('generated')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'generated'
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t('generate')}
            </button>
            <button
              onClick={() => setSelectedMetric('downloads')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'downloads'
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t('common.download')}
            </button>
            <button
              onClick={() => setSelectedMetric('views')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'views'
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t('viewsCount')}
            </button>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between space-x-2">
          {getMetricData().map((item, index) => {
            const value = getMetricValue(item);
            const maxValue = Math.max(...getMetricData().map(getMetricValue));
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {value}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                  {timeRange === '7d' || timeRange === '30d' 
                    ? new Date((item as any).date).getDate()
                    : timeRange === '90d'
                    ? (item as any).week
                    : (item as any).month
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('categoryPreferences')}</h3>
          <div className="space-y-4">
            {Object.entries(statsData.categories).map(([category, count]) => {
              const total = Object.values(statsData.categories).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                    {getCategoryName(category)}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('popularPrompts')}</h3>
          <div className="space-y-4">
            {statsData.popularPrompts.map((prompt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">
                    {prompt.prompt}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {prompt.count} {t('stats.uses')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-yellow-500">★</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {prompt.avgRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('usagePattern')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">{t('dailyUsage')}</h4>
            <div className="flex items-end justify-between space-x-2 h-32">
              {statsData.timeAnalysis.daily.map((day, index) => {
                const maxCount = Math.max(...statsData.timeAnalysis.daily.map(d => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                      {day.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">{t('hourlyUsage')}</h4>
            <div className="flex items-end justify-between space-x-1 h-32">
              {statsData.timeAnalysis.hourly.map((count, index) => {
                const maxCount = Math.max(...statsData.timeAnalysis.hourly);
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                      {index}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 