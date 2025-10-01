'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart3,
  Activity,
  Clock,
  Download,
  Image,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Star
} from 'lucide-react';

interface OverviewData {
  today: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  thisWeek: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  thisMonth: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  total: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; moneySpent: number; };
  weeklyTrend: number[];
  categoryStats: { landscape: number; portrait: number; abstract: number; anime: number; realistic: number; };
  timeDistribution: { morning: number; afternoon: number; evening: number; night: number; };
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward?: string;
}

export default function OverviewTab() {
  const { t } = useLanguage();
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      
      const mockData: OverviewData = {
        today: { aiGenerated: 8, imagesDownloaded: 15, timeSpent: 45 },
        thisWeek: { aiGenerated: 42, imagesDownloaded: 89, timeSpent: 320 },
        thisMonth: { aiGenerated: 156, imagesDownloaded: 342, timeSpent: 1280 },
        total: { aiGenerated: 1247, imagesDownloaded: 3892, timeSpent: 12450, moneySpent: 89.50 },
        weeklyTrend: [12, 18, 25, 31, 28, 35, 42],
        categoryStats: { landscape: 45, portrait: 30, abstract: 15, anime: 25, realistic: 40 },
        timeDistribution: { morning: 20, afternoon: 35, evening: 30, night: 15 },
        achievements: [
          {
            id: '1',
            title: '创作新手',
            description: '生成第一张AI图片',
            icon: '🎨',
            progress: 1,
            maxProgress: 1,
            unlocked: true,
            reward: '解锁高级滤镜'
          },
          {
            id: '2',
            title: '高产创作者',
            description: '生成100张图片',
            icon: '🏭',
            progress: 67,
            maxProgress: 100,
            unlocked: false,
            reward: '获得VIP特权'
          },
          {
            id: '3',
            title: '收藏达人',
            description: '收藏50张图片',
            icon: '⭐',
            progress: 23,
            maxProgress: 50,
            unlocked: false
          }
        ]
      };

      setOverviewData(mockData);
    } catch (error) {
      console.error('加载概览数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}${t('formatMinutes')}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}${t('formatHours')}${remainingMinutes > 0 ? remainingMinutes + t('formatMinutes') : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">{t('loadOverviewFailed')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('overviewTitle')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('overviewDescription')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            {overviewData.achievements.filter(a => a.unlocked).length} {t('achievementsCount')}
          </span>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Image className="h-8 w-8" />
            <span className="text-blue-100 text-sm">{t('todayGenerated')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{overviewData.today.aiGenerated}</div>
          <div className="text-blue-100 text-sm">{t('aiImages')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Download className="h-8 w-8" />
            <span className="text-green-100 text-sm">{t('todayDownloads')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{overviewData.today.imagesDownloaded}</div>
          <div className="text-green-100 text-sm">{t('imageDownloads')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8" />
            <span className="text-purple-100 text-sm">{t('usageTime')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatTime(overviewData.today.timeSpent)}</div>
          <div className="text-purple-100 text-sm">{t('todayUsage')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8" />
            <span className="text-orange-100 text-sm">{t('totalSpent')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">${overviewData.total.moneySpent}</div>
          <div className="text-orange-100 text-sm">{t('cumulativeSpent')}</div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('weeklyTrend')}</h3>
          <Calendar className="h-5 w-5 text-neutral-400" />
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {overviewData.weeklyTrend.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-primary-100 dark:bg-primary-900/20 rounded-t-lg relative">
                <div
                  className="bg-primary-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(value / Math.max(...overviewData.weeklyTrend)) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                {value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500 mt-4">
          <span>{t('monday')}</span>
          <span>{t('tuesday')}</span>
          <span>{t('wednesday')}</span>
          <span>{t('thursday')}</span>
          <span>{t('friday')}</span>
          <span>{t('saturday')}</span>
          <span>{t('sunday')}</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('categoryPreferences')}</h3>
          <div className="space-y-4">
            {Object.entries(overviewData.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-neutral-700 dark:text-neutral-300 capitalize">
                    {category === 'landscape' && t('landscape')}
                    {category === 'portrait' && t('portrait')}
                    {category === 'abstract' && t('abstract')}
                    {category === 'anime' && t('anime')}
                    {category === 'realistic' && t('realistic')}
                  </span>
                </div>
                <span className="font-medium text-neutral-900 dark:text-white">{count}{t('images')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('timeDistribution')}</h3>
          <div className="space-y-4">
            {Object.entries(overviewData.timeDistribution).map(([time, percentage]) => (
              <div key={time} className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {time === 'morning' && t('morning')}
                  {time === 'afternoon' && t('afternoon')}
                  {time === 'evening' && t('evening')}
                  {time === 'night' && t('night')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white w-8">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('achievementSystem')}</h3>
          <Star className="h-5 w-5 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overviewData.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlocked
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h4 className={`font-medium ${
                    achievement.unlocked
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-neutral-900 dark:text-white'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
              
                              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">{t('progress')}</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      achievement.unlocked
                        ? 'bg-green-500'
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  ></div>
                </div>
                
                                  {achievement.reward && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {t('reward')}: {achievement.reward}
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 