'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Settings, User, Bell, Shield, Palette, Download, Loader2, Check } from 'lucide-react';
import AvatarSelector from '@/components/AvatarSelector';
import { useLanguage } from '@/contexts/LanguageContext';

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
  privacySettings?: {
    saveGeneratedImages: boolean;
    saveCompressedImages: boolean;
    showInHomepage: boolean;
    maxHomepageImages: number;
    allowPublicView: boolean;
  };
}

interface PrivacySettings {
  saveGeneratedImages: boolean;
  saveCompressedImages: boolean;
  showInHomepage: boolean;
  maxHomepageImages: number;
  allowPublicView: boolean;
}

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'downloads';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [savedMessage, setSavedMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    avatar: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'privacy') {
      loadPrivacySettings();
    }
  }, [activeTab]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          language: profileData.language || 'zh-CN',
          timezone: profileData.timezone || 'Asia/Shanghai',
          avatar: profileData.avatar || '' // 确保包含头像信息
        });
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/privacy');
      if (response.ok) {
        const settings = await response.json();
        setPrivacySettings(settings);
      }
    } catch (error) {
      console.error('加载隐私设置失败:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean | number) => {
    setPrivacySettings(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    setFormData(prev => ({ ...prev, avatar: avatarUrl })); // 同时更新formData
    setSavedMessage(t('settingsPage.avatarSelected'));
    setTimeout(() => setSavedMessage(''), 5000);
  };

  const handleAvatarUploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/user/avatar', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '头像上传失败');
    }

    const result = await response.json();
    return result.avatarUrl;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    try {
      // 合并formData和当前的头像信息
      const dataToSave = {
        ...formData,
        avatar: profile?.avatar // 确保包含当前的头像信息
      };

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setSavedMessage(t('settingsPage.saveSuccess'));
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setSavedMessage(t('settingsPage.saveFailed'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      setSavedMessage(t('settingsPage.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacySettings) return;

    setSaving(true);
    setSavedMessage('');

    try {
      const response = await fetch('/api/user/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(privacySettings)
      });

      if (response.ok) {
        setSavedMessage(t('settingsPage.privacySaveSuccess'));
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setSavedMessage(t('settingsPage.saveFailed'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      setSavedMessage(t('settingsPage.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', name: t('settingsPage.profile'), icon: User },
    { id: 'privacy', name: t('settingsPage.privacy'), icon: Shield },
    { id: 'notifications', name: t('settingsPage.notifications'), icon: Bell },
    { id: 'appearance', name: t('settingsPage.appearance'), icon: Palette },
    { id: 'downloads', name: t('settingsPage.downloads'), icon: Download },
  ];

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {t('settingsPage.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('settingsPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    {t('settingsPage.profileInfo')}
                  </h2>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Avatar */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        {t('settingsPage.avatar')}
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center overflow-hidden">
                          {profile?.avatar ? (
                            <img 
                              src={profile.avatar} 
                              alt={t('settingsPage.avatar')} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div>
                          <AvatarSelector
                            currentAvatar={profile?.avatar}
                            onAvatarChange={handleAvatarChange}
                            onUpload={handleAvatarUploadFile}
                          />
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {t('settingsPage.avatarTip')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('settingsPage.username')}
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                        placeholder={t('settingsPage.usernamePlaceholder')}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('settingsPage.email')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                        placeholder={t('settingsPage.emailPlaceholder')}
                      />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {t('settingsPage.emailTip')}
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('settingsPage.bio')}
                      </label>
                      <textarea
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder={t('settingsPage.bioPlaceholder')}
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                      />
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('settingsPage.language')}
                      </label>
                      <select 
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁体中文</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('settingsPage.timezone')}
                      </label>
                      <select 
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      >
                        <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                        <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                        <option value="America/New_York">纽约时间 (UTC-5)</option>
                        <option value="Europe/London">伦敦时间 (UTC+0)</option>
                      </select>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center space-x-2">
                        {savedMessage && (
                          <div className={`flex items-center space-x-1 text-sm ${
                            savedMessage.includes('成功') 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {savedMessage.includes('成功') && <Check className="h-4 w-4" />}
                            <span>{savedMessage}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('settingsPage.saving')}
                          </>
                        ) : (
                          t('settingsPage.saveChanges')
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && privacySettings && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    {t('settingsPage.privacySettings')}
                  </h2>

                  <form onSubmit={handleSavePrivacy} className="space-y-6">
                    {/* Save Generated Images */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {t('settingsPage.saveGenerated')}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t('settingsPage.saveGeneratedDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={privacySettings.saveGeneratedImages}
                          onChange={(e) => handlePrivacyChange('saveGeneratedImages', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Save Compressed Images */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {t('settingsPage.saveCompressed')}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t('settingsPage.saveCompressedDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={privacySettings.saveCompressedImages}
                          onChange={(e) => handlePrivacyChange('saveCompressedImages', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Show in Homepage */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {t('settingsPage.showInHomepage')}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t('settingsPage.showInHomepageDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={privacySettings.showInHomepage}
                          onChange={(e) => handlePrivacyChange('showInHomepage', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Max Homepage Images */}
                    {privacySettings.showInHomepage && (
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                        <div className="mb-3">
                          <div className="font-medium text-neutral-900 dark:text-white">
                            {t('settingsPage.maxHomepageImages')}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('settingsPage.maxHomepageImagesDesc')}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={privacySettings.maxHomepageImages}
                          onChange={(e) => handlePrivacyChange('maxHomepageImages', parseInt(e.target.value))}
                          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-600"
                        />
                        <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          <span>1张</span>
                          <span className="font-medium text-primary-600 dark:text-primary-400">
                            {privacySettings.maxHomepageImages}张
                          </span>
                          <span>12张</span>
                        </div>
                      </div>
                    )}

                    {/* Public View */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          允许公开查看
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          是否允许其他用户查看您的公开作品集
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={privacySettings.allowPublicView}
                          onChange={(e) => handlePrivacyChange('allowPublicView', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center space-x-2">
                        {savedMessage && (
                          <div className={`flex items-center space-x-1 text-sm ${
                            savedMessage.includes('成功') 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {savedMessage.includes('成功') && <Check className="h-4 w-4" />}
                            <span>{savedMessage}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          '保存设置'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Other Settings Tabs */}
              {activeTab !== 'profile' && activeTab !== 'privacy' && (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    功能开发中
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    该设置页面正在开发中，敬请期待
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
