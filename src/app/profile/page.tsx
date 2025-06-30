'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  User, 
  Image, 
  Download, 
  Calendar, 
  Settings, 
  Crown,
  Heart,
  Activity,
  Loader2,
  Eye,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Wallpaper } from '@/types';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  isVip: boolean;
  language: string;
  timezone: string;
}

interface UserStats {
  generatedWallpapers: number;
  downloads: number;
  compressedImages: number;
  daysActive: number;
}

interface UserActivity {
  id: string;
  type: 'generate' | 'download' | 'compress';
  title: string;
  timestamp: string;
  details?: any;
}

type TabType = 'works' | 'favorites' | 'activities';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('works');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userWallpapers, setUserWallpapers] = useState<Wallpaper[]>([]);
  const [favoriteWallpapers, setFavoriteWallpapers] = useState<Wallpaper[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'works') {
      loadUserWallpapers();
    } else if (activeTab === 'favorites') {
      loadFavoriteWallpapers();
    } else if (activeTab === 'activities') {
      loadUserActivities();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/stats')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWallpapers = async () => {
    try {
      const response = await fetch('/api/user/wallpapers');
      if (response.ok) {
        const wallpapers = await response.json();
        setUserWallpapers(wallpapers);
      }
    } catch (error) {
      console.error('加载用户壁纸失败:', error);
    }
  };

  const loadFavoriteWallpapers = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      if (response.ok) {
        const wallpapers = await response.json();
        setFavoriteWallpapers(wallpapers);
      }
    } catch (error) {
      console.error('加载收藏壁纸失败:', error);
    }
  };

  const loadUserActivities = async () => {
    try {
      const response = await fetch('/api/user/activities');
      if (response.ok) {
        const activitiesData = await response.json();
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('加载用户活动失败:', error);
    }
  };

  const handleDownload = async (wallpaper: Wallpaper) => {
    try {
      const response = await fetch(`/api/download/${wallpaper.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${wallpaper.title}.${wallpaper.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleToggleFavorite = async (wallpaperId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId })
      });

      if (response.ok) {
        const result = await response.json();
        // 重新加载收藏列表
        if (activeTab === 'favorites') {
          loadFavoriteWallpapers();
        }
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'generate':
        return <Image className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'compress':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'generate':
        return '生成了壁纸';
      case 'download':
        return '下载了壁纸';
      case 'compress':
        return '压缩了图片';
      default:
        return '进行了操作';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="用户头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              {profile?.isVip && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-500 to-warning-500 rounded-lg flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {profile?.username || '用户名'}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {profile?.email || 'user@example.com'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {profile?.isVip && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    <Crown className="h-4 w-4 mr-1" />
                    VIP会员
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                  <Calendar className="h-4 w-4 mr-1" />
                  加入于 {profile?.joinedAt ? formatDate(profile.joinedAt) : '2024年1月'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex space-x-3">
              <Link
                href="/settings"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                编辑资料
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats?.generatedWallpapers || 0}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              生成壁纸
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats?.downloads || 0}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              下载次数
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats?.compressedImages || 0}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              压缩图片
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats?.daysActive || 0}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              使用天数
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          {/* Tab Headers */}
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex space-x-8 px-8 pt-6">
              <button
                onClick={() => setActiveTab('works')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'works'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                我的作品
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                收藏夹
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'activities'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                使用记录
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* My Works Tab */}
            {activeTab === 'works' && (
              <div>
                {userWallpapers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {userWallpapers.map((wallpaper) => (
                      <div key={wallpaper.id} className="group relative bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden aspect-square hover:shadow-lg transition-all duration-200">
                        <img
                          src={wallpaper.thumbnailUrl}
                          alt={wallpaper.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setPreviewImage(wallpaper.imageUrl)}
                              className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(wallpaper)}
                              className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="text-white text-sm font-medium truncate">
                            {wallpaper.title}
                          </div>
                          <div className="text-white/80 text-xs">
                            {formatDate(wallpaper.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Image className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      还没有作品
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      去生成一些精美的壁纸吧！
                    </p>
                    <Link
                      href="/generate"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      开始创作
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                {favoriteWallpapers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteWallpapers.map((wallpaper) => (
                      <div key={wallpaper.id} className="group relative bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden aspect-square hover:shadow-lg transition-all duration-200">
                        <img
                          src={wallpaper.thumbnailUrl}
                          alt={wallpaper.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setPreviewImage(wallpaper.imageUrl)}
                              className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(wallpaper)}
                              className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFavorite(wallpaper.id)}
                              className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="text-white text-sm font-medium truncate">
                            {wallpaper.title}
                          </div>
                          <div className="text-white/80 text-xs">
                            {formatDate(wallpaper.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      还没有收藏
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      收藏一些喜欢的壁纸吧！
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {getActivityText(activity.type)}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                            {activity.title}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      还没有活动记录
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      开始使用应用来生成活动记录吧！
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200 z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={previewImage}
                alt="预览"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
