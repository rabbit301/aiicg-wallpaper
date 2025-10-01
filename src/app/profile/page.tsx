'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  User,
  Settings,
  Loader2,
  BarChart3,
  Activity,
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  PieChart,
  BarChart,
  LineChart,
  Clock,
  Gift,
  Check,
  Copy,
  Share2,
  QrCode
} from 'lucide-react';

import InviteTab from '@/components/profile/InviteTab';
import OverviewTab from '@/components/profile/OverviewTab';
import SettingsTab from '@/components/profile/SettingsTab';
import StatsTab from '@/components/profile/StatsTab';
import AchievementsTab from '@/components/profile/AchievementsTab';
import BillingTab from '@/components/profile/BillingTab';

interface UsageStats {
  today: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  thisWeek: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  thisMonth: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; };
  total: { aiGenerated: number; imagesDownloaded: number; timeSpent: number; moneySpent: number; };
  weeklyTrend: number[];
  categoryStats: { landscape: number; portrait: number; abstract: number; anime: number; realistic: number; };
  timeDistribution: { morning: number; afternoon: number; evening: number; night: number; };
}

type TabType = 'overview' | 'stats' | 'invite' | 'achievements' | 'settings' | 'billing';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user: currentUser, isLoggedIn, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 等待认证状态完全加载
    if (authLoading) return;

    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    loadUserData();
  }, [isLoggedIn, authLoading]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      // 数据加载逻辑已移至各个组件中
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      setError(t('loadUserDataFailed'));
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

  // 显示加载状态直到认证完成
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">{t('loadingCenter')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">{t('loadFailed')}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
            <button onClick={loadUserData} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              {t('retry')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{t('profileTitle')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{t('profileSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('functionNav')}</h3>
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: t('overview'), icon: BarChart3, desc: t('overviewDesc') },
                  { id: 'stats', label: t('stats'), icon: Activity, desc: t('statsDesc') },
                  { id: 'invite', label: t('invite'), icon: Users, desc: t('inviteDesc') },
                  { id: 'achievements', label: t('achievementsNav'), icon: Trophy, desc: t('achievementsDesc') },
                  { id: 'settings', label: t('accountSettings'), icon: Settings, desc: t('accountSettingsDesc') },
                  { id: 'billing', label: t('billingNav'), icon: DollarSign, desc: t('billingDesc') }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md border border-primary-200 dark:border-primary-800'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs opacity-70">{tab.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6">
              
              {/* Tab Content */}
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'invite' && <InviteTab />}
              {activeTab === 'stats' && <StatsTab />}
              {activeTab === 'achievements' && <AchievementsTab />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'settings' && <SettingsTab />}


            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
