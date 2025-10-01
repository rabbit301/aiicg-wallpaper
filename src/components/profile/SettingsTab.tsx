'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import {
  User,
  Mail,
  Lock,
  Globe,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Save
} from 'lucide-react';

interface UserSettings {
  username: string;
  email: string;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showStats: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export default function SettingsTab() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    username: 'aiicg_user',
    email: 'user@example.com',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showStats: true,
    },
    theme: 'auto',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = (parentKey: string, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey as keyof UserSettings] as any),
        [childKey]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('settings.title')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('settings.description')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? t('settings.saving') : t('settings.saveSettings')}</span>
        </button>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('settings.profileInfo')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('settings.username')}
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => updateSettings('username', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('settings.email')}
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSettings('email', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('settings.timezone')}
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSettings('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('settings.timezone')}
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSettings('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Asia/Shanghai">{t('settings.timezoneChina')}</option>
              <option value="America/New_York">{t('settings.timezoneNewYork')}</option>
              <option value="Europe/London">{t('settings.timezoneLondon')}</option>
              <option value="Asia/Tokyo">{t('settings.timezoneTokyo')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('settings.notifications')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">{t('settings.emailNotifications')}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.emailNotificationsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateNestedSettings('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">{t('settings.pushNotifications')}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.pushNotificationsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => updateNestedSettings('notifications', 'push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">{t('settings.marketingEmails')}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.marketingEmailsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={(e) => updateNestedSettings('notifications', 'marketing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('settings.privacySettings')}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('settings.profileVisibility')}
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => updateNestedSettings('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="public">{t('settings.public')}</option>
              <option value="private">{t('settings.private')}</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">{t('settings.showEmail')}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.showEmailDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => updateNestedSettings('privacy', 'showEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">{t('settings.showStats')}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.showStatsDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showStats}
                onChange={(e) => updateNestedSettings('privacy', 'showStats', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('settings.appearanceSettings')}</h3>
        </div>
        
        <div className="space-y-6">
          {/* 主题切换 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              {t('settings.themeMode')}
            </label>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('settings.themeModeDesc')}
              </span>
            </div>
          </div>
          
          {/* 语言切换 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              {t('settings.languageSettings')}
            </label>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('settings.languageSettingsDesc')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Trash2 className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">{t('settings.dangerZone')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">{t('settings.exportData')}</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{t('settings.exportDataDesc')}</p>
            </div>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span>{t('settings.export')}</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">{t('settings.deleteAccount')}</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{t('settings.deleteAccountDesc')}</p>
            </div>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
              <span>{t('settings.deleteAccountButton')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 