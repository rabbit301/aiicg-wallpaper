'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';

interface SystemSettings {
  ai_provider?: 'fastgpt' | 'siliconflow' | 'fal';
  api_key?: string;
  rate_limit?: number;
  max_generations_per_day?: number;
  enable_email_verification?: boolean;
  enable_guest_mode?: boolean;
  storage_provider?: 'local' | 's3' | 'cloudflare';
  storage_quota_gb?: number;
}

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings>({
    ai_provider: 'fastgpt',
    api_key: '',
    rate_limit: 60,
    max_generations_per_day: 100,
    enable_email_verification: true,
    enable_guest_mode: false,
    storage_provider: 'local',
    storage_quota_gb: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // 加载设置
  const loadSettings = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res: any = await api.admin.getSettings();
      const data = res?.data?.settings || res?.settings || {};
      setSettings(prev => ({ ...prev, ...data }));
    } catch (e: any) {
      console.error('加载设置失败:', e);
      setMessageType('error');
      setMessage(e?.message || t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.admin.updateSettings(settings);
      setMessageType('success');
      setMessage(t('pages.admin.settings.saved'));
      // 3秒后自动清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessageType('error');
      setMessage(e?.message || t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">{t('pages.admin.settings.title')}</h1>
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('pages.admin.settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pages.admin.settings.description') || '配置系统参数和功能选项'}
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          messageType === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
            : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{messageType === 'success' ? '✓' : '✗'}</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI 生成设置 */}
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            {t('pages.admin.settings.sections.aiGeneration') || 'AI 生成设置'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('pages.admin.settings.provider')}
              </label>
              <select
                value={settings.ai_provider}
                onChange={(e) => updateSetting('ai_provider', e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fastgpt">FastGPT</option>
                <option value="siliconflow">SiliconFlow</option>
                <option value="fal">FAL</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('pages.admin.settings.providerHint') || '选择 AI 图像生成服务提供商'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.api_key}
                onChange={(e) => updateSetting('api_key', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="sk-..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('pages.admin.settings.apiKeyHint') || 'API 密钥将被安全存储'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('pages.admin.settings.maxGenerationsPerDay') || '每日生成上限'}
              </label>
              <input
                type="number"
                value={settings.max_generations_per_day}
                onChange={(e) => updateSetting('max_generations_per_day', parseInt(e.target.value || '0', 10))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="1000"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('pages.admin.settings.maxGenerationsHint') || '单个用户每天最多可生成的壁纸数量'}
              </p>
            </div>
          </div>
        </div>

        {/* 系统限制 */}
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            {t('pages.admin.settings.sections.systemLimits') || '系统限制'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('pages.admin.settings.rateLimit')}
              </label>
              <input
                type="number"
                value={settings.rate_limit}
                onChange={(e) => updateSetting('rate_limit', parseInt(e.target.value || '0', 10))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="1000"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('pages.admin.settings.rateLimitHint') || '每分钟允许的最大 API 请求数'}
              </p>
            </div>
          </div>
        </div>

        {/* 功能开关 */}
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎛️</span>
            {t('pages.admin.settings.sections.features') || '功能开关'}
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <div>
                <div className="font-medium">
                  {t('pages.admin.settings.enableEmailVerification') || '启用邮箱验证'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pages.admin.settings.emailVerificationHint') || '新用户注册时需要验证邮箱'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_email_verification}
                onChange={(e) => updateSetting('enable_email_verification', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <div>
                <div className="font-medium">
                  {t('pages.admin.settings.enableGuestMode') || '启用访客模式'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pages.admin.settings.guestModeHint') || '允许未登录用户浏览部分内容'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_guest_mode}
                onChange={(e) => updateSetting('enable_guest_mode', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* 存储设置 */}
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">💾</span>
            {t('pages.admin.settings.sections.storage') || '存储设置'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('pages.admin.settings.storageProvider') || '存储提供商'}
              </label>
              <select
                value={settings.storage_provider}
                onChange={(e) => updateSetting('storage_provider', e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="local">本地存储</option>
                <option value="s3">Amazon S3</option>
                <option value="cloudflare">Cloudflare R2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('pages.admin.settings.storageQuota') || '存储配额 (GB)'}
              </label>
              <input
                type="number"
                value={settings.storage_quota_gb}
                onChange={(e) => updateSetting('storage_quota_gb', parseInt(e.target.value || '0', 10))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="10000"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('pages.admin.settings.storageQuotaHint') || '系统总存储空间限制'}
              </p>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={loadSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {t('common.reset') || '重置'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('common.saving') || '保存中...'}
              </>
            ) : (
              <>
                <span>💾</span>
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
